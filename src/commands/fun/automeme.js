const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automeme')
    .setDescription('Auto-post memes at intervals')
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Enable auto-meme posting')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to post memes in')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('interval')
            .setDescription('Interval between memes')
            .setRequired(false)
            .addChoices(
              { name: '30 Minutes', value: '30m' },
              { name: '1 Hour', value: '1h' },
              { name: '2 Hours', value: '2h' },
              { name: '6 Hours', value: '6h' },
              { name: '12 Hours', value: '12h' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable auto-meme posting')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to disable auto-memes in')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check auto-meme status')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to check status for')
            .setRequired(false))),

  cooldown: 10,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      // This is a placeholder implementation
      // In a real bot, you would store auto-meme settings in a database
      const autoMemeSettings = {
        enabled: true,
        channels: [
          {
            channelId: '123456789',
            channelName: 'memes',
            interval: '1h',
            enabledBy: 'Admin#1234',
            enabledAt: '2024-01-15'
          }
        ]
      };

      if (subcommand === 'enable') {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
          return interaction.reply({
            content: '❌ You do not have permission to manage auto-memes.',
            ephemeral: true
          });
        }

        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const interval = interaction.options.getString('interval') || '1h';

        // Check if auto-meme is already enabled for this channel
        const existingChannel = autoMemeSettings.channels.find(c => c.channelId === channel.id);
        if (existingChannel) {
          return interaction.reply({
            content: `❌ Auto-memes are already enabled for ${channel.name} with ${existingChannel.interval} interval.`,
            ephemeral: true
          });
        }

        // Add channel to auto-meme settings
        autoMemeSettings.channels.push({
          channelId: channel.id,
          channelName: channel.name,
          interval: interval,
          enabledBy: interaction.user.tag,
          enabledAt: new Date().toISOString().split('T')[0]
        });

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Auto-Meme Enabled')
          .setDescription(`Auto-memes have been enabled for **${channel.name}**`)
          .addFields(
            { name: '📺 Channel', value: channel.name, inline: true },
            { name: '⏰ Interval', value: interval, inline: true },
            { name: '👮 Enabled By', value: interaction.user.tag, inline: true },
            { name: '📅 Enabled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'disable') {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
          return interaction.reply({
            content: '❌ You do not have permission to manage auto-memes.',
            ephemeral: true
          });
        }

        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // Check if auto-meme is enabled for this channel
        const existingChannelIndex = autoMemeSettings.channels.findIndex(c => c.channelId === channel.id);
        if (existingChannelIndex === -1) {
          return interaction.reply({
            content: `❌ Auto-memes are not enabled for ${channel.name}.`,
            ephemeral: true
          });
        }

        // Remove channel from auto-meme settings
        const removedChannel = autoMemeSettings.channels.splice(existingChannelIndex, 1)[0];

        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('❌ Auto-Meme Disabled')
          .setDescription(`Auto-memes have been disabled for **${channel.name}**`)
          .addFields(
            { name: '📺 Channel', value: channel.name, inline: true },
            { name: '⏰ Previous Interval', value: removedChannel.interval, inline: true },
            { name: '👮 Disabled By', value: interaction.user.tag, inline: true },
            { name: '📅 Disabled At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'status') {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const channelSettings = autoMemeSettings.channels.find(c => c.channelId === channel.id);

        if (!channelSettings) {
          return interaction.reply({
            content: `❌ Auto-memes are not enabled for ${channel.name}.`,
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('📊 Auto-Meme Status')
          .setDescription(`Status for **${channel.name}**`)
          .addFields(
            { name: '📺 Channel', value: channel.name, inline: true },
            { name: '⏰ Interval', value: channelSettings.interval, inline: true },
            { name: '👮 Enabled By', value: channelSettings.enabledBy, inline: true },
            { name: '📅 Enabled At', value: channelSettings.enabledAt, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in automeme command:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing auto-memes.',
        ephemeral: true
      });
    }
  }
}; 