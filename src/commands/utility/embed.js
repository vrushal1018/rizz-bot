const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a styled embed message')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description/content of the embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Color of the embed (hex code or color name)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text for the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('thumbnail')
        .setDescription('URL for thumbnail image')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('URL for main image')
        .setRequired(false))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send embed in (defaults to current channel)')
        .setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ You do not have permission to send embeds.',
        ephemeral: true
      });
    }

    try {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color') || '#0099FF';
      const footer = interaction.options.getString('footer');
      const thumbnail = interaction.options.getString('thumbnail');
      const image = interaction.options.getString('image');
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      // Validate color
      let embedColor = color;
      if (color.startsWith('#')) {
        embedColor = color;
      } else {
        // Map color names to hex codes
        const colorMap = {
          'red': '#FF0000',
          'green': '#00FF00',
          'blue': '#0000FF',
          'yellow': '#FFFF00',
          'purple': '#800080',
          'orange': '#FFA500',
          'pink': '#FFC0CB',
          'cyan': '#00FFFF',
          'white': '#FFFFFF',
          'black': '#000000',
          'gray': '#808080',
          'gold': '#FFD700',
          'silver': '#C0C0C0'
        };
        embedColor = colorMap[color.toLowerCase()] || '#0099FF';
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(embedColor)
        .setTimestamp();

      if (footer) {
        embed.setFooter({ text: footer });
      }

      if (thumbnail) {
        embed.setThumbnail(thumbnail);
      }

      if (image) {
        embed.setImage(image);
      }

      // Send to specified channel
      await channel.send({ embeds: [embed] });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Embed Sent Successfully')
        .setDescription(`Embed has been sent to ${channel}`)
        .addFields(
          { name: '📝 Title', value: title, inline: true },
          { name: '🎨 Color', value: color, inline: true },
          { name: '👮 Sent By', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error('Error in embed command:', error);
      await interaction.reply({
        content: '❌ An error occurred while sending the embed.',
        ephemeral: true
      });
    }
  }
}; 