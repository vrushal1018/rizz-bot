const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gcreate')
    .setDescription('Create a new giveaway')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('What is being given away')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners (1-10)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway (e.g., 1h, 30m, 2d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description of the giveaway')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('requirements')
        .setDescription('Requirements to enter (e.g., role, level)')
        .setRequired(false))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to host giveaway in (defaults to current channel)')
        .setRequired(false)),

  cooldown: 30,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: '❌ You do not have permission to create giveaways.',
        ephemeral: true
      });
    }

    try {
      const prize = interaction.options.getString('prize');
      const winners = interaction.options.getInteger('winners');
      const duration = interaction.options.getString('duration');
      const description = interaction.options.getString('description') || 'No description provided';
      const requirements = interaction.options.getString('requirements') || 'No requirements';
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      // Parse duration
      const durationRegex = /^(\d+)([mhd])$/;
      const match = duration.match(durationRegex);
      
      if (!match) {
        return interaction.reply({
          content: '❌ Invalid duration format. Use format like: 30m, 2h, 1d',
          ephemeral: true
        });
      }

      const amount = parseInt(match[1]);
      const unit = match[2];
      
      let milliseconds;
      switch (unit) {
        case 'm':
          milliseconds = amount * 60 * 1000;
          break;
        case 'h':
          milliseconds = amount * 60 * 60 * 1000;
          break;
        case 'd':
          milliseconds = amount * 24 * 60 * 60 * 1000;
          break;
        default:
          return interaction.reply({
            content: '❌ Invalid time unit. Use m (minutes), h (hours), or d (days)',
            ephemeral: true
          });
      }

      const endTime = Date.now() + milliseconds;

      // This is a placeholder implementation
      // In a real bot, you would store giveaway data in a database
      const giveawayData = {
        id: Date.now().toString(),
        prize: prize,
        winners: winners,
        description: description,
        requirements: requirements,
        endTime: endTime,
        createdBy: interaction.user.id,
        channelId: channel.id,
        guildId: interaction.guild.id,
        participants: [],
        ended: false
      };

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 GIVEAWAY')
        .setDescription(`**${prize}**`)
        .addFields(
          { name: '📝 Description', value: description, inline: false },
          { name: '🏆 Winners', value: `${winners}`, inline: true },
          { name: '⏰ Ends', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true },
          { name: '📋 Requirements', value: requirements, inline: false }
        )
        .setFooter({ text: 'React with 🎉 to enter!' })
        .setTimestamp();

      // Send giveaway message
      const giveawayMessage = await channel.send({ embeds: [embed] });
      
      // Add reaction
      await giveawayMessage.react('🎉');

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Giveaway Created')
        .setDescription(`Giveaway for **${prize}** has been created successfully`)
        .addFields(
          { name: '🎁 Prize', value: prize, inline: true },
          { name: '🏆 Winners', value: `${winners}`, inline: true },
          { name: '⏰ Duration', value: duration, inline: true },
          { name: '📺 Channel', value: channel.name, inline: true },
          { name: '👮 Created By', value: interaction.user.tag, inline: true },
          { name: '📅 Created At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Error in gcreate command:', error);
      await interaction.reply({
        content: '❌ An error occurred while creating the giveaway.',
        ephemeral: true
      });
    }
  }
}; 