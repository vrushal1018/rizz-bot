# 🏆 Quotient Bot – The Ultimate Esports Scrim & Tournament Manager

Quotient Bot is a robust, production-ready Discord bot designed specifically for esports communities, scrim organizers, and tournament hosts who want to simplify and automate match coordination inside their server. Built with scalability, speed, and ease-of-use in mind, Quotient Bot takes the hassle out of managing competitive events — allowing moderators and teams to focus on performance, not logistics.

## 🌟 Features

### ✅ Team Registration with Auto Slot Assignment
- Teams can register using a single command with team name and 5 player mentions
- Automatic slot number assignment prevents conflicts
- Smooth check-in system for organizers

### 🗓️ Scrim Scheduling System
- Server members can schedule upcoming scrims with other registered teams
- Automatic creation of dedicated text and voice channels
- Temporary permissions assignment and match alerts

### 🎮 Match Lobby Creation
- Automatic generation of private lobbies (text/voice) for each team
- Channels are removed or locked after match ends to keep server clean
- Secure access control for match participants

### 📊 Leaderboard & Performance Tracking
- Admins or referees can submit match results using simple commands
- Tracks team wins, losses, match points, and auto-generates live leaderboard
- Helps players and fans track performance over time

### 🎫 Support Ticket System
- Players can open support tickets for various issues
- Private channels between players and moderators
- Manual or command-based ticket closure

### 🛠️ Moderation Commands
- Helpful tools for admins: ban, kick, warn, and clear
- Effective moderation of scrim environment
- Handle server discipline without needing extra bots

### 🧾 Slot List & Match Summary
- View current slot list with team names, players, and slot numbers
- Generate detailed match summaries and results logs
- Transparency and reporting capabilities

### 🌐 Optional Web Dashboard Integration
- Web-based admin dashboard for advanced users
- Manage team data, match history, and server analytics
- Browser-based GUI linked to the bot

### 💾 Database Support (MongoDB)
- All data stored securely using production-grade database
- Persistence across sessions and easy scalability
- Support for large tournaments

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB database (local or Atlas)
- Discord Bot Token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quotient-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   DISCORD_GUILD_ID=your_discord_guild_id_here
   MONGODB_URI=mongodb://localhost:27017/quotient_bot
   WEB_DASHBOARD_ENABLED=true
   WEB_DASHBOARD_PORT=3000
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

## 📋 Commands Overview

### Team Management
- `/registerteam` - Register your team with 5 players
- `/slotlist` - View all registered teams and slot assignments

### Match Management
- `/schedule` - Schedule a scrim match with another team
- `/submitresult` - Submit match results (referees and captains only)
- `/matchsummary` - Generate detailed match reports

### Statistics & Leaderboards
- `/leaderboard` - View current team rankings and statistics

### Support System
- `/ticket` - Create a support ticket for various issues

### Moderation
- `/ban` - Ban a user from the server
- `/kick` - Kick a user from the server
- `/clear` - Delete multiple messages from a channel

## 🔧 Configuration

### Discord Bot Setup
1. Create a new Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot and copy the token
3. Set up OAuth2 with required permissions:
   - Manage Channels
   - Send Messages
   - Read Message History
   - Connect
   - Speak
   - Manage Roles
   - Ban Members
   - Kick Members
   - Manage Messages

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `quotient_bot`
3. Update the `MONGODB_URI` in your `.env` file

### Server Setup
1. Create categories for tickets and lobbies
2. Set the category IDs in your `.env` file:
   ```env
   TICKET_CATEGORY_ID=your_ticket_category_id
   LOBBY_CATEGORY_ID=your_lobby_category_id
   ```

## 🎮 Usage Examples

### Registering a Team
```
/registerteam teamname:Team Alpha player1:@captain player2:@player1 player3:@player2 player4:@player3 player5:@player4
```

### Scheduling a Match
```
/schedule opponent:Team Beta date:2024-01-15 time:20:00 notes:Best of 3 series
```

### Submitting Results
```
/submitresult matchid:abc12345 winner:team1 team1score:2 team2score:1 notes:Great match!
```

### Creating a Support Ticket
```
/ticket category:dispute subject:Match Dispute description:Team Beta is claiming unfair play...
```

## 🌐 Web Dashboard

The optional web dashboard provides a browser-based interface for managing:
- Team data and statistics
- Match history and results
- Server analytics
- User management

Access the dashboard at `http://localhost:3000` when enabled.

## 🔒 Security Features

- OAuth2 authorization for secure access
- Rate limiting on web dashboard
- Input validation and sanitization
- Permission-based command access
- Secure database connections

## 📊 Database Schema

### Teams Collection
- Team name, slot number, players
- Win/loss statistics and points
- Registration timestamps

### Matches Collection
- Match details, teams, scheduling
- Results and statistics
- Channel management

### Tickets Collection
- Support ticket information
- Status tracking and resolution
- User and moderator interactions

## 🛠️ Development

### Project Structure
```
src/
├── commands/          # Slash commands
│   ├── teams/        # Team management
│   ├── matches/      # Match management
│   ├── stats/        # Statistics and leaderboards
│   ├── support/      # Support system
│   └── moderation/   # Moderation tools
├── events/           # Discord events
├── handlers/         # Command and event handlers
├── models/           # Database models
└── index.js          # Main entry point
```

### Adding New Commands
1. Create a new file in the appropriate command directory
2. Export an object with `data` (SlashCommandBuilder) and `execute` function
3. The command will be automatically loaded on startup

### Database Models
- `Team.js` - Team registration and statistics
- `Match.js` - Match scheduling and results
- `Ticket.js` - Support ticket management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord server
- Check the documentation

## 🏆 Credits

Quotient Bot is built with:
- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM

---

**🏆 Quotient Bot - Empowering Esports Communities Since 2024** 