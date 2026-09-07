const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');
const { renderAndEditEmbed } = require('../services/monitoringService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servopen')
    .setDescription('Buka status layanan bot development (Service Open)'),

  async execute(interaction) {
    try {
      db.setServiceStatus(true);
      await interaction.reply({
        content: '✅ **Status Layanan Diperbarui:** Service sekarang **OPEN**!',
        ephemeral: true
      });
      await renderAndEditEmbed(interaction.client);
    } catch (err) {
      console.error('[Command Error] Failed to execute /servopen:', err.message);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Terjadi kesalahan saat membuka service.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
