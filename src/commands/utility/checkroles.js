const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkroles')
    .setDescription('Check what roles the bot can see and assign'),

  cooldown: 5,

  async execute(interaction) {
    try {
      const botMember = interaction.guild.members.me;
      const allRoles = interaction.guild.roles.cache;
      const manageableRoles = allRoles.filter(role => 
        role.position < botMember.roles.highest.position && 
        !role.managed && 
        role.id !== interaction.guild.id
      );

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🔍 Role Check Results')
        .setDescription('Here are the roles the bot can see and assign:')
        .addFields(
          { 
            name: '🤖 Bot Info', 
            value: `**Bot Name:** ${botMember.user.username}\n**Bot's Highest Role:** ${botMember.roles.highest.name}\n**Bot's Role Position:** ${botMember.roles.highest.position}`, 
            inline: false 
          },
          { 
            name: '📊 Role Statistics', 
            value: `**Total Roles:** ${allRoles.size}\n**Manageable Roles:** ${manageableRoles.size}\n**Your Permission:** ${interaction.member.permissions.has(PermissionFlagsBits.ManageRoles) ? '✅ Yes' : '❌ No'}`, 
            inline: false 
          }
        );

      if (manageableRoles.size > 0) {
        const roleList = manageableRoles
          .sort((a, b) => b.position - a.position)
          .take(10)
          .map(role => `• ${role.name} (Position: ${role.position})`)
          .join('\n');

        embed.addFields({
          name: '🎭 Manageable Roles (Top 10)',
          value: roleList,
          inline: false
        });
      } else {
        embed.addFields({
          name: '❌ No Manageable Roles',
          value: 'The bot cannot assign any roles. This could be because:\n• Bot has no "Manage Roles" permission\n• All roles are higher than bot\'s role\n• No roles exist in the server',
          inline: false
        });
      }

      // Check bot permissions
      const botPermissions = botMember.permissions;
      embed.addFields({
        name: '🔐 Bot Permissions',
        value: `**Manage Roles:** ${botPermissions.has(PermissionFlagsBits.ManageRoles) ? '✅ Yes' : '❌ No'}\n**Send Messages:** ${botPermissions.has(PermissionFlagsBits.SendMessages) ? '✅ Yes' : '❌ No'}\n**Use Slash Commands:** ${botPermissions.has(PermissionFlagsBits.UseApplicationCommands) ? '✅ Yes' : '❌ No'}`,
        inline: false
      });

      await interaction.reply({ embeds: [embed], flags: 64 });

    } catch (error) {
      console.error('Error in checkroles command:', error);
      await interaction.reply({
        content: '❌ An error occurred while checking roles.',
        flags: 64
      });
    }
  }
}; 