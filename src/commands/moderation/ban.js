const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: '❌ You do not have permission to ban users.',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteMessageDays = interaction.options.getInteger('days') || 0;

    // Check if target is bannable
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    
    if (!targetMember.bannable) {
      return interaction.reply({
        content: '❌ I cannot ban this user. They may have higher permissions than me.',
        ephemeral: true
      });
    }

    if (targetMember.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot ban yourself.',
        ephemeral: true
      });
    }

    try {
      await targetMember.ban({ 
        deleteMessageDays, 
        reason: `Banned by ${interaction.user.tag}: ${reason}` 
      });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔨 User Banned')
        .setDescription(`**${targetUser.tag}** has been banned from the server.`)
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '👮 Banned By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Banned At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '🗑️ Messages Deleted', value: `${deleteMessageDays} days`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error banning user:', error);
      await interaction.reply({
        content: '❌ An error occurred while banning the user.',
        ephemeral: true
      });
    }
  }
}; 