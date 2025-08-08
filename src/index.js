require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const http = require('http');

// Import command handlers
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

// Import database models
const Team = require('./models/Team');
const Match = require('./models/Match');
const Ticket = require('./models/Ticket');

// Import uptime service
const UptimeService = require('../uptime-service');

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ]
});

// Create command collection
client.commands = new Collection();
client.cooldowns = new Collection();

// Uptime tracking
let botStartTime = Date.now();
let lastHeartbeat = Date.now();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
let uptimeService = null;

// Database connection
async function connectDatabase() {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📡 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Uptime monitoring function
function startUptimeMonitoring() {
  // Health check endpoint
  setInterval(() => {
    const uptime = Date.now() - botStartTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(`🟢 Bot Uptime: ${hours}h ${minutes}m | Status: Online`);
    lastHeartbeat = Date.now();
  }, 300000); // Log every 5 minutes

  // Auto-reconnect if connection is lost
  setInterval(() => {
    if (!client.isReady()) {
      console.log('⚠️ Bot connection lost, attempting to reconnect...');
      reconnectBot();
    }
  }, 60000); // Check every minute

  // Start external uptime service
  if (process.env.ENABLE_UPTIME_SERVICE === 'true') {
    uptimeService = new UptimeService();
    uptimeService.start();
    console.log('🚀 External uptime service started');
  }
}

// Reconnection function
async function reconnectBot() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Max reconnection attempts reached. Restarting process...');
    process.exit(1);
  }

  try {
    reconnectAttempts++;
    console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    
    await client.destroy();
    await client.login(process.env.DISCORD_TOKEN);
    
    console.log('✅ Reconnection successful!');
    reconnectAttempts = 0;
  } catch (error) {
    console.error('❌ Reconnection failed:', error);
    setTimeout(reconnectBot, 5000); // Retry after 5 seconds
  }
}

// Web Dashboard with enhanced uptime features
let webServer = null;
if (process.env.WEB_DASHBOARD_ENABLED === 'true') {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  app.use(cors());
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
  
  // Health check endpoint for uptime monitors
  app.get('/health', (req, res) => {
    const uptime = Date.now() - botStartTime;
    const status = client.isReady() ? 'online' : 'offline';
    
    res.json({
      status: status,
      uptime: uptime,
      botReady: client.isReady(),
      guilds: client.guilds?.cache?.size || 0,
      ping: client.ws?.ping || 0,
      lastHeartbeat: lastHeartbeat,
      timestamp: Date.now()
    });
  });

  // Simple ping endpoint for uptime services
  app.get('/ping', (req, res) => {
    res.status(200).send('pong');
  });

  // Root endpoint
  app.get('/', (req, res) => {
    const uptime = Date.now() - botStartTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    res.json({
      message: 'Quotient Bot is running!',
      status: client.isReady() ? 'online' : 'offline',
      uptime: `${hours}h ${minutes}m`,
      guilds: client.guilds?.cache?.size || 0,
      ping: client.ws?.ping || 0
    });
  });
  
  // Dashboard routes
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await Team.find().sort({ slotNumber: 1 });
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });
  
  app.get('/api/matches', async (req, res) => {
    try {
      const matches = await Match.find().sort({ createdAt: -1 }).limit(50);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });
  
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const teams = await Team.find().sort({ wins: -1, losses: 1 });
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });
  
  const PORT = process.env.WEB_DASHBOARD_PORT || 3000;
  webServer = app.listen(PORT, () => {
    console.log(`🌐 Web dashboard running on port ${PORT}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🏓 Ping endpoint available at: http://localhost:${PORT}/ping`);
  });
}

// Initialize bot
async function initializeBot() {
  try {
    // Connect to database first
    await connectDatabase();
    
    // Load commands and events
    await loadCommands(client);
    await loadEvents(client);
    
    // Login to Discord
    console.log('🤖 Discord Token:', process.env.DISCORD_TOKEN ? 'Set' : 'Not set');
    console.log('🆔 Discord Client ID:', process.env.DISCORD_CLIENT_ID ? 'Set' : 'Not set');
    await client.login(process.env.DISCORD_TOKEN);
    
    // Start uptime monitoring
    startUptimeMonitoring();
    
    console.log('🏆 Quotient Bot is ready!');
    console.log('🟢 Uptime monitoring enabled');
  } catch (error) {
    console.error('❌ Bot initialization error:', error);
    process.exit(1);
  }
}

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  // Don't exit immediately, let the reconnection logic handle it
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Quotient Bot...');
  
  if (uptimeService) {
    uptimeService.stop();
  }
  
  if (webServer) {
    webServer.close();
  }
  
  await mongoose.connection.close();
  client.destroy();
  
  console.log('✅ Bot shutdown complete');
  process.exit(0);
});

// Start the bot
initializeBot(); 