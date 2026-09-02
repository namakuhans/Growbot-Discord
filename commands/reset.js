const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset semua data riwayat monitoring dan pengaturan channel'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      db.resetData();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔄 Data Berhasil Direset')
        .setDescription('Semua riwayat player count, active monitoring, dan pengaturan notifikasi channel telah dibersihkan.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error('[Command Error] Gagal mengeksekusi /reset:', err.message);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: '❌ Terjadi kesalahan saat memproses perintah reset data.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
