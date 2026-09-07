const { ContainerBuilder, MessageFlags } = require('discord.js');
const db = require('./database');
const { generateChartUrl, getStyleLabel, getDynamicColorConfig } = require('./chartService');
const { createStyleSelectMenu } = require('../components/buttons');
const { getWibTimestampString } = require('../utils/time');

const BANNER_GIF_URL = 'https://cdn.discordapp.com/attachments/1407966960498642965/1410705503692132503/Proyek_Baru_129_F60CEC6.gif?ex=6aa05fe1&is=6a9f0e61&hm=890a3db8446f16fefa0a0031334b91fa5cbfee39700f02f0628b055a1a523a8d&';

function buildMonitoringPayload(client, styleOption) {
  const history = db.getHistory();
  const latestCount = history.length > 0 ? history[history.length - 1].count : 0;

  const colorConfig = getDynamicColorConfig(history, styleOption);
  const chartUrl = generateChartUrl(history, styleOption, colorConfig);
  const styleDisplayLabel = getStyleLabel(styleOption);

  const currentUnixSec = Math.floor(Date.now() / 1000);
  const customWibTimeStr = getWibTimestampString();

  const botAvatarUrl = client.user ? client.user.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 }) : null;
  const accentColorInt = parseInt(colorConfig.hex.replace('#', ''), 16);

  const container = new ContainerBuilder()
    .setAccentColor(accentColorInt)
    .addSectionComponents((section) => {
      section.addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          '# <a:emoji_11:1342592665337856021> 𝗚𝗿𝗼𝘄𝘁𝗼𝗽𝗶𝗮 𝗟𝗶𝘃𝗲 𝗦𝗲𝗿𝘃𝗲𝗿 𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗶𝗻𝗴\n\n' +
          'Real-time statistics dashboard for monitoring active Growtopia online player counts with interactive charts.\n\n' +
          '🛠️ **Custom Bot Development Services (Discord, Telegram & WhatsApp)**\n' +
          'Need a custom bot or selfbot for your server, business, or project automation?\n' +
          'Contact Developer: <@758224726526656513>'
        )
      );

      if (botAvatarUrl) {
        section.setThumbnailAccessory((thumbnail) => thumbnail.setURL(botAvatarUrl));
      }

      return section;
    })
    .addSeparatorComponents((separator) => separator)
    .addSectionComponents((section) => {
      section.addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          `<a:online:1409290610870849609> **𝗢𝗡𝗟𝗜𝗡𝗘 𝗣𝗟𝗔𝗬𝗘𝗥 𝗖𝗨𝗥𝗥𝗘𝗡𝗧𝗟𝗬**: \`${latestCount.toLocaleString()}\` Players\n` +
          `<a:emoji_22:1349147982498500824> **𝗩𝗜𝗦𝗨𝗔𝗟 𝗦𝗧𝗬𝗟𝗘**: \`${styleDisplayLabel}\`\n` +
          `<a:emoji_23:1349148026400276500> **Last Update**: <t:${currentUnixSec}:R>`
        )
      );
      return section;
    })
    .addMediaGalleryComponents((gallery) =>
      gallery.addItems((item) => item.setURL(chartUrl))
    )
    .addActionRowComponents((actionRow) =>
      actionRow.setComponents(createStyleSelectMenu(styleOption))
    )
    .addSeparatorComponents((separator) => separator)
    .addMediaGalleryComponents((gallery) =>
      gallery.addItems((item) => item.setURL(BANNER_GIF_URL))
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`-# ! iHannsy A.K.A MasPakan - Aurhelana ©\n-# Growtopia Server Stats - ${customWibTimeStr}`)
    );

  return {
    embeds: [],
    components: [container],
    flags: MessageFlags.IsComponentsV2
  };
}

async function renderAndEditEmbed(client) {
  const active = db.getActiveMonitoring();
  if (!active) return;

  const currentStyle = active.style || 'fill_value';

  try {
    const channel = await client.channels.fetch(active.channelId).catch(() => null);
    if (!channel) return;

    const message = await channel.messages.fetch(active.messageId).catch(() => null);
    if (!message) return;

    const payload = buildMonitoringPayload(client, currentStyle);
    await message.edit(payload);
  } catch (err) {
    console.error('[Discord Error] Edit Embed Failure:', err.message);
  }
}

module.exports = {
  buildMonitoringPayload,
  renderAndEditEmbed
};
