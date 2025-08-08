const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Match = require('../../models/Match');
const Team = require('../../models/Team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitresult')
    .setDescription('Submit match results (referees and team captains only)')
    .addStringOption(option =>
      option.setName('matchid')
        .setDescription('Match ID (first 8 characters)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('winner')
        .setDescription('Which team won?')
        .setRequired(true)
        .addChoices(
          { name: 'Team 1', value: 'team1' },
          { name: 'Team 2', value: 'team2' },
          { name: 'Draw', value: 'draw' }
        ))
    .addIntegerOption(option =>
      option.setName('team1score')
        .setDescription('Team 1 score')
        .setRequired(true)
        .setMinValue(0))
    .addIntegerOption(option =>
      option.setName('team2score')
        .setDescription('Team 2 score')
        .setRequired(true)
        .setMinValue(0))
    .addStringOption(option =>
      option.setName('notes')
        .setDescription('Additional notes about the match')
        .setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const matchId = interaction.options.getString('matchid');
      const winner = interaction.options.getString('winner');
      const team1Score = interaction.options.getInteger('team1score');
      const team2Score = interaction.options.getInteger('team2score');
      const notes = interaction.options.getString('notes') || '';

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

      // Check if user is authorized to submit results
      const isReferee = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
      const isTeamCaptain = match.team1.teamId.toString() === interaction.user.id || 
                           match.team2.teamId.toString() === interaction.user.id;

      if (!isReferee && !isTeamCaptain) {
        return interaction.editReply({
          content: '❌ Only referees and team captains can submit match results.',
          ephemeral: true
        });
      }

      // Validate scores
      if (winner === 'team1' && team1Score <= team2Score) {
        return interaction.editReply({
          content: '❌ Invalid result: Team 1 cannot win with a lower or equal score.',
          ephemeral: true
        });
      }

      if (winner === 'team2' && team2Score <= team1Score) {
        return interaction.editReply({
          content: '❌ Invalid result: Team 2 cannot win with a lower or equal score.',
          ephemeral: true
        });
      }

      if (winner === 'draw' && team1Score !== team2Score) {
        return interaction.editReply({
          content: '❌ Invalid result: Draw requires equal scores.',
          ephemeral: true
        });
      }

      // Update match result
      await match.endMatch({
        winner,
        team1Score,
        team2Score
      }, interaction.user.id);

      // Update team statistics
      const team1 = await Team.findById(match.team1.teamId);
      const team2 = await Team.findById(match.team2.teamId);

      if (team1 && team2) {
        if (winner === 'team1') {
          await team1.updateStats('win');
          await team2.updateStats('loss');
        } else if (winner === 'team2') {
          await team1.updateStats('loss');
          await team2.updateStats('win');
        } else {
          await team1.updateStats('draw');
          await team2.updateStats('draw');
        }
      }

      // Create result embed
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Match Result Submitted!')
        .setDescription(`**${match.team1.teamName}** vs **${match.team2.teamName}**`)
        .addFields(
          { name: '📊 Final Score', value: `${team1Score} - ${team2Score}`, inline: true },
          { name: '🏆 Winner', value: winner === 'draw' ? 'Draw' : winner === 'team1' ? match.team1.teamName : match.team2.teamName, inline: true },
          { name: '📝 Status', value: 'Completed', inline: true },
          { name: '⏱️ Duration', value: match.duration ? `${match.duration} minutes` : 'N/A', inline: true },
          { name: '👤 Submitted By', value: `<@${interaction.user.id}>`, inline: true },
          { name: '📋 Notes', value: notes || 'No additional notes', inline: false }
        )
        .setFooter({ text: 'Team statistics have been updated' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Send notifications to team captains
      const guild = interaction.guild;
      try {
        const team1Captain = await guild.members.fetch(match.team1.teamId);
        const team2Captain = await guild.members.fetch(match.team2.teamId);

        const resultMessage = `🏆 **Match Result:** ${match.team1.teamName} ${team1Score} - ${team2Score} ${match.team2.teamName}\n🏆 **Winner:** ${winner === 'draw' ? 'Draw' : winner === 'team1' ? match.team1.teamName : match.team2.teamName}`;

        await team1Captain.send({
          content: resultMessage
        });
        await team2Captain.send({
          content: resultMessage
        });
      } catch (error) {
        console.log('Could not send DM to team captains');
      }

      // Clean up channels after 24 hours
      setTimeout(async () => {
        try {
          if (match.channels.textChannel) {
            const textChannel = guild.channels.cache.get(match.channels.textChannel);
            if (textChannel) await textChannel.delete();
          }
          if (match.channels.voiceChannel) {
            const voiceChannel = guild.channels.cache.get(match.channels.voiceChannel);
            if (voiceChannel) await voiceChannel.delete();
          }
        } catch (error) {
          console.log('Error cleaning up match channels:', error);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours

    } catch (error) {
      console.error('Error submitting match result:', error);
      await interaction.editReply({
        content: '❌ An error occurred while submitting the result. Please try again.',
        ephemeral: true
      });
    }
  }
}; 