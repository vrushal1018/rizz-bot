const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('firstmsg')
    .setDescription('Detect or log a user\'s first message')
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Check a user\'s first message')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User to check first message for')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('log')
        .setDescription('Log first messages to a channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to log first messages to')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('toggle')
        .setDescription('Enable or disable first message logging')
        .addStringOption(option =>
          option.setName('status')
            .setDescription('Enable or disable first message logging')
            .setRequired(true)
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            ))),

  cooldown: 10,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'check') {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        // This is a placeholder implementation
        // In a real bot, you would fetch first message data from a database
        const firstMessageData = {
          userId: targetUser.id,
          username: targetUser.tag,
          firstMessage: 'Hello everyone! 👋',
          channelName: 'general',
          timestamp: '2024-01-15T10:30:00Z',
          messageId: '123456789012345678'
        };

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('📝 First Message Check')
          .setDescription(`First message for **${targetUser.tag}**`)
          .addFields(
            { name: '👤 User', value: targetUser.tag, inline: true },
            { name: '📺 Channel', value: firstMessageData.channelName, inline: true },
            { name: '📅 Date', value: `<t:${Math.floor(new Date(firstMessageData.timestamp).getTime() / 1000)}:F>`, inline: true },
            { name: '💬 Message', value: firstMessageData.firstMessage, inline: false }
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'log') {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
          return interaction.reply({
            content: '❌ You do not have permission to manage channels.',
            ephemeral: true
          });
        }

        const channel = interaction.options.getChannel('channel');

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ First Message Logging Configured')
          .setDescription(`First messages will now be logged to ${channel}`)
          .addFields(
            { name: '📺 Log Channel', value: channel.name, inline: true },
            { name: '👮 Configured By', value: interaction.user.tag, inline: true },
            { name: '📅 Configured At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'toggle') {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
          return interaction.reply({
            content: '❌ You do not have permission to manage server settings.',
            ephemeral: true
          });
        }

        const status = interaction.options.getString('status');
        const enabled = status === 'enable';

        const embed = new EmbedBuilder()
          .setColor(enabled ? '#00FF00' : '#FF6B35')
          .setTitle(enabled ? '✅ First Message Logging Enabled' : '❌ First Message Logging Disabled')
          .setDescription(`First message logging has been **${status}d**`)
          .addFields(
            { name: '👮 Modified By', value: interaction.user.tag, inline: true },
            { name: '📅 Modified At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in firstmsg command:', error);
      await interaction.reply({
        content: '❌ An error occurred while processing the first message command.',
        ephemeral: true
      });
    }
  }
}; 