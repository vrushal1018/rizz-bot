const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Match = require('../../models/Match');
const Team = require('../../models/Team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matchsummary')
    .setDescription('Generate a detailed match summary')
    .addStringOption(option =>
      option.setName('matchid')
        .setDescription('Match ID (first 8 characters)')
        .setRequired(true)),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const matchId = interaction.options.getString('matchid');

      // Find match
      const match = await Match.findOne({
        matchId: { $regex: new RegExp(`^${matchId}`, 'i') }
      });

      if (!match) {
        return interaction.editReply({
          content: '❌ Match not found. Please check the Match ID.',
          ephemeral: true
        });
      }

      // Get team details
      const team1 = await Team.findById(match.team1.teamId);
      const team2 = await Team.findById(match.team2.teamId);

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📊 Match Summary')
        .setDescription(`**${match.team1.teamName}** vs **${match.team2.teamName}**`)
        .addFields(
          { name: '🆔 Match ID', value: match.matchId.slice(0, 8), inline: true },
          { name: '📅 Scheduled', value: `<t:${Math.floor(match.scheduledAt.getTime() / 1000)}:F>`, inline: true },
          { name: '📝 Status', value: match.status.charAt(0).toUpperCase() + match.status.slice(1), inline: true }
        );

      if (match.status === 'completed') {
        embed.addFields(
          { name: '🏆 Winner', value: match.result.winner === 'draw' ? 'Draw' : match.result.winner === 'team1' ? match.team1.teamName : match.team2.teamName, inline: true },
          { name: '📊 Final Score', value: `${match.result.team1Score} - ${match.result.team2Score}`, inline: true },
          { name: '⏱️ Duration', value: match.duration ? `${match.duration} minutes` : 'N/A', inline: true },
          { name: '👤 Result Submitted By', value: `<@${match.result.submittedBy}>`, inline: true },
          { name: '📅 Completed', value: `<t:${Math.floor(match.endedAt.getTime() / 1000)}:F>`, inline: true }
        );
      }

      if (match.notes) {
        embed.addFields({ name: '📋 Notes', value: match.notes, inline: false });
      }

      // Team statistics
      if (team1 && team2) {
        embed.addFields(
          { name: '📈 Team Statistics', value: '**Before Match:**', inline: false },
          { name: `${match.team1.teamName}`, value: `${team1.wins}W/${team1.losses}L (${team1.points} pts)`, inline: true },
          { name: `${match.team2.teamName}`, value: `${team2.wins}W/${team2.losses}L (${team2.points} pts)`, inline: true }
        );
      }

      // Channel information
      if (match.channels.textChannel || match.channels.voiceChannel) {
        const channels = [];
        if (match.channels.textChannel) channels.push(`💬 <#${match.channels.textChannel}>`);
        if (match.channels.voiceChannel) channels.push(`🎤 <#${match.channels.voiceChannel}>`);
        
        embed.addFields({ name: '🎮 Match Channels', value: channels.join('\n'), inline: false });
      }

      embed.setFooter({ text: 'Match data provided by Quotient Bot' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error generating match summary:', error);
      await interaction.editReply({
        content: '❌ An error occurred while generating the match summary. Please try again.',
        ephemeral: true
      });
    }
  }
}; 