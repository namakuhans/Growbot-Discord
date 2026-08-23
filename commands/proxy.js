const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const proxyService = require('../services/proxyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('proxy')
    .setDescription('Update daftar proxy menggunakan file .txt')
    .addAttachmentOption(option => 
      option.setName('file')
        .setDescription('Upload file .txt berisi daftar proxy (1 proxy per baris)')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const attachment = interaction.options.getAttachment('file');

      if (!attachment.name.endsWith('.txt')) {
        return await interaction.editReply('❌ File harus berformat **.txt**!');
      }

      // Download isi file txt
      const response = await axios.get(attachment.url, { responseType: 'text' });
      const proxyData = response.data;

      const success = proxyService.saveProxies(proxyData);

      if (success) {
        const count = proxyService.getProxyCount();
        await interaction.editReply(`✅ Berhasil memperbarui proxy! Total **${count}** proxy aktif terdaftar.`);
      } else {
        await interaction.editReply('❌ Gagal menyimpan file proxy ke database lokal.');
      }

    } catch (err) {
      console.error('[Command Error] Gagal mengeksekusi /proxy:', err.message);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: '❌ Terjadi kesalahan saat memproses file proxy.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
