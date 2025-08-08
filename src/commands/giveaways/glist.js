const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('glist')
    .setDescription('List current giveaways')
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter giveaways by status')
        .setRequired(false)
        .addChoices(
          { name: 'All Giveaways', value: 'all' },
          { name: 'Active Giveaways', value: 'active' },
          { name: 'Ended Giveaways', value: 'ended' }
        )),

  cooldown: 10,

  async execute(interaction) {
    try {
      const filter = interaction.options.getString('filter') || 'all';

      // This is a placeholder implementation
      // In a real bot, you would fetch giveaways from a database
      const giveaways = [
        {
          id: '123456789',
          prize: 'Discord Nitro Classic',
          winners: 1,
          participants: 15,
          endTime: Date.now() + 3600000, // 1 hour from now
          ended: false,
          createdBy: 'Admin#1234',
          channelName: 'giveaways'
        },
        {
          id: '987654321',
          prize: 'Steam Gift Card',
          winners: 2,
          participants: 8,
          endTime: Date.now() - 1800000, // 30 minutes ago
          ended: true,
          createdBy: 'Admin#1234',
          channelName: 'giveaways'
        },
        {
          id: '456789123',
          prize: 'Discord Nitro Boost',
          winners: 1,
          participants: 12,
          endTime: Date.now() + 7200000, // 2 hours from now
          ended: false,
          createdBy: 'Moderator#5678',
          channelName: 'events'
        }
      ];

      let filteredGiveaways = giveaways;
      if (filter !== 'all') {
        filteredGiveaways = giveaways.filter(g => 
          filter === 'active' ? !g.ended : g.ended
        );
      }

      if (filteredGiveaways.length === 0) {
        return interaction.reply({
          content: `❌ No ${filter} giveaways found.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 Giveaways List')
        .setDescription(`Found **${filteredGiveaways.length}** ${filter} giveaway(s)`)
        .setTimestamp();

      filteredGiveaways.forEach((giveaway, index) => {
        const status = giveaway.ended ? '🔴 Ended' : '🟢 Active';
        const timeLeft = giveaway.ended ? 
          `<t:${Math.floor(giveaway.endTime / 1000)}:R> ago` : 
          `<t:${Math.floor(giveaway.endTime / 1000)}:R> left`;

        embed.addFields({
          name: `${index + 1}. ${giveaway.prize}`,
          value: `**Status:** ${status}\n**Winners:** ${giveaway.winners}\n**Participants:** ${giveaway.participants}\n**Ends:** ${timeLeft}\n**Channel:** ${giveaway.channelName}\n**Created By:** ${giveaway.createdBy}`,
          inline: false
        });
      });

      embed.setFooter({ text: `Total giveaways: ${filteredGiveaways.length}` });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in glist command:', error);
      await interaction.reply({
        content: '❌ An error occurred while listing giveaways.',
        ephemeral: true
      });
    }
  }
}; 