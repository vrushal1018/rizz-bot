const https = require('https');
const http = require('http');

class UptimeService {
  constructor() {
    this.services = [
      // Free uptime monitoring services
      'https://uptimerobot.com',
      'https://www.uptime.com',
      'https://pingdom.com',
      'https://statuscake.com',
      'https://www.monitor.us',
      'https://www.site24x7.com',
      'https://www.pagerduty.com',
      'https://www.datadoghq.com',
      'https://www.newrelic.com',
      'https://www.splunk.com'
    ];
    
    this.isRunning = false;
    this.interval = null;
  }

  // Start the uptime service
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🟢 Starting uptime service...');
    
    // Ping every 5 minutes to keep the service alive
    this.interval = setInterval(() => {
      this.pingServices();
    }, 300000); // 5 minutes
    
    // Initial ping
    this.pingServices();
  }

  // Stop the uptime service
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('🔴 Stopping uptime service...');
  }

  // Ping external services to keep the bot alive
  pingServices() {
    console.log('🏓 Pinging uptime services...');
    
    this.services.forEach(service => {
      this.pingService(service);
    });
  }

  // Ping a single service
  pingService(url) {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      console.log(`✅ Pinged ${url} - Status: ${res.statusCode}`);
    });

    req.on('error', (err) => {
      console.log(`❌ Failed to ping ${url}: ${err.message}`);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏰ Timeout pinging ${url}`);
    });
  }

  // Ping your own bot's health endpoint
  pingOwnHealth(port = 3000) {
    const url = `http://localhost:${port}/health`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log(`🏥 Health check - Status: ${health.status}, Uptime: ${Math.floor(health.uptime / 60000)}m`);
        } catch (e) {
          console.log(`🏥 Health check - Status: ${res.statusCode}`);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ Health check failed: ${err.message}`);
    });
  }
}

// Export the service
module.exports = UptimeService;

// If this file is run directly, start the service
if (require.main === module) {
  const uptimeService = new UptimeService();
  uptimeService.start();
  
  // Also ping own health endpoint every minute
  setInterval(() => {
    uptimeService.pingOwnHealth();
  }, 60000);
  
  console.log('🚀 Uptime service started! Press Ctrl+C to stop.');
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down uptime service...');
    uptimeService.stop();
    process.exit(0);
  });
}
