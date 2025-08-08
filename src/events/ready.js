const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.tag} is online!`);
    
    // Set bot status
    client.user.setPresence({
      activities: [{ 
        name: '🏆 Esports Scrims & Tournaments', 
        type: ActivityType.Watching 
      }],
      status: 'online'
    });
    
    console.log('🏆 Quotient Bot is ready to manage your esports community!');
  }
}; 