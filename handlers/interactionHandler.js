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
    else if (interaction.isStringSelectMenu()) {
      await interaction.deferUpdate().catch(() => {});

      const active = db.getActiveMonitoring() || {
        channelId: interaction.channelId,
        messageId: interaction.message.id,
        timeframe: 60,
        style: 'fill_value'
      };

      let newTimeframe = Number(active.timeframe) || 60;
      let newStyle = active.style || 'fill_value';

      if (interaction.customId === 'select_timeframe') {
        newTimeframe = parseInt(interaction.values[0], 10);
      } else if (interaction.customId === 'select_style') {
        newStyle = interaction.values[0];
      }

      db.setActiveMonitoring(interaction.channelId, interaction.message.id, newTimeframe, newStyle);

      const payload = buildMonitoringPayload(interaction.client, newTimeframe, newStyle);
      await interaction.message.edit(payload);
    }
  } catch (err) {
    console.error('[Interaction Error] Failure:', err.message);
  }
}

module.exports = { handleInteraction };
