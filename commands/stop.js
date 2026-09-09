const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Notify monitoring and notification channels that the bot is offline or shutting down'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const offlineEmbed = new EmbedBuilder()
        .setTitle('🔴 Bot Offline Notice')
        .setColor(0xFF0055)
        .setDescription(
          '**System Shutdown Notice:**\n' +
          'The Growtopia Live Server Monitoring Bot is currently **offline** or undergoing maintenance.\n\n' +
          'Real-time stats updates are temporarily suspended until the system is restarted.'
        )
        .setFooter({ text: 'Growtopia Server Stats - System Offline' })
        .setTimestamp();

      let notifyCount = 0;

      // Send to Active Monitoring Channel
      const active = db.getActiveMonitoring();
      if (active && active.channelId) {
        try {
          const statsChannel = await interaction.client.channels.fetch(active.channelId).catch(() => null);
          if (statsChannel && statsChannel.isTextBased()) {
            await statsChannel.send({ embeds: [offlineEmbed] });
            notifyCount++;
          }
        } catch (err) {
          console.error('[Stop Command Error] Failed to send notice to stats channel:', err.message);
        }
      }

      // Send to Notification Channel
      const notifConfig = db.getNotificationConfig();
      if (notifConfig && notifConfig.channelId && (!active || notifConfig.channelId !== active.channelId)) {
        try {
          const notifChannel = await interaction.client.channels.fetch(notifConfig.channelId).catch(() => null);
          if (notifChannel && notifChannel.isTextBased()) {
            await notifChannel.send({ embeds: [offlineEmbed] });
            notifyCount++;
          }
        } catch (err) {
          console.error('[Stop Command Error] Failed to send notice to notif channel:', err.message);
        }
      }

      await interaction.editReply({
        content: `✅ **Offline Notice Sent:** Offline notification embed successfully sent to ${notifyCount} channel(s)!`
      });

    } catch (err) {
      console.error('[Stop Command Error] Failed to execute /stop:', err.message);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: '❌ An error occurred while executing /stop command.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
