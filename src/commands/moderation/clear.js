const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete multiple messages from the channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ You do not have permission to delete messages.',
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    try {
      // Fetch messages
      const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });
      
      let messagesToDelete;
      if (targetUser) {
        messagesToDelete = messages.filter(msg => 
          msg.author.id === targetUser.id && 
          msg.createdTimestamp > Date.now() - 14 * 24 * 60 * 60 * 1000 // 14 days
        );
      } else {
        messagesToDelete = messages.filter(msg => 
          msg.createdTimestamp > Date.now() - 14 * 24 * 60 * 60 * 1000 // 14 days
        );
      }

      // Delete messages
      const deletedMessages = await interaction.channel.bulkDelete(messagesToDelete, true);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🗑️ Messages Cleared')
        .setDescription(`Successfully deleted **${deletedMessages.size}** messages.`)
        .addFields(
          { name: '📊 Deleted', value: `${deletedMessages.size} messages`, inline: true },
          { name: '👮 Cleared By', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Cleared At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        );

      if (targetUser) {
        embed.addFields({ name: '👤 Filtered By', value: `${targetUser.tag}`, inline: true });
      }

      embed.setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

      // Delete the reply after 5 seconds
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          // Reply already deleted or not accessible
        }
      }, 5000);

    } catch (error) {
      console.error('Error clearing messages:', error);
      
      if (error.code === 50034) {
        await interaction.reply({
          content: '❌ Cannot delete messages older than 14 days.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ An error occurred while clearing messages.',
          ephemeral: true
        });
      }
    }
  }
}; 