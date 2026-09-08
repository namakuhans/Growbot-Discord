const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');
const { renderAndEditEmbed } = require('../services/monitoringService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servopen')
    .setDescription('Open custom bot development service status'),

  async execute(interaction) {
    try {
      db.setServiceStatus(true);
      await interaction.reply({
        content: '✅ **Service Status Updated:** Service is now **OPEN**!',
        ephemeral: true
      });
      await renderAndEditEmbed(interaction.client);
    } catch (err) {
      console.error('[Command Error] Failed to execute /servopen:', err.message);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred while opening service.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
