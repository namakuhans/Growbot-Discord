const { ContainerBuilder, ButtonStyle, MessageFlags } = require('discord.js');
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

  const isServiceOpen = db.getServiceStatus();

  const container = new ContainerBuilder()
    .setAccentColor(accentColorInt)
    .addSectionComponents((section) => {
      section.addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent('# <a:emoji_11:1342592665337856021> 𝗚𝗿𝗼𝘄𝘁𝗼𝗽𝗶𝗮 𝗟𝗶𝘃𝗲 𝗦𝗲𝗿𝘃𝗲𝗿 𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗶𝗻𝗴'),
        (textDisplay) => textDisplay.setContent(
          'Real-time statistics dashboard for monitoring active Growtopia online player counts with interactive charts.'
        )
      );

      if (botAvatarUrl) {
        section.setThumbnailAccessory((thumbnail) => thumbnail.setURL(botAvatarUrl));
      }

      return section;
    })
    .addSeparatorComponents((separator) => separator.setDivider(true).setSpacing(2))
    .addSectionComponents((section) => {
      section.addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent('🛠️ **Custom Bot Development Services (Discord, Telegram & WhatsApp)**'),
        (textDisplay) => textDisplay.setContent(
          'Need a custom bot or selfbot for your server, business, or project automation?\n' +
          'Please press the button on the side to connect directly with the Developer!'
        )
      );

      section.setButtonAccessory((button) =>
        button
          .setCustomId('btn_services')
          .setLabel(isServiceOpen ? 'SERVICES HERE!' : 'SERVICES CLOSED')
          .setEmoji('<:Developer:1546681999736045588>')
          .setStyle(isServiceOpen ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setDisabled(!isServiceOpen)
      );

      return section;
    })
    .addSeparatorComponents((separator) => separator.setDivider(true).setSpacing(2))
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(
        `<a:online:1409290610870849609> **𝗢𝗡𝗟𝗜𝗡E 𝗣𝗟𝗔𝗬𝗘𝗥 𝗖𝗨𝗥𝗥𝗘𝗡𝗧𝗟𝗬**: \`${latestCount.toLocaleString()}\` Players\n` +
        `<a:emoji_22:1349147982498500824> **𝗩𝗜𝗦𝗨𝗔𝗟 𝗦𝗧𝗬𝗟𝗘**: \`${styleDisplayLabel}\`\n` +
        `<a:emoji_23:1349148026400276500> **Last Update**: <t:${currentUnixSec}:R>`
      )
    )
    .addMediaGalleryComponents((gallery) =>
      gallery.addItems((item) => item.setURL(chartUrl))
    )
    .addActionRowComponents((actionRow) =>
      actionRow.setComponents(createStyleSelectMenu())
    )
    .addSeparatorComponents((separator) => separator.setDivider(true).setSpacing(2))
    .addMediaGalleryComponents((gallery) =>
      gallery.addItems((item) => item.setURL(BANNER_GIF_URL))
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`-# ! iHannsy A.K.A MasPakan - Aurhelana ©\n-# Growtopia Server Stats - ${customWibTimeStr}`)
    );

  return {
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
