const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Test command to check if the bot is responding'),

  cooldown: 5,

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🏓 Pong!')
      .setDescription(`Bot latency: **${Date.now() - interaction.createdTimestamp}ms**`)
      .addFields(
        { name: '🤖 Bot Status', value: '✅ Online and responding', inline: true },
        { name: '📡 API Latency', value: `**${Math.round(interaction.client.ws.ping)}ms**`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}; 