const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mycodes')
    .setDescription('Lists available redeem codes for the user')
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter codes by status')
        .setRequired(false)
        .addChoices(
          { name: 'All Codes', value: 'all' },
          { name: 'Available Codes', value: 'available' },
          { name: 'Used Codes', value: 'used' },
          { name: 'Expired Codes', value: 'expired' }
        )),

  cooldown: 15,

  async execute(interaction) {
    try {
      const filter = interaction.options.getString('filter') || 'all';
      const userId = interaction.user.id;

      // This is a placeholder implementation
      // In a real bot, you would fetch user's codes from a database
      const userCodes = [
        {
          code: 'WELCOME2024',
          type: 'premium',
          status: 'available',
          description: 'Welcome bonus for new users',
          expires: '2024-12-31',
          rewards: 'Premium features for 7 days',
          obtainedAt: '2024-01-15'
        },
        {
          code: 'EVENT2024',
          type: 'event',
          status: 'used',
          description: 'Special event code',
          expires: '2024-06-30',
          rewards: 'Exclusive event rewards',
          obtainedAt: '2024-01-10',
          usedAt: '2024-01-12'
        },
        {
          code: 'REWARD123',
          type: 'reward',
          status: 'expired',
          description: 'General reward code',
          expires: '2024-01-01',
          rewards: 'Bonus points and perks',
          obtainedAt: '2023-12-20'
        }
      ];

      let filteredCodes = userCodes;
      if (filter !== 'all') {
        filteredCodes = userCodes.filter(code => code.status === filter);
      }

      if (filteredCodes.length === 0) {
        return interaction.reply({
          content: `❌ You don't have any ${filter} codes.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎫 Your Redemption Codes')
        .setDescription(`Here are your ${filter === 'all' ? '' : filter} codes:`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      filteredCodes.forEach((code, index) => {
        const statusEmoji = {
          'available': '🟢',
          'used': '🔴',
          'expired': '⚫'
        };

        const statusText = {
          'available': 'Available',
          'used': 'Used',
          'expired': 'Expired'
        };

        embed.addFields({
          name: `${statusEmoji[code.status]} Code ${index + 1}: ${code.code}`,
          value: `**Status:** ${statusText[code.status]}\n**Description:** ${code.description}\n**Rewards:** ${code.rewards}\n**Expires:** ${code.expires}\n**Type:** ${code.type}\n**Obtained:** ${code.obtainedAt}${code.usedAt ? `\n**Used:** ${code.usedAt}` : ''}`,
          inline: false
        });
      });

      embed.setFooter({ text: `Total codes: ${filteredCodes.length}` });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in mycodes command:', error);
      await interaction.reply({
        content: '❌ An error occurred while retrieving your codes.',
        ephemeral: true
      });
    }
  }
}; 