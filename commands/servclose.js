const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');
const { renderAndEditEmbed } = require('../services/monitoringService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servclose')
    .setDescription('Tutup status layanan bot development (Service Close)'),

  async execute(interaction) {
    try {
      db.setServiceStatus(false);
      await interaction.reply({
        content: '🔒 **Status Layanan Diperbarui:** Service sekarang **CLOSED**!',
        ephemeral: true
      });
      await renderAndEditEmbed(interaction.client);
    } catch (err) {
      console.error('[Command Error] Failed to execute /servclose:', err.message);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Terjadi kesalahan saat menutup service.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
