const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands and their descriptions'),

  cooldown: 10,

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('🏆 Quotient Bot - Help')
      .setDescription('Here are all the available commands for managing your esports community.')
      .addFields(
        {
          name: '👥 Team Management',
          value: '`/registerteam` - Register your team with 5 players\n`/slotlist` - View all registered teams and slot assignments',
          inline: false
        },
        {
          name: '🎮 Match Management',
          value: '`/schedule` - Schedule a scrim match with another team\n`/submitresult` - Submit match results (referees and captains only)\n`/matchsummary` - Generate detailed match reports',
          inline: false
        },
        {
          name: '📊 Statistics & Leaderboards',
          value: '`/leaderboard` - View current team rankings and statistics',
          inline: false
        },
        {
          name: '🎫 Support System',
          value: '`/ticket` - Create a support ticket for various issues',
          inline: false
        },
        {
          name: '🛠️ Moderation',
          value: '`/ban` - Ban a user from the server\n`/kick` - Kick a user from the server\n`/clear` - Delete multiple messages from a channel',
          inline: false
        },
        {
          name: '❓ Utility',
          value: '`/help` - Show this help message',
          inline: false
        }
      )
      .addFields({
        name: '📋 Quick Start Guide',
        value: '1. Use `/registerteam` to register your team\n2. Use `/slotlist` to see other teams\n3. Use `/schedule` to book matches\n4. Use `/submitresult` after matches\n5. Use `/leaderboard` to track rankings',
        inline: false
      })
      .setFooter({ text: 'For detailed documentation, check the README file' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 0 });
  }
}; 