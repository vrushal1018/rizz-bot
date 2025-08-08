const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rrole')
    .setDescription('Remove a role from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove role from')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to remove')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for role removal')
        .setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage roles.',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const targetMember = await interaction.guild.members.fetch(targetUser.id);

      // Check if user has the role
      if (!targetMember.roles.cache.has(role.id)) {
        return interaction.reply({
          content: `❌ ${targetUser.tag} does not have the ${role.name} role.`,
          ephemeral: true
        });
      }

      // Check if the role is manageable
      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: '❌ I cannot remove this role as it is higher than my highest role.',
          ephemeral: true
        });
      }

      // Remove the role
      await targetMember.roles.remove(role, `Role removed by ${interaction.user.tag}: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle('🎭 Role Removed')
        .setDescription(`**${role.name}** role has been removed from **${targetUser.tag}**`)
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '🎭 Role', value: `${role.name}`, inline: true },
          { name: '👮 Removed By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Removed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error removing role:', error);
      await interaction.reply({
        content: '❌ An error occurred while removing the role.',
        ephemeral: true
      });
    }
  }
}; 