const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Tag or mention a group of users')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of users to tag')
        .setRequired(true)
        .addChoices(
          { name: 'Role Members', value: 'role' },
          { name: 'Online Members', value: 'online' },
          { name: 'Staff Members', value: 'staff' },
          { name: 'Custom List', value: 'custom' }
        ))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to tag (required for role type)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send with the tag')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('users')
        .setDescription('Comma-separated list of user IDs (for custom type)')
        .setRequired(false)),

  cooldown: 30,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.MentionEveryone)) {
      return interaction.reply({
        content: '❌ You do not have permission to mention everyone.',
        ephemeral: true
      });
    }

    try {
      const type = interaction.options.getString('type');
      const role = interaction.options.getRole('role');
      const message = interaction.options.getString('message') || '';
      const users = interaction.options.getString('users');

      let membersToTag = [];
      let tagDescription = '';

      if (type === 'role') {
        if (!role) {
          return interaction.reply({
            content: '❌ Please specify a role to tag.',
            ephemeral: true
          });
        }

        membersToTag = role.members.map(member => member.user);
        tagDescription = `Role: ${role.name}`;

      } else if (type === 'online') {
        membersToTag = interaction.guild.members.cache
          .filter(member => member.presence?.status === 'online' && !member.user.bot)
          .map(member => member.user);
        tagDescription = 'Online Members';

      } else if (type === 'staff') {
        const staffRoles = interaction.guild.roles.cache.filter(role => 
          role.permissions.has(PermissionFlagsBits.ManageGuild) ||
          role.permissions.has(PermissionFlagsBits.Administrator) ||
          role.permissions.has(PermissionFlagsBits.ManageChannels)
        );

        membersToTag = staffRoles.flatMap(role => 
          role.members.map(member => member.user)
        );
        
        // Remove duplicates
        membersToTag = [...new Set(membersToTag)];
        tagDescription = 'Staff Members';

      } else if (type === 'custom') {
        if (!users) {
          return interaction.reply({
            content: '❌ Please specify user IDs for custom tagging.',
            ephemeral: true
          });
        }

        const userIds = users.split(',').map(id => id.trim());
        membersToTag = userIds.map(id => interaction.client.users.cache.get(id)).filter(Boolean);
        tagDescription = 'Custom Users';
      }

      if (membersToTag.length === 0) {
        return interaction.reply({
          content: `❌ No users found for ${type} tagging.`,
          ephemeral: true
        });
      }

      // Create mention string
      const mentions = membersToTag.map(user => `<@${user.id}>`).join(' ');

      // Send the tagged message
      const taggedMessage = message ? `${mentions}\n\n${message}` : mentions;
      await interaction.channel.send(taggedMessage);

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📢 Tag Sent Successfully')
        .setDescription(`Tagged **${membersToTag.length}** users`)
        .addFields(
          { name: '📋 Type', value: tagDescription, inline: true },
          { name: '👥 Users Tagged', value: `${membersToTag.length}`, inline: true },
          { name: '👮 Tagged By', value: interaction.user.tag, inline: true },
          { name: '📅 Tagged At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      if (message) {
        embed.addFields({
          name: '💬 Message',
          value: message.length > 100 ? message.substring(0, 100) + '...' : message,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error in tag command:', error);
      await interaction.reply({
        content: '❌ An error occurred while tagging users.',
        ephemeral: true
      });
    }
  }
}; 