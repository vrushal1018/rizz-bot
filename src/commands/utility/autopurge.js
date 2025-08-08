const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autopurge')
    .setDescription('Automatically delete messages after a set time')
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Enable auto-purge for a channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to enable auto-purge for')
            .setRequired(false))
        .addIntegerOption(option =>
          option.setName('minutes')
            .setDescription('Minutes before messages are deleted (1-1440)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(1440)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable auto-purge for a channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to disable auto-purge for')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all channels with auto-purge enabled'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check auto-purge status for a channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to check status for')
            .setRequired(false))),

  cooldown: 10,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage messages.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      // This is a placeholder implementation
      // In a real bot, you would store auto-purge settings in a database
      const autoPurgeSettings = {
        enabled: true,
        channels: [
          {
            channelId: '123456789',
            channelName: 'general',
            minutes: 60,
            enabledBy: 'Admin#1234',
            enabledAt: '2024-01-15'
          },
          {
            channelId: '987654321',
            channelName: 'spam',
            minutes: 30,
            enabledBy: 'Admin#1234',
            enabledAt: '2024-01-15'
          }
        ]
      };

      if (subcommand === 'enable') {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const minutes = interaction.options.getInteger('minutes') || 60;

        // Check if auto-purge is already enabled for this channel
        const existingChannel = autoPurgeSettings.channels.find(c => c.channelId === channel.id);
        if (existingChannel) {
          return interaction.reply({
            content: `❌ Auto-purge is already enabled for ${channel.name} with ${existingChannel.minutes} minutes.`,
            ephemeral: true
          });
        }

        // Add channel to auto-purge settings
        autoPurgeSettings.channels.push({
          channelId: channel.id,
          channelName: channel.name,
          minutes: minutes,
          enabledBy: interaction.user.tag,
          enabledAt: new Date().toISOString().split('T')[0]
        });

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Auto-Purge Enabled')
          .setDescription(`Auto-purge has been enabled for **${channel.name}**`)
          .addFields(
            { name: '📺 Channel', value: channel.name, inline: true },
            { name: '⏱️ Delete After', value: `${minutes} minutes`, inline: true },
            { name: '👮 Enabled By', value: interaction.user.tag, inline: true },
            { name: '📅 Enabled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'disable') {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // Check if auto-purge is enabled for this channel
        const existingChannelIndex = autoPurgeSettings.channels.findIndex(c => c.channelId === channel.id);
        if (existingChannelIndex === -1) {
          return interaction.reply({
            content: `❌ Auto-purge is not enabled for ${channel.name}.`,
            ephemeral: true
          });
        }

        // Remove channel from auto-purge settings
        const removedChannel = autoPurgeSettings.channels.splice(existingChannelIndex, 1)[0];

        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('❌ Auto-Purge Disabled')
          .setDescription(`Auto-purge has been disabled for **${channel.name}**`)
          .addFields(
            { name: '📺 Channel', value: channel.name, inline: true },
            { name: '⏱️ Previous Setting', value: `${removedChannel.minutes} minutes`, inline: true },
            { name: '👮 Disabled By', value: interaction.user.tag, inline: true },
            { name: '📅 Disabled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'list') {
        if (autoPurgeSettings.channels.length === 0) {
          return interaction.reply({
            content: '❌ No channels have auto-purge enabled.',
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('📋 Auto-Purge Channels')
          .setDescription(`System Status: ${autoPurgeSettings.enabled ? '🟢 Enabled' : '🔴 Disabled'}`)
          .setTimestamp();

        autoPurgeSettings.channels.forEach((channel, index) => {
          embed.addFields({
            name: `${index + 1}. ${channel.channelName}`,
            value: `**Delete After:** ${channel.minutes} minutes\n**Enabled By:** ${channel.enabledBy}\n**Enabled:** ${channel.enabledAt}`,
            inline: false
          });
        });

        embed.setFooter({ text: `Total channels: ${autoPurgeSettings.channels.length}` });

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'status') {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const channelSettings = autoPurgeSettings.channels.find(c => c.channelId === channel.id);

        if (!channelSettings) {
          return interaction.reply({
            content: `❌ Auto-purge is not enabled for ${channel.name}.`,
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('📊 Auto-Purge Status')
          .setDescription(`Status for **${channel.name}**`)
          .addFields(
            { name: '📺 Channel', value: channel.name, inline: true },
            { name: '⏱️ Delete After', value: `${channelSettings.minutes} minutes`, inline: true },
            { name: '👮 Enabled By', value: channelSettings.enabledBy, inline: true },
            { name: '📅 Enabled At', value: channelSettings.enabledAt, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in autopurge command:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing auto-purge.',
        ephemeral: true
      });
    }
  }
}; 