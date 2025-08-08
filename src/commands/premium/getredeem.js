const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getredeem')
    .setDescription('Retrieve redemption codes or special offers')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of redemption to retrieve')
        .setRequired(false)
        .addChoices(
          { name: 'All Available Codes', value: 'all' },
          { name: 'Premium Codes', value: 'premium' },
          { name: 'Event Codes', value: 'event' },
          { name: 'Reward Codes', value: 'reward' }
        )),

  cooldown: 30,

  async execute(interaction) {
    try {
      const type = interaction.options.getString('type') || 'all';

      // This is a placeholder implementation
      // In a real bot, you would fetch codes from a database
      const availableCodes = [
        {
          code: 'WELCOME2024',
          type: 'premium',
          description: 'Welcome bonus for new users',
          expires: '2024-12-31',
          rewards: 'Premium features for 7 days'
        },
        {
          code: 'EVENT2024',
          type: 'event',
          description: 'Special event code',
          expires: '2024-06-30',
          rewards: 'Exclusive event rewards'
        },
        {
          code: 'REWARD123',
          type: 'reward',
          description: 'General reward code',
          expires: '2024-08-15',
          rewards: 'Bonus points and perks'
        }
      ];

      let filteredCodes = availableCodes;
      if (type !== 'all') {
        filteredCodes = availableCodes.filter(code => code.type === type);
      }

      if (filteredCodes.length === 0) {
        return interaction.reply({
          content: `❌ No ${type} codes are currently available.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎁 Available Redemption Codes')
        .setDescription(`Here are the available ${type === 'all' ? '' : type} codes:`)
        .setTimestamp();

      filteredCodes.forEach((code, index) => {
        embed.addFields({
          name: `🎫 Code ${index + 1}: ${code.code}`,
          value: `**Description:** ${code.description}\n**Rewards:** ${code.rewards}\n**Expires:** ${code.expires}\n**Type:** ${code.type}`,
          inline: false
        });
      });

      embed.setFooter({ text: 'Use /redeem <code> to redeem a code' });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in getredeem command:', error);
      await interaction.reply({
        content: '❌ An error occurred while retrieving redemption codes.',
        ephemeral: true
      });
    }
  }
}; 