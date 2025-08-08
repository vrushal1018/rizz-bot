const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('smanager')
    .setDescription('Open scrim manager tools')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new scrim')
        .addStringOption(option =>
          option.setName('game')
            .setDescription('Game for the scrim')
            .setRequired(true)
            .addChoices(
              { name: 'Valorant', value: 'valorant' },
              { name: 'CS2', value: 'cs2' },
              { name: 'League of Legends', value: 'lol' },
              { name: 'Dota 2', value: 'dota2' },
              { name: 'Rocket League', value: 'rl' },
              { name: 'Custom', value: 'custom' }
            ))
        .addStringOption(option =>
          option.setName('format')
            .setDescription('Scrim format')
            .setRequired(false)
            .addChoices(
              { name: 'BO1', value: 'bo1' },
              { name: 'BO3', value: 'bo3' },
              { name: 'BO5', value: 'bo5' }
            ))
        .addIntegerOption(option =>
          option.setName('teams')
            .setDescription('Number of teams needed')
            .setRequired(false)
            .setMinValue(2)
            .setMaxValue(16)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List active scrims')
        .addStringOption(option =>
          option.setName('game')
            .setDescription('Filter by game')
            .setRequired(false)
            .addChoices(
              { name: 'Valorant', value: 'valorant' },
              { name: 'CS2', value: 'cs2' },
              { name: 'League of Legends', value: 'lol' },
              { name: 'Dota 2', value: 'dota2' },
              { name: 'Rocket League', value: 'rl' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('join')
        .setDescription('Join a scrim')
        .addStringOption(option =>
          option.setName('scrim_id')
            .setDescription('ID of the scrim to join')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('team_name')
            .setDescription('Your team name')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('leave')
        .setDescription('Leave a scrim')
        .addStringOption(option =>
          option.setName('scrim_id')
            .setDescription('ID of the scrim to leave')
            .setRequired(true))),

  cooldown: 10,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      // This is a placeholder implementation
      // In a real bot, you would store scrim data in a database
      const scrims = [
        {
          id: 'SCRIM001',
          game: 'valorant',
          format: 'bo3',
          teams: 4,
          maxTeams: 8,
          createdBy: 'Admin#1234',
          createdAt: Date.now() - 3600000, // 1 hour ago
          participants: [
            { teamName: 'Team Alpha', captain: 'Player1#1234' },
            { teamName: 'Team Beta', captain: 'Player2#5678' }
          ],
          status: 'active'
        },
        {
          id: 'SCRIM002',
          game: 'cs2',
          format: 'bo1',
          teams: 2,
          maxTeams: 4,
          createdBy: 'Moderator#5678',
          createdAt: Date.now() - 1800000, // 30 minutes ago
          participants: [
            { teamName: 'CS Team A', captain: 'Player3#9012' }
          ],
          status: 'active'
        }
      ];

      if (subcommand === 'create') {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
          return interaction.reply({
            content: '❌ You do not have permission to create scrims.',
            ephemeral: true
          });
        }

        const game = interaction.options.getString('game');
        const format = interaction.options.getString('format') || 'bo1';
        const teams = interaction.options.getInteger('teams') || 4;

        const scrimId = `SCRIM${Date.now().toString().slice(-6)}`;
        
        const newScrim = {
          id: scrimId,
          game: game,
          format: format,
          teams: 0,
          maxTeams: teams,
          createdBy: interaction.user.tag,
          createdAt: Date.now(),
          participants: [],
          status: 'active'
        };

        scrims.push(newScrim);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎮 Scrim Created')
          .setDescription(`New scrim created successfully`)
          .addFields(
            { name: '🆔 Scrim ID', value: scrimId, inline: true },
            { name: '🎮 Game', value: game.toUpperCase(), inline: true },
            { name: '⚔️ Format', value: format.toUpperCase(), inline: true },
            { name: '👥 Teams', value: `0/${teams}`, inline: true },
            { name: '👮 Created By', value: interaction.user.tag, inline: true },
            { name: '📅 Created At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'list') {
        const gameFilter = interaction.options.getString('game');
        
        let filteredScrims = scrims;
        if (gameFilter) {
          filteredScrims = scrims.filter(scrim => scrim.game === gameFilter);
        }

        if (filteredScrims.length === 0) {
          return interaction.reply({
            content: `❌ No ${gameFilter || 'active'} scrims found.`,
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('🎮 Active Scrims')
          .setDescription(`Found **${filteredScrims.length}** active scrim(s)`)
          .setTimestamp();

        filteredScrims.forEach((scrim, index) => {
          const status = scrim.status === 'active' ? '🟢 Active' : '🔴 Inactive';
          embed.addFields({
            name: `${index + 1}. ${scrim.id} - ${scrim.game.toUpperCase()}`,
            value: `**Format:** ${scrim.format.toUpperCase()}\n**Teams:** ${scrim.teams}/${scrim.maxTeams}\n**Status:** ${status}\n**Created By:** ${scrim.createdBy}\n**Created:** <t:${Math.floor(scrim.createdAt / 1000)}:R>`,
            inline: false
          });
        });

        embed.setFooter({ text: `Total scrims: ${filteredScrims.length}` });

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'join') {
        const scrimId = interaction.options.getString('scrim_id');
        const teamName = interaction.options.getString('team_name');

        const scrim = scrims.find(s => s.id === scrimId);
        
        if (!scrim) {
          return interaction.reply({
            content: '❌ Scrim not found.',
            ephemeral: true
          });
        }

        if (scrim.status !== 'active') {
          return interaction.reply({
            content: '❌ This scrim is not active.',
            ephemeral: true
          });
        }

        if (scrim.teams >= scrim.maxTeams) {
          return interaction.reply({
            content: '❌ This scrim is full.',
            ephemeral: true
          });
        }

        // Check if team is already in scrim
        const existingTeam = scrim.participants.find(p => p.teamName === teamName);
        if (existingTeam) {
          return interaction.reply({
            content: '❌ Your team is already in this scrim.',
            ephemeral: true
          });
        }

        // Add team to scrim
        scrim.participants.push({
          teamName: teamName,
          captain: interaction.user.tag
        });
        scrim.teams++;

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Joined Scrim')
          .setDescription(`Successfully joined **${scrimId}**`)
          .addFields(
            { name: '🆔 Scrim ID', value: scrimId, inline: true },
            { name: '🎮 Game', value: scrim.game.toUpperCase(), inline: true },
            { name: '👥 Team Name', value: teamName, inline: true },
            { name: '👤 Captain', value: interaction.user.tag, inline: true },
            { name: '📊 Teams', value: `${scrim.teams}/${scrim.maxTeams}`, inline: true },
            { name: '📅 Joined At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'leave') {
        const scrimId = interaction.options.getString('scrim_id');

        const scrim = scrims.find(s => s.id === scrimId);
        
        if (!scrim) {
          return interaction.reply({
            content: '❌ Scrim not found.',
            ephemeral: true
          });
        }

        // Find team in scrim
        const teamIndex = scrim.participants.findIndex(p => p.captain === interaction.user.tag);
        if (teamIndex === -1) {
          return interaction.reply({
            content: '❌ You are not in this scrim.',
            ephemeral: true
          });
        }

        const teamName = scrim.participants[teamIndex].teamName;
        
        // Remove team from scrim
        scrim.participants.splice(teamIndex, 1);
        scrim.teams--;

        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('❌ Left Scrim')
          .setDescription(`Successfully left **${scrimId}**`)
          .addFields(
            { name: '🆔 Scrim ID', value: scrimId, inline: true },
            { name: '🎮 Game', value: scrim.game.toUpperCase(), inline: true },
            { name: '👥 Team Name', value: teamName, inline: true },
            { name: '👤 Captain', value: interaction.user.tag, inline: true },
            { name: '📊 Teams', value: `${scrim.teams}/${scrim.maxTeams}`, inline: true },
            { name: '📅 Left At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in smanager command:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing scrims.',
        ephemeral: true
      });
    }
  }
}; 