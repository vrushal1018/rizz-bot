const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pstatus')
    .setDescription('Shows premium feature status')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check status for (defaults to yourself)')
        .setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;

      // This is a placeholder implementation
      // In a real bot, you would fetch premium status from a database
      const premiumStatus = {
        isPremium: true,
        tier: 'Premium',
        features: [
          'Advanced Tournament Management',
          'Custom Bot Branding',
          'Priority Support',
          'Extended Command Limits',
          'Premium Analytics',
          'Custom Welcome Messages',
          'Advanced Moderation Tools',
          'Premium Giveaways'
        ],
        expiresAt: '2024-12-31',
        joinedAt: '2024-01-15',
        totalServers: 5,
        activeServers: 3
      };

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('👑 Premium Status')
        .setDescription(`Premium status for **${targetUser.tag}**`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '📊 Status', value: premiumStatus.isPremium ? '🟢 Premium Active' : '🔴 No Premium', inline: true },
          { name: '👑 Tier', value: premiumStatus.tier, inline: true },
          { name: '📅 Expires', value: premiumStatus.expiresAt, inline: true },
          { name: '📅 Joined', value: premiumStatus.joinedAt, inline: true },
          { name: '🏠 Total Servers', value: `${premiumStatus.totalServers}`, inline: true },
          { name: '🟢 Active Servers', value: `${premiumStatus.activeServers}`, inline: true }
        )
        .setTimestamp();

      // Add features list
      if (premiumStatus.features.length > 0) {
        const featuresList = premiumStatus.features.map(feature => `• ${feature}`).join('\n');
        embed.addFields({
          name: '🎁 Premium Features',
          value: featuresList,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in pstatus command:', error);
      await interaction.reply({
        content: '❌ An error occurred while checking premium status.',
        ephemeral: true
      });
    }
  }
}; 