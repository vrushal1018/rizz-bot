const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zipemojis')
    .setDescription('Download server emojis in a zip file')
    .addStringOption(option =>
      option.setName('format')
        .setDescription('Format for emoji files')
        .setRequired(false)
        .addChoices(
          { name: 'PNG', value: 'png' },
          { name: 'GIF', value: 'gif' },
          { name: 'All Formats', value: 'all' }
        )),

  cooldown: 60,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage emojis.',
        ephemeral: true
      });
    }

    try {
      const format = interaction.options.getString('format') || 'all';
      const guild = interaction.guild;

      // Get server emojis
      const emojis = guild.emojis.cache;

      if (emojis.size === 0) {
        return interaction.reply({
          content: '❌ This server has no custom emojis.',
          ephemeral: true
        });
      }

      // Filter emojis by format if specified
      let filteredEmojis = emojis;
      if (format !== 'all') {
        filteredEmojis = emojis.filter(emoji => {
          if (format === 'png') return !emoji.animated;
          if (format === 'gif') return emoji.animated;
          return true;
        });
      }

      if (filteredEmojis.size === 0) {
        return interaction.reply({
          content: `❌ No ${format} emojis found in this server.`,
          ephemeral: true
        });
      }

      // This is a placeholder implementation
      // In a real bot, you would create and upload a zip file
      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle('📦 Emoji Download')
        .setDescription(`Preparing emoji download for **${guild.name}**`)
        .addFields(
          { name: '📊 Total Emojis', value: `${emojis.size}`, inline: true },
          { name: '📦 Selected Format', value: format.toUpperCase(), inline: true },
          { name: '📁 Emojis to Download', value: `${filteredEmojis.size}`, inline: true },
          { name: '📅 Requested At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '👮 Requested By', value: interaction.user.tag, inline: true }
        )
        .setThumbnail(guild.iconURL())
        .setTimestamp();

      // Add emoji preview
      const emojiList = filteredEmojis.first(10).map(emoji => emoji.toString()).join(' ');
      if (emojiList) {
        embed.addFields({
          name: '🎨 Emoji Preview (First 10)',
          value: emojiList,
          inline: false
        });
      }

      embed.setFooter({ text: 'Note: This is a placeholder. In a real implementation, a zip file would be created and uploaded.' });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in zipemojis command:', error);
      await interaction.reply({
        content: '❌ An error occurred while preparing the emoji download.',
        ephemeral: true
      });
    }
  }
}; 