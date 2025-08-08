const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Put the bot or server into maintenance mode')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Maintenance action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Enable Maintenance Mode', value: 'enable' },
          { name: 'Disable Maintenance Mode', value: 'disable' },
          { name: 'Check Maintenance Status', value: 'status' }
        ))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for maintenance mode')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of maintenance (e.g., 2h, 30m)')
        .setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    // Check permissions - only server owner or admin can use this
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage maintenance mode.',
        ephemeral: true
      });
    }

    const action = interaction.options.getString('action');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const duration = interaction.options.getString('duration');

    try {
      // This is a placeholder implementation
      // In a real bot, you would store maintenance state in a database
      const maintenanceStatus = {
        enabled: false,
        reason: '',
        startedBy: '',
        startedAt: null,
        duration: null
      };

      if (action === 'enable') {
        maintenanceStatus.enabled = true;
        maintenanceStatus.reason = reason;
        maintenanceStatus.startedBy = interaction.user.tag;
        maintenanceStatus.startedAt = new Date();
        maintenanceStatus.duration = duration;

        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('🔧 Maintenance Mode Enabled')
          .setDescription('The bot is now in maintenance mode')
          .addFields(
            { name: '👮 Enabled By', value: `${interaction.user.tag}`, inline: true },
            { name: '📅 Started At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
            { name: '⏱️ Duration', value: duration || 'Indefinite', inline: true },
            { name: '📝 Reason', value: reason, inline: false }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (action === 'disable') {
        maintenanceStatus.enabled = false;
        maintenanceStatus.reason = '';
        maintenanceStatus.startedBy = '';
        maintenanceStatus.startedAt = null;
        maintenanceStatus.duration = null;

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Maintenance Mode Disabled')
          .setDescription('The bot is now out of maintenance mode')
          .addFields(
            { name: '👮 Disabled By', value: `${interaction.user.tag}`, inline: true },
            { name: '📅 Disabled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (action === 'status') {
        const embed = new EmbedBuilder()
          .setColor(maintenanceStatus.enabled ? '#FF6B35' : '#00FF00')
          .setTitle('🔧 Maintenance Status')
          .setDescription(maintenanceStatus.enabled ? 'Maintenance mode is **ENABLED**' : 'Maintenance mode is **DISABLED**')
          .addFields(
            { name: '📊 Status', value: maintenanceStatus.enabled ? '🟠 Enabled' : '🟢 Disabled', inline: true },
            { name: '👮 Started By', value: maintenanceStatus.startedBy || 'N/A', inline: true },
            { name: '📅 Started At', value: maintenanceStatus.startedAt ? `<t:${Math.floor(maintenanceStatus.startedAt.getTime() / 1000)}:F>` : 'N/A', inline: true },
            { name: '⏱️ Duration', value: maintenanceStatus.duration || 'N/A', inline: true },
            { name: '📝 Reason', value: maintenanceStatus.reason || 'N/A', inline: false }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in maintenance command:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing maintenance mode.',
        ephemeral: true
      });
    }
  }
}; 