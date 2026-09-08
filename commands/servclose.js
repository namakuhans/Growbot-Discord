const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');
const { renderAndEditEmbed } = require('../services/monitoringService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servclose')
    .setDescription('Close custom bot development service status'),

  async execute(interaction) {
    try {
      db.setServiceStatus(false);
      await interaction.reply({
        content: '🔒 **Service Status Updated:** Service is now **CLOSED**!',
        ephemeral: true
      });
      await renderAndEditEmbed(interaction.client);
    } catch (err) {
      console.error('[Command Error] Failed to execute /servclose:', err.message);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred while closing service.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
