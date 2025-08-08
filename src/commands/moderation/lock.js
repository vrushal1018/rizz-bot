const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a text channel to prevent messaging')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to lock (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for locking the channel')
        .setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage channels.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Check if channel is already locked
      const everyoneRole = interaction.guild.roles.everyone;
      const currentPermissions = channel.permissionOverwrites.cache.get(everyoneRole.id);

      if (currentPermissions && currentPermissions.deny.has(PermissionFlagsBits.SendMessages)) {
        return interaction.reply({
          content: `❌ ${channel.name} is already locked.`,
          ephemeral: true
        });
      }

      // Lock the channel
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false
      }, { reason: `Channel locked by ${interaction.user.tag}: ${reason}` });

      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle('🔒 Channel Locked')
        .setDescription(`**${channel.name}** has been locked`)
        .addFields(
          { name: '📺 Channel', value: `${channel.name}`, inline: true },
          { name: '👮 Locked By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Locked At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error locking channel:', error);
      await interaction.reply({
        content: '❌ An error occurred while locking the channel.',
        ephemeral: true
      });
    }
  }
}; 