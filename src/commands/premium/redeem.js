const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('Redeem a code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code to redeem')
        .setRequired(true)),

  cooldown: 10,

  async execute(interaction) {
    try {
      const code = interaction.options.getString('code').toUpperCase();
      const userId = interaction.user.id;

      // This is a placeholder implementation
      // In a real bot, you would validate codes against a database
      const validCodes = {
        'WELCOME2024': {
          type: 'premium',
          description: 'Welcome bonus for new users',
          rewards: 'Premium features for 7 days',
          expires: '2024-12-31',
          maxUses: 1,
          usedBy: []
        },
        'EVENT2024': {
          type: 'event',
          description: 'Special event code',
          rewards: 'Exclusive event rewards',
          expires: '2024-06-30',
          maxUses: 100,
          usedBy: []
        },
        'REWARD123': {
          type: 'reward',
          description: 'General reward code',
          rewards: 'Bonus points and perks',
          expires: '2024-08-15',
          maxUses: 50,
          usedBy: []
        }
      };

      const codeData = validCodes[code];

      if (!codeData) {
        return interaction.reply({
          content: '❌ Invalid code. Please check the code and try again.',
          ephemeral: true
        });
      }

      // Check if code is expired
      const currentDate = new Date();
      const expiryDate = new Date(codeData.expires);
      
      if (currentDate > expiryDate) {
        return interaction.reply({
          content: '❌ This code has expired.',
          ephemeral: true
        });
      }

      // Check if user has already used this code
      if (codeData.usedBy.includes(userId)) {
        return interaction.reply({
          content: '❌ You have already used this code.',
          ephemeral: true
        });
      }

      // Check if code has reached max uses
      if (codeData.usedBy.length >= codeData.maxUses) {
        return interaction.reply({
          content: '❌ This code has reached its maximum usage limit.',
          ephemeral: true
        });
      }

      // Redeem the code (in a real bot, you would update the database)
      codeData.usedBy.push(userId);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Code Redeemed Successfully!')
        .setDescription(`You have successfully redeemed the code **${code}**`)
        .addFields(
          { name: '🎫 Code', value: code, inline: true },
          { name: '📝 Description', value: codeData.description, inline: true },
          { name: '🎁 Rewards', value: codeData.rewards, inline: true },
          { name: '📅 Redeemed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '⏰ Expires', value: codeData.expires, inline: true },
          { name: '👤 Redeemed By', value: `${interaction.user.tag}`, inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in redeem command:', error);
      await interaction.reply({
        content: '❌ An error occurred while redeeming the code.',
        ephemeral: true
      });
    }
  }
}; 