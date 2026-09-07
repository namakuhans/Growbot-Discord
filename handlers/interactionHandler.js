const { EmbedBuilder } = require('discord.js');
const { isAuthorized } = require('../utils/permissions');
const { commands } = require('./commandHandler');
const db = require('../services/database');
const { buildMonitoringPayload } = require('../services/monitoringService');

async function handleInteraction(interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      if (!isAuthorized(interaction)) {
        return await interaction.reply({
          content: '❌ **Access Denied:** You do not have permission to use this command!',
          ephemeral: true
        });
      }

      const command = commands.get(interaction.commandName);
      if (command) {
        await command.execute(interaction);
      }
    }
    else if (interaction.isButton()) {
      if (interaction.customId === 'btn_services') {
        const isServiceOpen = db.getServiceStatus();

        if (isServiceOpen) {
          const dmEmbed = new EmbedBuilder()
            .setTitle('🛠️ Custom Bot Development Services')
            .setColor(0x00FF66)
            .setDescription(
              'Halo! Terima kasih telah tertarik dengan layanan Custom Bot Development.\n\n' +
              '📩 **Informasi Kontak Developer:**\n' +
              'Sistem telah memberi tahu Developer. Anda dapat langsung mengirim pesan (Direct Message) ke Developer untuk diskusi lebih rinci terkait kebutuhan bot Anda:\n' +
              '👉 **Developer:** <@758224726526656513>\n\n' +
              'Layanan mencakup pembuatan bot Discord, Telegram, WhatsApp, serta solusi otomatisasi kustom.'
            )
            .setFooter({ text: 'Growtopia Server Stats - Bot Development Services' })
            .setTimestamp();

          try {
            await interaction.user.send({ embeds: [dmEmbed] });
            await interaction.reply({
              content: '✅ **Pesan Terkirim:** Silakan periksa Direct Message (DM) Anda untuk informasi kontak Developer!',
              ephemeral: true
            });
          } catch (dmErr) {
            console.error('[Button Error] Failed to send DM:', dmErr.message);
            await interaction.reply({
              content: '⚠️ **Gagal Mengirim DM:** Mohon buka pengaturan privasi Direct Message (DM) akun Discord Anda agar bot dapat mengirimkan informasi kontak.',
              ephemeral: true
            });
          }
        } else {
          const closedEmbed = new EmbedBuilder()
            .setTitle('🔒 Service Currently Closed')
            .setColor(0xFF0055)
            .setDescription(
              'Mohon maaf, saat ini layanan Custom Bot Development sedang **TUTUP (CLOSED)**.\n\n' +
              'Silakan cek kembali di lain waktu saat layanan kembali dibuka.'
            )
            .setFooter({ text: 'Growtopia Server Stats - Bot Development Services' })
            .setTimestamp();

          await interaction.reply({
            embeds: [closedEmbed],
            ephemeral: true
          });
        }
      }
    }
    else if (interaction.isStringSelectMenu()) {
      await interaction.deferUpdate().catch(() => {});

      const active = db.getActiveMonitoring() || {
        channelId: interaction.channelId,
        messageId: interaction.message.id,
        style: 'fill_value'
      };

      let newStyle = active.style || 'fill_value';

      if (interaction.customId === 'select_style') {
        newStyle = interaction.values[0];
      }

      db.setActiveMonitoring(interaction.channelId, interaction.message.id, 60, newStyle);

      const payload = buildMonitoringPayload(interaction.client, newStyle);
      await interaction.message.edit(payload);
    }
  } catch (err) {
    console.error('[Interaction Error] Failure:', err.message);
  }
}

module.exports = { handleInteraction };
