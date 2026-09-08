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
              'Hello! Thank you for your interest in our Custom Bot Development Services.\n\n' +
              '📩 **Developer Contact Information:**\n' +
              'The system has notified the Developer. You can send a Direct Message (DM) directly to the Developer to discuss your bot requirements in detail:\n' +
              '👉 **Developer:** <@758224726526656513>\n\n' +
              'Services include custom Discord, Telegram, and WhatsApp bot development as well as custom automation solutions.'
            )
            .setFooter({ text: 'Growtopia Server Stats - Bot Development Services' })
            .setTimestamp();

          try {
            await interaction.user.send({ embeds: [dmEmbed] });
            await interaction.reply({
              content: '✅ **Message Sent:** Please check your Direct Messages (DM) for Developer contact information!',
              ephemeral: true
            });
          } catch (dmErr) {
            console.error('[Button Error] Failed to send DM:', dmErr.message);
            await interaction.reply({
              content: '⚠️ **Failed to Send DM:** Please enable Direct Messages (DM) in your Discord privacy settings so the bot can send you contact information.',
              ephemeral: true
            });
          }
        } else {
          const closedEmbed = new EmbedBuilder()
            .setTitle('🔒 Service Currently Closed')
            .setColor(0xFF0055)
            .setDescription(
              'We apologize, Custom Bot Development Services are currently **CLOSED**.\n\n' +
              'Please check back later when services reopen.'
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
