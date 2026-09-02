const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const proxyService = require('../services/proxyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delproxy')
    .setDescription('Hapus semua proxy yang tersimpan di database'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const success = proxyService.clearProxies();

      if (success) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🗑️ Proxy Berhasil Dihapus')
          .setDescription('Semua data proxy telah dibersihkan dari database dan koneksi di-reset ke Direct Connection.')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Gagal Menghapus Proxy')
          .setDescription('Terjadi kesalahan saat menghapus data proxy dari database.')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('[Command Error] Gagal mengeksekusi /delproxy:', err.message);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: '❌ Terjadi kesalahan saat memproses perintah hapus proxy.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
