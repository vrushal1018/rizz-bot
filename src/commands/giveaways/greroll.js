const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('greroll')
    .setDescription('Pick a new winner for a concluded giveaway')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('Message ID of the giveaway to reroll')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of new winners to pick (1-5)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(5))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for rerolling')
        .setRequired(false)),

  cooldown: 15,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: '❌ You do not have permission to reroll giveaways.',
        ephemeral: true
      });
    }

    try {
      const messageId = interaction.options.getString('message_id');
      const winnerCount = interaction.options.getInteger('winners') || 1;
      const reason = interaction.options.getString('reason') || 'No reason provided';

      // This is a placeholder implementation
      // In a real bot, you would fetch giveaway data from a database
      const giveawayData = {
        id: messageId,
        prize: 'Discord Nitro Classic',
        originalWinners: ['123456789', '987654321'],
        participants: [
          '123456789',
          '987654321',
          '456789123',
          '789123456',
          '321654987'
        ],
        ended: true,
        endTime: Date.now() - 3600000 // 1 hour ago
      };

      if (!giveawayData.ended) {
        return interaction.reply({
          content: '❌ This giveaway has not ended yet.',
          ephemeral: true
        });
      }

      if (giveawayData.participants.length === 0) {
        return interaction.reply({
          content: '❌ No participants found for this giveaway.',
          ephemeral: true
        });
      }

      // Pick new winners
      const shuffledParticipants = [...giveawayData.participants].sort(() => Math.random() - 0.5);
      const newWinnerIds = shuffledParticipants.slice(0, Math.min(winnerCount, shuffledParticipants.length));

      // Get user objects for winners
      const newWinners = [];
      for (const winnerId of newWinnerIds) {
        try {
          const user = await interaction.client.users.fetch(winnerId);
          newWinners.push(user);
        } catch (error) {
          console.error(`Could not fetch user ${winnerId}:`, error);
        }
      }

      if (newWinners.length === 0) {
        return interaction.reply({
          content: '❌ Could not fetch any valid winners.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 GIVEAWAY REROLL')
        .setDescription(`**${giveawayData.prize}**`)
        .addFields(
          { name: '🏆 New Winners', value: newWinners.map(w => `<@${w.id}>`).join('\n'), inline: false },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '👮 Rerolled By', value: interaction.user.tag, inline: true },
          { name: '📅 Rerolled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      // Mention winners
      const winnerMentions = newWinners.map(w => `<@${w.id}>`).join(' ');
      const message = `🎉 Congratulations ${winnerMentions}! You won the reroll for **${giveawayData.prize}**!`;

      await interaction.channel.send({ content: message, embeds: [embed] });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Giveaway Rerolled')
        .setDescription(`Successfully rerolled giveaway for **${giveawayData.prize}**`)
        .addFields(
          { name: '🎁 Prize', value: giveawayData.prize, inline: true },
          { name: '🏆 New Winners', value: `${newWinners.length}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '👮 Rerolled By', value: interaction.user.tag, inline: true },
          { name: '📅 Rerolled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Error in greroll command:', error);
      await interaction.reply({
        content: '❌ An error occurred while rerolling the giveaway.',
        ephemeral: true
      });
    }
  }
}; 