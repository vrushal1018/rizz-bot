const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perks')
    .setDescription('Displays perks unlocked via premium')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category of perks to display')
        .setRequired(false)
        .addChoices(
          { name: 'All Perks', value: 'all' },
          { name: 'Tournament Perks', value: 'tournament' },
          { name: 'Moderation Perks', value: 'moderation' },
          { name: 'Fun Perks', value: 'fun' },
          { name: 'Utility Perks', value: 'utility' }
        )),

  cooldown: 10,

  async execute(interaction) {
    try {
      const category = interaction.options.getString('category') || 'all';

      // This is a placeholder implementation
      // In a real bot, you would fetch perks from a database
      const allPerks = {
        tournament: [
          {
            name: 'Advanced Tournament Management',
            description: 'Create complex tournament brackets with custom seeding',
            icon: '🏆',
            status: 'unlocked'
          },
          {
            name: 'Custom Tournament Formats',
            description: 'Support for BO3, BO5, and custom match formats',
            icon: '⚔️',
            status: 'unlocked'
          },
          {
            name: 'Tournament Analytics',
            description: 'Detailed statistics and performance tracking',
            icon: '📊',
            status: 'unlocked'
          }
        ],
        moderation: [
          {
            name: 'Advanced Auto-Moderation',
            description: 'AI-powered content filtering and spam protection',
            icon: '🛡️',
            status: 'unlocked'
          },
          {
            name: 'Custom Warning System',
            description: 'Create custom warning templates and tracking',
            icon: '⚠️',
            status: 'unlocked'
          },
          {
            name: 'Bulk Action Tools',
            description: 'Mass role management and user actions',
            icon: '⚡',
            status: 'unlocked'
          }
        ],
        fun: [
          {
            name: 'Premium Giveaways',
            description: 'Advanced giveaway features with custom rewards',
            icon: '🎁',
            status: 'unlocked'
          },
          {
            name: 'Custom Welcome Messages',
            description: 'Personalized welcome messages with embeds',
            icon: '👋',
            status: 'unlocked'
          },
          {
            name: 'Auto-Content System',
            description: 'Automated meme, fact, and quote posting',
            icon: '🤖',
            status: 'unlocked'
          }
        ],
        utility: [
          {
            name: 'Extended Command Limits',
            description: 'Higher limits for bulk operations and commands',
            icon: '📈',
            status: 'unlocked'
          },
          {
            name: 'Custom Bot Branding',
            description: 'Custom embed colors and bot appearance',
            icon: '🎨',
            status: 'unlocked'
          },
          {
            name: 'Priority Support',
            description: 'Faster response times for support requests',
            icon: '🚀',
            status: 'unlocked'
          }
        ]
      };

      let selectedPerks = [];
      if (category === 'all') {
        Object.values(allPerks).forEach(catPerks => {
          selectedPerks = selectedPerks.concat(catPerks);
        });
      } else {
        selectedPerks = allPerks[category] || [];
      }

      if (selectedPerks.length === 0) {
        return interaction.reply({
          content: `❌ No ${category} perks found.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('👑 Premium Perks')
        .setDescription(`Here are your ${category === 'all' ? '' : category} premium perks:`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      selectedPerks.forEach((perk, index) => {
        const statusEmoji = perk.status === 'unlocked' ? '🟢' : '🔴';
        embed.addFields({
          name: `${perk.icon} ${perk.name}`,
          value: `${statusEmoji} **Status:** ${perk.status}\n📝 **Description:** ${perk.description}`,
          inline: false
        });
      });

      embed.setFooter({ text: `Total perks: ${selectedPerks.length}` });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in perks command:', error);
      await interaction.reply({
        content: '❌ An error occurred while displaying perks.',
        ephemeral: true
      });
    }
  }
}; 