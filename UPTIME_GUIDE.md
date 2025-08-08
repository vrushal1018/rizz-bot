# 🟢 24/7 Uptime Guide for Quotient Bot

This guide explains all the uptime features implemented to keep your Discord bot running 24/7.

## 🚀 Built-in Uptime Features

### 1. **Automatic Reconnection**
- The bot automatically detects when the Discord connection is lost
- Attempts to reconnect up to 10 times with 5-second intervals
- If reconnection fails, the process restarts automatically

### 2. **Health Monitoring**
- Real-time uptime tracking and logging
- Health check endpoints for external monitoring
- Automatic heartbeat monitoring every 5 minutes

### 3. **Web Dashboard Health Endpoints**
When `WEB_DASHBOARD_ENABLED=true`, the following endpoints are available:

- **`/health`** - Detailed health status
- **`/ping`** - Simple ping response
- **`/`** - Bot status overview

## 🌐 External Uptime Services

### Free Uptime Monitoring Services
You can use these services to monitor your bot:

1. **UptimeRobot** (https://uptimerobot.com)
   - Free tier: 50 monitors
   - Set URL to: `http://your-domain:3000/health`

2. **Pingdom** (https://pingdom.com)
   - Free tier: 1 monitor
   - Set URL to: `http://your-domain:3000/ping`

3. **StatusCake** (https://statuscake.com)
   - Free tier: 10 monitors
   - Set URL to: `http://your-domain:3000/health`

4. **Uptime.com** (https://uptime.com)
   - Free tier: 10 monitors
   - Set URL to: `http://your-domain:3000/ping`

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Enable uptime service
ENABLE_UPTIME_SERVICE=true

# Uptime check interval (in milliseconds)
UPTIME_CHECK_INTERVAL=300000

# Maximum reconnection attempts
RECONNECT_MAX_ATTEMPTS=10

# Web dashboard (required for health endpoints)
WEB_DASHBOARD_ENABLED=true
WEB_DASHBOARD_PORT=3000
```

## 🏃‍♂️ Running the Bot

### Method 1: Standard Start
```bash
npm start
```

### Method 2: Development Mode
```bash
npm run dev
```

### Method 3: Separate Uptime Service
```bash
# Terminal 1: Start the bot
npm start

# Terminal 2: Start uptime service
npm run uptime
```

## 📊 Monitoring Your Bot

### Health Check Response
```json
{
  "status": "online",
  "uptime": 3600000,
  "botReady": true,
  "guilds": 5,
  "ping": 45,
  "lastHeartbeat": 1640995200000,
  "timestamp": 1640995200000
}
```

### Status Endpoints
- **Online**: Bot is connected to Discord
- **Offline**: Bot is disconnected or starting up

## 🛠️ Deployment Options

### 1. **Railway** (Recommended)
- Automatic restarts
- Built-in monitoring
- Easy deployment

### 2. **Heroku**
- Free tier available
- Automatic restarts
- Add-ons for monitoring

### 3. **DigitalOcean App Platform**
- Reliable uptime
- Automatic scaling
- Built-in monitoring

### 4. **VPS (DigitalOcean, AWS, etc.)**
- Use PM2 for process management
- Set up systemd service
- Configure automatic restarts

## 🔧 PM2 Configuration (VPS)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'quotient-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🚨 Troubleshooting

### Bot Keeps Disconnecting
1. Check your internet connection
2. Verify Discord token is valid
3. Check if Discord API is having issues
4. Review bot permissions

### Health Endpoints Not Working
1. Ensure `WEB_DASHBOARD_ENABLED=true`
2. Check if port 3000 is accessible
3. Verify firewall settings

### High Memory Usage
1. Monitor with `pm2 monit`
2. Restart if memory exceeds 1GB
3. Check for memory leaks in commands

## 📈 Monitoring Dashboard

Access your bot's status at:
- `http://your-domain:3000/` - Overview
- `http://your-domain:3000/health` - Detailed health
- `http://your-domain:3000/ping` - Simple ping

## 🔄 Automatic Restart Strategies

### 1. **Process Manager (PM2)**
```bash
pm2 start src/index.js --name "quotient-bot"
pm2 save
pm2 startup
```

### 2. **Systemd Service**
Create `/etc/systemd/system/quotient-bot.service`:
```ini
[Unit]
Description=Quotient Discord Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/bot
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable quotient-bot
sudo systemctl start quotient-bot
```

### 3. **Docker with Restart Policy**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Run with restart policy:
```bash
docker run -d --restart unless-stopped -p 3000:3000 quotient-bot
```

## 🎯 Best Practices

1. **Use Multiple Uptime Services**: Don't rely on just one
2. **Monitor Logs**: Set up log monitoring
3. **Backup Configuration**: Keep your `.env` file backed up
4. **Test Restarts**: Regularly test your restart procedures
5. **Monitor Resources**: Keep an eye on CPU and memory usage

## 📞 Support

If you're having issues with uptime:
1. Check the logs for error messages
2. Verify your Discord bot token
3. Test the health endpoints manually
4. Review your hosting provider's uptime guarantees

---

**Remember**: The best uptime strategy combines multiple approaches:
- Built-in reconnection logic
- External uptime monitoring
- Process management (PM2/systemd)
- Reliable hosting provider
