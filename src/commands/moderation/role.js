const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or assign a role to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to assign role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to assign')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for role assignment')
        .setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage roles.',
        flags: 64
      });
    }

    const targetUser = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const targetMember = await interaction.guild.members.fetch(targetUser.id);

      // Check if user already has the role
      if (targetMember.roles.cache.has(role.id)) {
        return interaction.reply({
          content: `❌ ${targetUser.tag} already has the ${role.name} role.`,
          flags: 64
        });
      }

      // Check if the role is manageable
      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: '❌ I cannot assign this role as it is higher than my highest role.',
          flags: 64
        });
      }

      // Add the role
      await targetMember.roles.add(role, `Role assigned by ${interaction.user.tag}: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎭 Role Assigned')
        .setDescription(`**${role.name}** role has been assigned to **${targetUser.tag}**`)
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '🎭 Role', value: `${role.name}`, inline: true },
          { name: '👮 Assigned By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Assigned At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 0 });

    } catch (error) {
      console.error('Error assigning role:', error);
      await interaction.reply({
        content: '❌ An error occurred while assigning the role.',
        flags: 64
      });
    }
  }
}; 