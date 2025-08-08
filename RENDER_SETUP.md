# 🚀 Render Deployment Setup for Your Bot

## ✅ Your MongoDB Atlas Configuration

**Cluster**: `cluster0.ejzprfc.mongodb.net`  
**Username**: `vrushpachupate`  
**Database**: `quotient_bot`

## 🔧 Step 1: Complete MongoDB Atlas Setup

### 1.1 Set Database Password
You need to set a password for your MongoDB user:
1. Go to MongoDB Atlas dashboard
2. Navigate to "Database Access"
3. Click on your user `vrushpachupate`
4. Click "Edit"
5. Set a password and save

### 1.2 Network Access
1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Render)
4. Click "Confirm"

## 🚀 Step 2: Deploy to Render

### 2.1 Connect to Render
1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository: `vrushal1018/rizz-bot`

### 2.2 Configure Service
- **Name**: `quotient-bot`
- **Environment**: `Node`
- **Branch**: `master`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Set Environment Variables
In Render dashboard, add these variables:

#### **Required Variables:**
```
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_discord_guild_id
MONGODB_URI=mongodb+srv://vrushpachupate:vrushal05@cluster0.ejzprfc.mongodb.net/quotient_bot?retryWrites=true&w=majority&appName=Cluster0
```

#### **Optional Variables:**
```
WEB_DASHBOARD_ENABLED=true
WEB_DASHBOARD_PORT=10000
WEB_DASHBOARD_SECRET=your_secret_here
ENABLE_UPTIME_SERVICE=true
BOT_PREFIX=!
DEFAULT_SLOT_LIMIT=16
MATCH_DURATION_MINUTES=120
NODE_ENV=production
```

## 🔍 Step 3: Test Your Deployment

### 3.1 Check Logs
After deployment, check Render logs for:
- ✅ "Connected to MongoDB"
- ✅ "Quotient Bot is ready!"

### 3.2 Test Health Endpoints
Your bot will be available at:
- `https://your-app-name.onrender.com/` - Bot status
- `https://your-app-name.onrender.com/health` - Health check
- `https://your-app-name.onrender.com/ping` - Ping endpoint

### 3.3 Test Discord Bot
1. Go to your Discord server
2. Try `/ping` command
3. Check if bot responds

## 🛠️ Troubleshooting

### MongoDB Connection Error
**If you get connection errors:**
1. Verify your password is set in MongoDB Atlas
2. Check if network access allows all IPs (0.0.0.0/0)
3. Ensure the connection string is exactly as shown above

### Discord Bot Issues
**If bot doesn't respond:**
1. Verify Discord token is correct
2. Check bot permissions in Discord
3. Ensure bot is invited to your server

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "online",
  "uptime": 3600000,
  "botReady": true,
  "guilds": 1,
  "ping": 45
}
```

### Uptime Monitoring
Set up free monitoring:
- **UptimeRobot**: `https://your-app-name.onrender.com/health`
- **Pingdom**: `https://your-app-name.onrender.com/ping`

## 🎯 Your Specific Configuration

**MongoDB Atlas:**
- Cluster: `cluster0.ejzprfc.mongodb.net`
- Username: `vrushpachupate`
- Database: `quotient_bot`

**Render:**
- Port: `10000`
- Auto-restart: Enabled
- Free tier: 750 hours/month

---

**Once deployed, your bot will run 24/7 with automatic restarts!** 🎉
