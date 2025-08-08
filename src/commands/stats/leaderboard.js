const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Team = require('../../models/Team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the current team leaderboard'),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const teams = await Team.getLeaderboard();

      if (teams.length === 0) {
        return interaction.editReply({
          content: '📊 No teams are currently registered. Use `/registerteam` to join the competition!',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Team Leaderboard')
        .setDescription('Current rankings based on wins, losses, and points')
        .setFooter({ text: 'Updated in real-time' })
        .setTimestamp();

      // Create leaderboard entries
      teams.slice(0, 20).forEach((team, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        
        const winRate = team.totalMatches > 0 ? ((team.wins / team.totalMatches) * 100).toFixed(1) : '0.0';
        
        embed.addFields({
          name: `${medal} ${team.teamName}`,
          value: `📊 **${team.wins}W/${team.losses}L/${team.draws || 0}D** | **${team.points} pts** | **${winRate}%** win rate\n📋 Slot #${team.slotNumber} | ${team.totalMatches} matches`,
          inline: false
        });
      });

      // Add summary statistics
      const totalTeams = teams.length;
      const totalMatches = teams.reduce((sum, team) => sum + team.totalMatches, 0);
      const totalWins = teams.reduce((sum, team) => sum + team.wins, 0);
      const totalLosses = teams.reduce((sum, team) => sum + team.losses, 0);

      embed.addFields({
        name: '📈 Overall Statistics',
        value: `**${totalTeams}** teams | **${totalMatches}** total matches | **${totalWins}** wins | **${totalLosses}** losses`,
        inline: false
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching the leaderboard. Please try again.',
        ephemeral: true
      });
    }
  }
}; 