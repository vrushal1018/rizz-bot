const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a previously locked text channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to unlock (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unlocking the channel')
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
      // Check if channel is locked
      const everyoneRole = interaction.guild.roles.everyone;
      const currentPermissions = channel.permissionOverwrites.cache.get(everyoneRole.id);

      if (!currentPermissions || !currentPermissions.deny.has(PermissionFlagsBits.SendMessages)) {
        return interaction.reply({
          content: `❌ ${channel.name} is not locked.`,
          ephemeral: true
        });
      }

      // Unlock the channel
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null
      }, { reason: `Channel unlocked by ${interaction.user.tag}: ${reason}` });

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔓 Channel Unlocked')
        .setDescription(`**${channel.name}** has been unlocked`)
        .addFields(
          { name: '📺 Channel', value: `${channel.name}`, inline: true },
          { name: '👮 Unlocked By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Unlocked At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error unlocking channel:', error);
      await interaction.reply({
        content: '❌ An error occurred while unlocking the channel.',
        ephemeral: true
      });
    }
  }
}; 