const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('selfclean')
    .setDescription('Cleans the bot\'s own messages from a channel')
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of messages to check (max 100)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100)),

  cooldown: 10,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage messages.',
        ephemeral: true
      });
    }

    const limit = interaction.options.getInteger('limit') || 50;
    const channel = interaction.channel;

    try {
      await interaction.deferReply({ ephemeral: true });

      // Fetch messages
      const messages = await channel.messages.fetch({ limit: 100 });
      const botMessages = messages.filter(msg => msg.author.id === interaction.client.user.id);

      if (botMessages.size === 0) {
        return interaction.editReply('✅ No bot messages found in the recent messages.');
      }

      // Delete bot messages
      await channel.bulkDelete(botMessages);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🧹 Self Clean Complete')
        .setDescription(`Successfully cleaned **${botMessages.size}** bot messages from ${channel.name}`)
        .addFields(
          { name: '📊 Messages Deleted', value: `${botMessages.size}`, inline: true },
          { name: '📅 Cleaned At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in selfclean command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while cleaning messages.',
        ephemeral: true
      });
    }
  }
}; 