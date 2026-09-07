const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../services/database');
const { fetchOnlinePlayers } = require('../services/fetcher');
const { buildMonitoringPayload } = require('../services/monitoringService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display real-time Growtopia player monitoring dashboard'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.IsComponentsV2 });

      const currentCount = await fetchOnlinePlayers();
      if (currentCount !== null) {
        db.addHistoryRecord(currentCount);
      }

      const active = db.getActiveMonitoring();
      const defaultStyle = active ? (active.style || 'fill_value') : 'fill_value';

      const payload = buildMonitoringPayload(interaction.client, defaultStyle);

      const replyMessage = await interaction.editReply(payload);

      db.setActiveMonitoring(interaction.channelId, replyMessage.id, 60, defaultStyle);

    } catch (err) {
      console.error('[Command Error] Failed to execute /stats:', err.message);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: '❌ An error occurred while loading GT monitoring.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
