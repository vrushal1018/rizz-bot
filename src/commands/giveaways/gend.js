const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gend')
    .setDescription('End an active giveaway')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('Message ID of the giveaway to end')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ending the giveaway early')
        .setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: '❌ You do not have permission to end giveaways.',
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
        winners: 2,
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

      // Pick winners
      const shuffledParticipants = [...giveawayData.participants].sort(() => Math.random() - 0.5);
      const winnerIds = shuffledParticipants.slice(0, Math.min(giveawayData.winners, shuffledParticipants.length));

      // Get user objects for winners
      const winners = [];
      for (const winnerId of winnerIds) {
        try {
          const user = await interaction.client.users.fetch(winnerId);
          winners.push(user);
        } catch (error) {
          console.error(`Could not fetch user ${winnerId}:`, error);
        }
      }

      // Mark giveaway as ended
      giveawayData.ended = true;

      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle('🎉 GIVEAWAY ENDED')
        .setDescription(`**${giveawayData.prize}**`)
        .addFields(
          { name: '🏆 Winners', value: winners.length > 0 ? winners.map(w => `<@${w.id}>`).join('\n') : 'No valid winners found', inline: false },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '👮 Ended By', value: interaction.user.tag, inline: true },
          { name: '📅 Ended At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      // Mention winners if any
      if (winners.length > 0) {
        const winnerMentions = winners.map(w => `<@${w.id}>`).join(' ');
        const message = `🎉 Congratulations ${winnerMentions}! You won **${giveawayData.prize}**!`;
        await interaction.channel.send({ content: message, embeds: [embed] });
      } else {
        await interaction.channel.send({ embeds: [embed] });
      }

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Giveaway Ended')
        .setDescription(`Successfully ended giveaway for **${giveawayData.prize}**`)
        .addFields(
          { name: '🎁 Prize', value: giveawayData.prize, inline: true },
          { name: '🏆 Winners', value: `${winners.length}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '👮 Ended By', value: interaction.user.tag, inline: true },
          { name: '📅 Ended At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Error in gend command:', error);
      await interaction.reply({
        content: '❌ An error occurred while ending the giveaway.',
        ephemeral: true
      });
    }
  }
}; 