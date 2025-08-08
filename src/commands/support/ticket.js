const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../../models/Ticket');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a support ticket')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Type of issue')
        .setRequired(true)
        .addChoices(
          { name: 'Dispute Resolution', value: 'dispute' },
          { name: 'Technical Support', value: 'technical' },
          { name: 'Missing Player', value: 'missing_player' },
          { name: 'General Question', value: 'general' },
          { name: 'Other', value: 'other' }
        ))
    .addStringOption(option =>
      option.setName('subject')
        .setDescription('Brief subject of your issue')
        .setRequired(true)
        .setMaxLength(100))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Detailed description of your issue')
        .setRequired(true)
        .setMaxLength(1000)),

  cooldown: 60,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const category = interaction.options.getString('category');
      const subject = interaction.options.getString('subject');
      const description = interaction.options.getString('description');

      // Check if user already has an open ticket
      const existingTicket = await Ticket.findOne({
        userId: interaction.user.id,
        status: { $in: ['open', 'in_progress'] }
      });

      if (existingTicket) {
        return interaction.editReply({
          content: `❌ You already have an open ticket: **${existingTicket.subject}**\nPlease wait for it to be resolved before creating a new one.`,
          ephemeral: true
        });
      }

      // Create ticket
      const ticket = new Ticket({
        ticketId: uuidv4(),
        userId: interaction.user.id,
        username: interaction.user.username,
        category,
        subject,
        description,
        priority: category === 'dispute' ? 'high' : 'medium'
      });

      await ticket.save();

      // Create ticket channel
      const guild = interaction.guild;
      const ticketCategory = process.env.TICKET_CATEGORY_ID ? 
        guild.channels.cache.get(process.env.TICKET_CATEGORY_ID) : null;

      const ticketChannel = await guild.channels.create({
        name: `ticket-${ticket.ticketId.slice(0, 8)}`,
        type: ChannelType.GuildText,
        parent: ticketCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      // Add permissions for moderators
      const moderators = guild.members.cache.filter(member => 
        member.permissions.has(PermissionFlagsBits.ManageGuild)
      );

      for (const [moderatorId, moderator] of moderators) {
        await ticketChannel.permissionOverwrites.create(moderatorId, {
          ViewChannel: true,
          SendMessages: true,
          ManageMessages: true
        });
      }

      // Update ticket with channel ID
      ticket.channelId = ticketChannel.id;
      await ticket.save();

      // Create ticket embed
      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle('🎫 Support Ticket Created')
        .setDescription(`**${subject}**`)
        .addFields(
          { name: '📋 Ticket ID', value: ticket.ticketId.slice(0, 8), inline: true },
          { name: '📂 Category', value: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '), inline: true },
          { name: '⚡ Priority', value: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1), inline: true },
          { name: '👤 Created By', value: `<@${interaction.user.id}>`, inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
          { name: '📝 Status', value: 'Open', inline: true },
          { name: '📄 Description', value: description, inline: false }
        )
        .setFooter({ text: 'A moderator will assist you shortly' })
        .setTimestamp();

      await ticketChannel.send({ embeds: [embed] });

      // Send confirmation to user
      const userEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎫 Ticket Created Successfully!')
        .setDescription(`Your support ticket has been created and assigned to <#${ticketChannel.id}>`)
        .addFields(
          { name: '📋 Ticket ID', value: ticket.ticketId.slice(0, 8), inline: true },
          { name: '📂 Category', value: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '), inline: true },
          { name: '📝 Subject', value: subject, inline: true }
        )
        .setFooter({ text: 'Please check the ticket channel for updates' })
        .setTimestamp();

      await interaction.editReply({ embeds: [userEmbed] });

      // Notify moderators
      const moderatorChannel = guild.channels.cache.find(channel => 
        channel.name.includes('mod') || channel.name.includes('admin') || channel.name.includes('staff')
      );

      if (moderatorChannel) {
        const notifyEmbed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('🎫 New Support Ticket')
          .setDescription(`**${subject}**`)
          .addFields(
            { name: '📋 Ticket ID', value: ticket.ticketId.slice(0, 8), inline: true },
            { name: '📂 Category', value: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '), inline: true },
            { name: '👤 User', value: `<@${interaction.user.id}>`, inline: true },
            { name: '💬 Channel', value: `<#${ticketChannel.id}>`, inline: true }
          )
          .setTimestamp();

        await moderatorChannel.send({ embeds: [notifyEmbed] });
      }

    } catch (error) {
      console.error('Error creating ticket:', error);
      await interaction.editReply({
        content: '❌ An error occurred while creating your ticket. Please try again.',
        ephemeral: true
      });
    }
  }
}; 