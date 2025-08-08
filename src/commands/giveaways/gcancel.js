const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gcancel')
    .setDescription('Cancel an ongoing giveaway')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('Message ID of the giveaway to cancel')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for cancelling the giveaway')
        .setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: '❌ You do not have permission to cancel giveaways.',
        ephemeral: true
      });
    }

    try {
      const messageId = interaction.options.getString('message_id');
      const reason = interaction.options.getString('reason') || 'No reason provided';

      // This is a placeholder implementation
      // In a real bot, you would fetch giveaway data from a database
      const giveawayData = {
        id: messageId,
        prize: 'Discord Nitro Classic',
        winners: 1,
        participants: [
          '123456789',
          '987654321',
          '456789123',
          '789123456',
          '321654987'
        ],
        ended: false,
        endTime: Date.now() + 3600000 // 1 hour from now
      };

      if (giveawayData.ended) {
        return interaction.reply({
          content: '❌ This giveaway has already ended.',
          ephemeral: true
        });
      }

      // Mark giveaway as cancelled
      giveawayData.ended = true;
      giveawayData.cancelled = true;

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ GIVEAWAY CANCELLED')
        .setDescription(`**${giveawayData.prize}**`)
        .addFields(
          { name: '📝 Reason', value: reason, inline: false },
          { name: '👥 Participants', value: `${giveawayData.participants.length}`, inline: true },
          { name: '👮 Cancelled By', value: interaction.user.tag, inline: true },
          { name: '📅 Cancelled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Giveaway Cancelled')
        .setDescription(`Successfully cancelled giveaway for **${giveawayData.prize}**`)
        .addFields(
          { name: '🎁 Prize', value: giveawayData.prize, inline: true },
          { name: '👥 Participants', value: `${giveawayData.participants.length}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '👮 Cancelled By', value: interaction.user.tag, inline: true },
          { name: '📅 Cancelled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Error in gcancel command:', error);
      await interaction.reply({
        content: '❌ An error occurred while cancelling the giveaway.',
        ephemeral: true
      });
    }
  }
}; 