const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Simple test command to verify bot is working'),

  cooldown: 1,

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Bot Test Successful!')
        .setDescription('The bot is working correctly and responding to interactions.')
        .addFields(
          { name: '🤖 Bot Name', value: interaction.client.user.username, inline: true },
          { name: '🆔 Bot ID', value: interaction.client.user.id, inline: true },
          { name: '📡 API Latency', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Test command error:', error);
      await interaction.reply({ 
        content: '❌ Test command failed. Check console for details.',
        ephemeral: true 
      });
    }
  }
}; 