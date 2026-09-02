const { EmbedBuilder } = require('discord.js');
const db = require('./database');
const { generateChartUrl, formatTimeframeLabel, getStyleLabel } = require('./chartService');
const { createMonitoringComponents } = require('../components/buttons');
const { getWibTimestampString } = require('../utils/time');

function buildMonitoringPayload(client, timeframeMinutes, styleOption) {
  const history = db.getHistory();
  const latestCount = history.length > 0 ? history[history.length - 1].count : 0;

  const chartUrl = generateChartUrl(history, timeframeMinutes, styleOption);
  const timeframeText = formatTimeframeLabel(timeframeMinutes);
  const styleDisplayLabel = getStyleLabel(styleOption);

  const currentUnixSec = Math.floor(Date.now() / 1000);
  const customWibTimeStr = getWibTimestampString();

  const botAvatarUrl = client.user ? client.user.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 }) : null;

  const embed = new EmbedBuilder()
    .setTitle('<a:emoji_11:1342592665337856021> 𝗚𝗿𝗼𝘄𝘁𝗼𝗽𝗶𝗮 𝗟𝗶𝘃𝗲 𝗦𝗲𝗿𝘃𝗲𝗿 𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗶𝗻𝗴')
    .setDescription(
      'Real-time statistics dashboard for monitoring active Growtopia online player counts with interactive charts.\n\n' +
      '🛠️ **Custom Bot Development Services (Discord, Telegram & WhatsApp)**\n' +
      'Need a custom bot or selfbot for your server, business, or project automation?\n' +
      'Contact Developer: <@758224726526656513>'
    )
    .setColor('#FF3333')
    .setThumbnail(botAvatarUrl)
    .addFields(
      { name: '<a:online:1409290610870849609> 𝗢𝗡𝗟𝗜𝗡𝗘 𝗣𝗟𝗔𝗬𝗘𝗥 𝗖𝗨𝗥𝗥𝗘𝗡𝗧𝗟𝗬', value: `\`${latestCount.toLocaleString()}\` Players`, inline: true },
      { name: '<a:emoji_23:1349148026400276500> 𝗧𝗜𝗠𝗘𝗙𝗥𝗔𝗠E 𝗚𝗥𝗔𝗣𝗛𝗜𝗖', value: `\`${timeframeText}\``, inline: true },
      { name: '<a:emoji_22:1349147982498500824> 𝗩𝗜𝗦𝗨𝗔𝗟 𝗦𝗧𝗬𝗟𝗘', value: `\`${styleDisplayLabel}\``, inline: true },
      { name: '<a:emoji_23:1349148026400276500> **Last Update**', value: `<t:${currentUnixSec}:R>`, inline: false }
    )
    .setImage(chartUrl)
    .setFooter({ text: `! iHannsy A.K.A MasPakan - Aurhelana ©\nGrowtopia Server Stats - ${customWibTimeStr}` });

  return {
    embeds: [embed],
    components: createMonitoringComponents(timeframeMinutes, styleOption)
  };
}

async function renderAndEditEmbed(client) {
  const active = db.getActiveMonitoring();
  if (!active) return;

  const currentStyle = active.style || 'fill_value';
  const currentTimeframe = Number(active.timeframe) || 60;

  try {
    const channel = await client.channels.fetch(active.channelId).catch(() => null);
    if (!channel) return;

    const message = await channel.messages.fetch(active.messageId).catch(() => null);
    if (!message) return;

    const payload = buildMonitoringPayload(client, currentTimeframe, currentStyle);
    await message.edit(payload);
  } catch (err) {
    console.error('[Discord Error] Edit Embed Failure:', err.message);
  }
}

module.exports = {
  buildMonitoringPayload,
  renderAndEditEmbed
};
