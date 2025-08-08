const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gquick')
    .setDescription('Quickly start a preset giveaway')
    .addStringOption(option =>
      option.setName('preset')
        .setDescription('Preset giveaway type')
        .setRequired(true)
        .addChoices(
          { name: 'Nitro Classic', value: 'nitro_classic' },
          { name: 'Nitro Boost', value: 'nitro_boost' },
          { name: 'Steam Gift Card', value: 'steam' },
          { name: 'Discord Nitro', value: 'nitro' },
          { name: 'Custom Prize', value: 'custom' }
        ))
    .addStringOption(option =>
      option.setName('custom_prize')
        .setDescription('Custom prize (only for custom preset)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners (1-5)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(5))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (30m, 1h, 2h, 6h, 12h, 1d)')
        .setRequired(false)
        .addChoices(
          { name: '30 Minutes', value: '30m' },
          { name: '1 Hour', value: '1h' },
          { name: '2 Hours', value: '2h' },
          { name: '6 Hours', value: '6h' },
          { name: '12 Hours', value: '12h' },
          { name: '1 Day', value: '1d' }
        )),

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
      const preset = interaction.options.getString('preset');
      const customPrize = interaction.options.getString('custom_prize');
      const winners = interaction.options.getInteger('winners') || 1;
      const duration = interaction.options.getString('duration') || '1h';

      // Define preset giveaways
      const presets = {
        'nitro_classic': {
          prize: 'Discord Nitro Classic (1 Month)',
          description: 'Get Discord Nitro Classic for 1 month!',
          requirements: 'Must be a server member',
          color: '#5865F2'
        },
        'nitro_boost': {
          prize: 'Discord Nitro Boost (1 Month)',
          description: 'Get Discord Nitro Boost for 1 month!',
          requirements: 'Must be a server member',
          color: '#FF73FA'
        },
        'steam': {
          prize: 'Steam Gift Card ($10)',
          description: 'Get a $10 Steam Gift Card!',
          requirements: 'Must be a server member',
          color: '#1B2838'
        },
        'nitro': {
          prize: 'Discord Nitro (1 Month)',
          description: 'Get Discord Nitro for 1 month!',
          requirements: 'Must be a server member',
          color: '#5865F2'
        },
        'custom': {
          prize: customPrize || 'Custom Prize',
          description: 'Custom giveaway prize!',
          requirements: 'Must be a server member',
          color: '#FFD700'
        }
      };

      const selectedPreset = presets[preset];
      
      if (preset === 'custom' && !customPrize) {
        return interaction.reply({
          content: '❌ Please specify a custom prize when using the custom preset.',
          ephemeral: true
        });
      }

      // Parse duration
      const durationRegex = /^(\d+)([mhd])$/;
      const match = duration.match(durationRegex);
      
      if (!match) {
        return interaction.reply({
          content: '❌ Invalid duration format.',
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
            content: '❌ Invalid time unit.',
            ephemeral: true
          });
      }

      const endTime = Date.now() + milliseconds;

      const embed = new EmbedBuilder()
        .setColor(selectedPreset.color)
        .setTitle('🎉 QUICK GIVEAWAY')
        .setDescription(`**${selectedPreset.prize}**`)
        .addFields(
          { name: '📝 Description', value: selectedPreset.description, inline: false },
          { name: '🏆 Winners', value: `${winners}`, inline: true },
          { name: '⏰ Ends', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true },
          { name: '📋 Requirements', value: selectedPreset.requirements, inline: false }
        )
        .setFooter({ text: 'React with 🎉 to enter!' })
        .setTimestamp();

      // Send giveaway message
      const giveawayMessage = await interaction.channel.send({ embeds: [embed] });
      
      // Add reaction
      await giveawayMessage.react('🎉');

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Quick Giveaway Created')
        .setDescription(`Quick giveaway for **${selectedPreset.prize}** has been created`)
        .addFields(
          { name: '🎁 Prize', value: selectedPreset.prize, inline: true },
          { name: '🏆 Winners', value: `${winners}`, inline: true },
          { name: '⏰ Duration', value: duration, inline: true },
          { name: '📋 Preset', value: preset.replace('_', ' ').toUpperCase(), inline: true },
          { name: '👮 Created By', value: interaction.user.tag, inline: true },
          { name: '📅 Created At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Error in gquick command:', error);
      await interaction.reply({
        content: '❌ An error occurred while creating the quick giveaway.',
        ephemeral: true
      });
    }
  }
}; 