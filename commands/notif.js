const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notif')
    .setDescription('Set a channel for automated Growtopia player fluctuation notifications')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where notifications will be sent')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('channel');

      if (!channel.isTextBased()) {
        return interaction.reply({ content: '❌ Please select a valid text channel!', ephemeral: true });
      }

      db.setNotificationChannel(channel.id);

      await interaction.reply({
        content: `✅ Notification channel successfully set to <#${channel.id}>! Real-time alerts will be sent there.`,
        ephemeral: true
      });
    } catch (err) {
      console.error('[Command Error] Failed to execute /notif:', err.message);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred while setting up notifications.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
