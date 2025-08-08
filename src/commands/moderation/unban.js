const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a previously banned user')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('User ID to unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unban')
        .setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: '❌ You do not have permission to unban users.',
        ephemeral: true
      });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Fetch the banned user
      const bannedUser = await interaction.guild.bans.fetch(userId);
      
      if (!bannedUser) {
        return interaction.reply({
          content: '❌ This user is not banned.',
          ephemeral: true
        });
      }

      // Unban the user
      await interaction.guild.members.unban(userId, `Unbanned by ${interaction.user.tag}: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔓 User Unbanned')
        .setDescription(`**${bannedUser.user.tag}** has been unbanned from the server.`)
        .addFields(
          { name: '👤 User', value: `${bannedUser.user.tag} (${userId})`, inline: true },
          { name: '👮 Unbanned By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Unbanned At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(bannedUser.user.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error unbanning user:', error);
      
      if (error.code === 10013) {
        await interaction.reply({
          content: '❌ User not found or invalid user ID.',
          ephemeral: true
        });
      } else if (error.code === 10026) {
        await interaction.reply({
          content: '❌ This user is not banned.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ An error occurred while unbanning the user.',
          ephemeral: true
        });
      }
    }
  }
}; 