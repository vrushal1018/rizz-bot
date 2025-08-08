const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: '❌ You do not have permission to kick users.',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Check if target is kickable
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    
    if (!targetMember.kickable) {
      return interaction.reply({
        content: '❌ I cannot kick this user. They may have higher permissions than me.',
        ephemeral: true
      });
    }

    if (targetMember.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot kick yourself.',
        ephemeral: true
      });
    }

    try {
      await targetMember.kick(`Kicked by ${interaction.user.tag}: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('👢 User Kicked')
        .setDescription(`**${targetUser.tag}** has been kicked from the server.`)
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '👮 Kicked By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Kicked At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error kicking user:', error);
      await interaction.reply({
        content: '❌ An error occurred while kicking the user.',
        ephemeral: true
      });
    }
  }
}; 