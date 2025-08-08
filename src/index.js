require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import command handlers
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

// Import database models
const Team = require('./models/Team');
const Match = require('./models/Match');
const Ticket = require('./models/Ticket');

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

// Web Dashboard (Optional)
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
    
    console.log('🏆 Quotient Bot is ready!');
  } catch (error) {
    console.error('❌ Bot initialization error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Quotient Bot...');
  
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