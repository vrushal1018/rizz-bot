const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Team = require('../../models/Team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('registerteam')
    .setDescription('Register your team for scrims and tournaments')
    .addStringOption(option =>
      option.setName('teamname')
        .setDescription('Your team name')
        .setRequired(true)
        .setMaxLength(50))
    .addUserOption(option =>
      option.setName('player1')
        .setDescription('First player (captain)')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('player2')
        .setDescription('Second player')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('player3')
        .setDescription('Third player')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('player4')
        .setDescription('Fourth player')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('player5')
        .setDescription('Fifth player')
        .setRequired(true)),

  cooldown: 30,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const teamName = interaction.options.getString('teamname');
      const players = [
        interaction.options.getUser('player1'),
        interaction.options.getUser('player2'),
        interaction.options.getUser('player3'),
        interaction.options.getUser('player4'),
        interaction.options.getUser('player5')
      ];

      // Check if team name already exists
      const existingTeam = await Team.findOne({ teamName: { $regex: new RegExp(`^${teamName}$`, 'i') } });
      if (existingTeam) {
        return interaction.editReply({
          content: '❌ A team with this name already exists!',
          ephemeral: true
        });
      }

      // Check if any player is already in another team
      const playerIds = players.map(p => p.id);
      const existingPlayer = await Team.findOne({
        'players.userId': { $in: playerIds }
      });

      if (existingPlayer) {
        return interaction.editReply({
          content: '❌ One or more players are already registered with another team!',
          ephemeral: true
        });
      }

      // Get next available slot
      const nextSlot = await Team.getNextSlot();

      // Create team
      const team = new Team({
        teamName,
        slotNumber: nextSlot,
        players: players.map((player, index) => ({
          userId: player.id,
          username: player.username,
          role: index === 0 ? 'captain' : 'player'
        })),
        captain: {
          userId: players[0].id,
          username: players[0].username
        }
      });

      await team.save();

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🏆 Team Registered Successfully!')
        .setDescription(`**${teamName}** has been registered for scrims and tournaments.`)
        .addFields(
          { name: '📋 Slot Number', value: `#${nextSlot}`, inline: true },
          { name: '👑 Captain', value: `<@${players[0].id}>`, inline: true },
          { name: '📅 Registered', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
          { name: '👥 Players', value: players.map(p => `<@${p.id}>`).join('\n'), inline: false }
        )
        .setFooter({ text: 'Use /slotlist to view all registered teams' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Send confirmation to team captain
      try {
        await players[0].send({
          content: `🎉 Your team **${teamName}** has been successfully registered!\n\n**Team Details:**\n• Slot: #${nextSlot}\n• Players: ${players.map(p => p.username).join(', ')}\n\nYou can now use /schedule to book scrims with other teams!`
        });
      } catch (error) {
        console.log('Could not send DM to team captain');
      }

    } catch (error) {
      console.error('Error registering team:', error);
      await interaction.editReply({
        content: '❌ An error occurred while registering your team. Please try again.',
        ephemeral: true
      });
    }
  }
}; 