const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Team = require('../../models/Team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slotlist')
    .setDescription('View all registered teams and their slot assignments'),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const teams = await Team.find({ isActive: true }).sort({ slotNumber: 1 });

      if (teams.length === 0) {
        return interaction.editReply({
          content: '📋 No teams are currently registered. Use `/registerteam` to register your team!',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📋 Registered Teams & Slot List')
        .setDescription(`**${teams.length}** teams are currently registered for scrims and tournaments.`)
        .setFooter({ text: 'Use /registerteam to join the competition!' })
        .setTimestamp();

      // Create fields for each team (max 25 fields per embed)
      teams.slice(0, 25).forEach(team => {
        const playersList = team.players.map(player => 
          `<@${player.userId}>${player.role === 'captain' ? ' 👑' : ''}`
        ).join('\n');

        embed.addFields({
          name: `#${team.slotNumber} - ${team.teamName}`,
          value: `**Players:**\n${playersList}\n**Stats:** ${team.wins}W/${team.losses}L (${team.points} pts)`,
          inline: false
        });
      });

      // If there are more teams, create additional embeds
      if (teams.length > 25) {
        const additionalEmbed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('📋 Additional Teams')
          .setDescription('Showing remaining teams...');

        teams.slice(25).forEach(team => {
          const playersList = team.players.map(player => 
            `<@${player.userId}>${player.role === 'captain' ? ' 👑' : ''}`
          ).join('\n');

          additionalEmbed.addFields({
            name: `#${team.slotNumber} - ${team.teamName}`,
            value: `**Players:**\n${playersList}\n**Stats:** ${team.wins}W/${team.losses}L (${team.points} pts)`,
            inline: false
          });
        });

        await interaction.editReply({ embeds: [embed, additionalEmbed] });
      } else {
        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error fetching slot list:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching the slot list. Please try again.',
        ephemeral: true
      });
    }
  }
}; 