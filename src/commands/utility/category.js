const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('category')
    .setDescription('Manage categories for organizing channels')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new category')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Name of the category')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description of the category')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a category')
        .addChannelOption(option =>
          option.setName('category')
            .setDescription('Category to delete')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all categories'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('move')
        .setDescription('Move a channel to a category')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to move')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('category')
            .setDescription('Category to move channel to')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true))),

  cooldown: 10,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage channels.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'create') {
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description') || '';

        // Create the category
        const category = await interaction.guild.channels.create({
          name: name,
          type: ChannelType.GuildCategory,
          reason: `Category created by ${interaction.user.tag}`
        });

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Category Created')
          .setDescription(`Category **${name}** has been created successfully`)
          .addFields(
            { name: '📁 Category Name', value: name, inline: true },
            { name: '📝 Description', value: description || 'No description', inline: true },
            { name: '👮 Created By', value: interaction.user.tag, inline: true },
            { name: '📅 Created At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'delete') {
        const category = interaction.options.getChannel('category');

        // Check if category has channels
        const channelsInCategory = interaction.guild.channels.cache.filter(channel => 
          channel.parentId === category.id
        );

        if (channelsInCategory.size > 0) {
          return interaction.reply({
            content: `❌ Cannot delete category **${category.name}** because it contains ${channelsInCategory.size} channel(s). Please move or delete the channels first.`,
            ephemeral: true
          });
        }

        // Delete the category
        await category.delete(`Category deleted by ${interaction.user.tag}`);

        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('❌ Category Deleted')
          .setDescription(`Category **${category.name}** has been deleted`)
          .addFields(
            { name: '📁 Category Name', value: category.name, inline: true },
            { name: '👮 Deleted By', value: interaction.user.tag, inline: true },
            { name: '📅 Deleted At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'list') {
        const categories = interaction.guild.channels.cache.filter(channel => 
          channel.type === ChannelType.GuildCategory
        );

        if (categories.size === 0) {
          return interaction.reply({
            content: '❌ No categories found in this server.',
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('📁 Server Categories')
          .setDescription(`Found **${categories.size}** categories`)
          .setTimestamp();

        categories.forEach((category, index) => {
          const channelsInCategory = interaction.guild.channels.cache.filter(channel => 
            channel.parentId === category.id
          );

          embed.addFields({
            name: `${index + 1}. ${category.name}`,
            value: `**Channels:** ${channelsInCategory.size}\n**Created:** <t:${Math.floor(category.createdTimestamp / 1000)}:R>`,
            inline: false
          });
        });

        embed.setFooter({ text: `Total categories: ${categories.size}` });

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'move') {
        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');

        // Move the channel to the category
        await channel.setParent(category, {
          reason: `Channel moved by ${interaction.user.tag}`
        });

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Channel Moved')
          .setDescription(`**${channel.name}** has been moved to **${category.name}**`)
          .addFields(
            { name: '📺 Channel', value: channel.name, inline: true },
            { name: '📁 Category', value: category.name, inline: true },
            { name: '👮 Moved By', value: interaction.user.tag, inline: true },
            { name: '📅 Moved At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in category command:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing categories.',
        ephemeral: true
      });
    }
  }
}; 