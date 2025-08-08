const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quickembed')
    .setDescription('Send a streamlined embed')
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Content for the embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of embed to send')
        .setRequired(false)
        .addChoices(
          { name: 'Info', value: 'info' },
          { name: 'Success', value: 'success' },
          { name: 'Warning', value: 'warning' },
          { name: 'Error', value: 'error' },
          { name: 'Announcement', value: 'announcement' }
        ))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send embed in (defaults to current channel)')
        .setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ You do not have permission to send embeds.',
        ephemeral: true
      });
    }

    try {
      const content = interaction.options.getString('content');
      const type = interaction.options.getString('type') || 'info';
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      // Define embed types
      const embedTypes = {
        'info': {
          color: '#0099FF',
          icon: 'ℹ️',
          title: 'Information'
        },
        'success': {
          color: '#00FF00',
          icon: '✅',
          title: 'Success'
        },
        'warning': {
          color: '#FFA500',
          icon: '⚠️',
          title: 'Warning'
        },
        'error': {
          color: '#FF0000',
          icon: '❌',
          title: 'Error'
        },
        'announcement': {
          color: '#FFD700',
          icon: '📢',
          title: 'Announcement'
        }
      };

      const embedData = embedTypes[type];

      const embed = new EmbedBuilder()
        .setColor(embedData.color)
        .setTitle(`${embedData.icon} ${embedData.title}`)
        .setDescription(content)
        .setTimestamp()
        .setFooter({ text: `Sent by ${interaction.user.tag}` });

      // Send to specified channel
      await channel.send({ embeds: [embed] });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Quick Embed Sent')
        .setDescription(`Embed has been sent to ${channel}`)
        .addFields(
          { name: '📝 Type', value: embedData.title, inline: true },
          { name: '👮 Sent By', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error('Error in quickembed command:', error);
      await interaction.reply({
        content: '❌ An error occurred while sending the quick embed.',
        ephemeral: true
      });
    }
  }
}; 