const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Automatically assign roles to new members')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to auto-assign')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to auto-assign')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('condition')
            .setDescription('Condition for auto-assignment')
            .setRequired(false)
            .addChoices(
              { name: 'All New Members', value: 'all' },
              { name: 'Verified Members Only', value: 'verified' },
              { name: 'With Invite', value: 'invite' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from auto-assignment')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to remove from auto-assignment')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all auto-assigned roles'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('toggle')
        .setDescription('Enable or disable auto-role system')
        .addStringOption(option =>
          option.setName('status')
            .setDescription('Enable or disable auto-role')
            .setRequired(true)
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            ))),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage roles.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      // This is a placeholder implementation
      // In a real bot, you would store auto-role settings in a database
      const autoRoleSettings = {
        enabled: true,
        roles: [
          {
            roleId: '123456789',
            roleName: 'Member',
            condition: 'all',
            addedBy: 'Admin#1234',
            addedAt: '2024-01-15'
          },
          {
            roleId: '987654321',
            roleName: 'Verified',
            condition: 'verified',
            addedBy: 'Admin#1234',
            addedAt: '2024-01-15'
          }
        ]
      };

      if (subcommand === 'add') {
        const role = interaction.options.getRole('role');
        const condition = interaction.options.getString('condition') || 'all';

        // Check if role is already in auto-assignment
        const existingRole = autoRoleSettings.roles.find(r => r.roleId === role.id);
        if (existingRole) {
          return interaction.reply({
            content: `❌ The role ${role.name} is already in auto-assignment.`,
            ephemeral: true
          });
        }

        // Add role to auto-assignment
        autoRoleSettings.roles.push({
          roleId: role.id,
          roleName: role.name,
          condition: condition,
          addedBy: interaction.user.tag,
          addedAt: new Date().toISOString().split('T')[0]
        });

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Auto-Role Added')
          .setDescription(`**${role.name}** will now be automatically assigned to new members`)
          .addFields(
            { name: '🎭 Role', value: role.name, inline: true },
            { name: '📋 Condition', value: condition, inline: true },
            { name: '👮 Added By', value: interaction.user.tag, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'remove') {
        const role = interaction.options.getRole('role');

        // Check if role is in auto-assignment
        const existingRoleIndex = autoRoleSettings.roles.findIndex(r => r.roleId === role.id);
        if (existingRoleIndex === -1) {
          return interaction.reply({
            content: `❌ The role ${role.name} is not in auto-assignment.`,
            ephemeral: true
          });
        }

        // Remove role from auto-assignment
        const removedRole = autoRoleSettings.roles.splice(existingRoleIndex, 1)[0];

        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('❌ Auto-Role Removed')
          .setDescription(`**${role.name}** will no longer be automatically assigned`)
          .addFields(
            { name: '🎭 Role', value: role.name, inline: true },
            { name: '📋 Previous Condition', value: removedRole.condition, inline: true },
            { name: '👮 Removed By', value: interaction.user.tag, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'list') {
        if (autoRoleSettings.roles.length === 0) {
          return interaction.reply({
            content: '❌ No auto-assigned roles configured.',
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('📋 Auto-Assigned Roles')
          .setDescription(`System Status: ${autoRoleSettings.enabled ? '🟢 Enabled' : '🔴 Disabled'}`)
          .setTimestamp();

        autoRoleSettings.roles.forEach((role, index) => {
          embed.addFields({
            name: `${index + 1}. ${role.roleName}`,
            value: `**Condition:** ${role.condition}\n**Added By:** ${role.addedBy}\n**Added:** ${role.addedAt}`,
            inline: false
          });
        });

        embed.setFooter({ text: `Total roles: ${autoRoleSettings.roles.length}` });

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'toggle') {
        const status = interaction.options.getString('status');
        autoRoleSettings.enabled = status === 'enable';

        const embed = new EmbedBuilder()
          .setColor(autoRoleSettings.enabled ? '#00FF00' : '#FF6B35')
          .setTitle(autoRoleSettings.enabled ? '✅ Auto-Role Enabled' : '❌ Auto-Role Disabled')
          .setDescription(`Auto-role system has been **${status}d**`)
          .addFields(
            { name: '👮 Modified By', value: interaction.user.tag, inline: true },
            { name: '📅 Modified At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in autorole command:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing auto-roles.',
        ephemeral: true
      });
    }
  }
}; 