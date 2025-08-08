const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const Team = require('../../models/Team');
const Match = require('../../models/Match');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Schedule a scrim match with another team')
    .addStringOption(option =>
      option.setName('opponent')
        .setDescription('Team name or slot number to play against')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Match date (YYYY-MM-DD)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Match time (HH:MM)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('notes')
        .setDescription('Additional notes for the match')
        .setRequired(false)),

  cooldown: 30,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const opponentInput = interaction.options.getString('opponent');
      const dateInput = interaction.options.getString('date');
      const timeInput = interaction.options.getString('time');
      const notes = interaction.options.getString('notes') || '';

      // Find user's team
      const userTeam = await Team.findOne({
        'players.userId': interaction.user.id,
        isActive: true
      });

      if (!userTeam) {
        return interaction.editReply({
          content: '❌ You are not registered with any team. Use `/registerteam` to register first.',
          ephemeral: true
        });
      }

      // Find opponent team
      let opponentTeam;
      if (/^\d+$/.test(opponentInput)) {
        // Search by slot number
        opponentTeam = await Team.findOne({ slotNumber: parseInt(opponentInput), isActive: true });
      } else {
        // Search by team name
        opponentTeam = await Team.findOne({ 
          teamName: { $regex: new RegExp(opponentInput, 'i') },
          isActive: true 
        });
      }

      if (!opponentTeam) {
        return interaction.editReply({
          content: '❌ Opponent team not found. Please check the team name or slot number.',
          ephemeral: true
        });
      }

      if (opponentTeam._id.toString() === userTeam._id.toString()) {
        return interaction.editReply({
          content: '❌ You cannot schedule a match against your own team!',
          ephemeral: true
        });
      }

      // Parse date and time
      const scheduledDate = new Date(`${dateInput}T${timeInput}:00`);
      if (isNaN(scheduledDate.getTime())) {
        return interaction.editReply({
          content: '❌ Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time.',
          ephemeral: true
        });
      }

      if (scheduledDate < new Date()) {
        return interaction.editReply({
          content: '❌ Cannot schedule matches in the past.',
          ephemeral: true
        });
      }

      // Check for existing matches at the same time
      const existingMatch = await Match.findOne({
        $or: [
          { 'team1.teamId': userTeam._id },
          { 'team2.teamId': userTeam._id },
          { 'team1.teamId': opponentTeam._id },
          { 'team2.teamId': opponentTeam._id }
        ],
        status: { $in: ['scheduled', 'in_progress'] },
        scheduledAt: {
          $gte: new Date(scheduledDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
          $lte: new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000)  // 2 hours after
        }
      });

      if (existingMatch) {
        return interaction.editReply({
          content: '❌ One of the teams already has a match scheduled around this time.',
          ephemeral: true
        });
      }

      // Create match
      const match = new Match({
        matchId: uuidv4(),
        team1: {
          teamId: userTeam._id,
          teamName: userTeam.teamName,
          slotNumber: userTeam.slotNumber
        },
        team2: {
          teamId: opponentTeam._id,
          teamName: opponentTeam.teamName,
          slotNumber: opponentTeam.slotNumber
        },
        scheduledAt: scheduledDate,
        notes,
        createdBy: interaction.user.id
      });

      await match.save();

      // Create lobby channels
      const guild = interaction.guild;
      const lobbyCategory = process.env.LOBBY_CATEGORY_ID ? 
        guild.channels.cache.get(process.env.LOBBY_CATEGORY_ID) : null;

      // Create text channel
      const textChannel = await guild.channels.create({
        name: `match-${match.matchId.slice(0, 8)}`,
        type: ChannelType.GuildText,
        parent: lobbyCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: userTeam.players[0].userId, // Team 1 captain
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          },
          {
            id: opponentTeam.players[0].userId, // Team 2 captain
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      // Create voice channel
      const voiceChannel = await guild.channels.create({
        name: `🎮 ${userTeam.teamName} vs ${opponentTeam.teamName}`,
        type: ChannelType.GuildVoice,
        parent: lobbyCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          }
        ]
      });

      // Add permissions for all players
      const allPlayers = [...userTeam.players, ...opponentTeam.players];
      for (const player of allPlayers) {
        await textChannel.permissionOverwrites.create(player.userId, {
          ViewChannel: true,
          SendMessages: true
        });
        await voiceChannel.permissionOverwrites.create(player.userId, {
          ViewChannel: true,
          Connect: true,
          Speak: true
        });
      }

      // Update match with channel IDs
      match.channels = {
        textChannel: textChannel.id,
        voiceChannel: voiceChannel.id
      };
      await match.save();

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle('🎮 Match Scheduled!')
        .setDescription(`**${userTeam.teamName}** vs **${opponentTeam.teamName}**`)
        .addFields(
          { name: '📅 Date & Time', value: `<t:${Math.floor(scheduledDate.getTime() / 1000)}:F>`, inline: true },
          { name: '🆔 Match ID', value: match.matchId.slice(0, 8), inline: true },
          { name: '📝 Status', value: 'Scheduled', inline: true },
          { name: '💬 Text Channel', value: `<#${textChannel.id}>`, inline: true },
          { name: '🎤 Voice Channel', value: `<#${voiceChannel.id}>`, inline: true },
          { name: '📋 Notes', value: notes || 'No additional notes', inline: false }
        )
        .setFooter({ text: 'Use /submitresult to report match results' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Send notifications to team captains
      const team1Captain = await guild.members.fetch(userTeam.captain.userId);
      const team2Captain = await guild.members.fetch(opponentTeam.captain.userId);

      try {
        await team1Captain.send({
          content: `🎮 **Match Scheduled!**\n\n**${userTeam.teamName}** vs **${opponentTeam.teamName}**\n📅 <t:${Math.floor(scheduledDate.getTime() / 1000)}:F>\n💬 <#${textChannel.id}>\n🎤 <#${voiceChannel.id}>`
        });
        await team2Captain.send({
          content: `🎮 **Match Scheduled!**\n\n**${userTeam.teamName}** vs **${opponentTeam.teamName}**\n📅 <t:${Math.floor(scheduledDate.getTime() / 1000)}:F>\n💬 <#${textChannel.id}>\n🎤 <#${voiceChannel.id}>`
        });
      } catch (error) {
        console.log('Could not send DM to team captains');
      }

    } catch (error) {
      console.error('Error scheduling match:', error);
      await interaction.editReply({
        content: '❌ An error occurred while scheduling the match. Please try again.',
        ephemeral: true
      });
    }
  }
}; 