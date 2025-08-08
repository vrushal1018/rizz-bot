const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boost')
    .setDescription('Apply a server boost or credit')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of boost to apply')
        .setRequired(true)
        .addChoices(
          { name: 'Server Boost', value: 'server' },
          { name: 'XP Boost', value: 'xp' },
          { name: 'Premium Features', value: 'premium' },
          { name: 'Event Boost', value: 'event' }
        ))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in hours (1-168)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(168))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the boost')
        .setRequired(false)),

  cooldown: 30,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: '❌ You do not have permission to apply boosts.',
        ephemeral: true
      });
    }

    try {
      const type = interaction.options.getString('type');
      const duration = interaction.options.getInteger('duration') || 24;
      const reason = interaction.options.getString('reason') || 'No reason provided';

      // This is a placeholder implementation
      // In a real bot, you would apply boosts to the server/user
      const boostTypes = {
        'server': {
          name: 'Server Boost',
          description: 'Increases server level and unlocks premium features',
          color: '#FF6B9D',
          icon: '🚀'
        },
        'xp': {
          name: 'XP Boost',
          description: 'Doubles XP gain for all members',
          color: '#FFD700',
          icon: '⭐'
        },
        'premium': {
          name: 'Premium Features',
          description: 'Unlocks premium bot features',
          color: '#FFD700',
          icon: '👑'
        },
        'event': {
          name: 'Event Boost',
          description: 'Special boost for events and tournaments',
          color: '#FF6B35',
          icon: '🎉'
        }
      };

      const boostData = boostTypes[type];

      const embed = new EmbedBuilder()
        .setColor(boostData.color)
        .setTitle(`${boostData.icon} ${boostData.name} Applied`)
        .setDescription(`${boostData.description} for **${duration} hours**`)
        .addFields(
          { name: '🎯 Boost Type', value: boostData.name, inline: true },
          { name: '⏱️ Duration', value: `${duration} hours`, inline: true },
          { name: '👮 Applied By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Applied At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '⏰ Expires At', value: `<t:${Math.floor((Date.now() + duration * 60 * 60 * 1000) / 1000)}:F>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in boost command:', error);
      await interaction.reply({
        content: '❌ An error occurred while applying the boost.',
        ephemeral: true
      });
    }
  }
}; 