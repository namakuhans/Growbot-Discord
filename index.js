const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const config = require('./config/config');
const db = require('./services/database');
const { fetchOnlinePlayers } = require('./services/fetcher');
const { generateChartUrl, formatTimeframeLabel, getStyleLabel } = require('./services/chartService');
const { createMonitoringComponents } = require('./components/buttons');
const gtCommand = require('./commands/gt');
const proxyCommand = require('./commands/proxy');
const notifCommand = require('./commands/notif');

// Animated GIF Thumbnail URL for Embed
const THUMBNAIL_URL = 'https://cdn.discordapp.com/attachments/1407966960498642965/1407967063657681037/Proyek_Baru_121_B8AF8E8.gif?ex=6a80a8c2&is=6a7f5742&hm=1e1d6578de692';

// Variabel untuk menyimpan cache jumlah player terakhir guna mendeteksi perubahan
let lastKnownPlayerCount = null;

// =================================================================
// 1. GLOBAL UNHANDLED ERROR CATCHERS
// =================================================================
process.on('unhandledRejection', (reason) => {
  console.error('[Fatal Error] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Fatal Error] Uncaught Exception:', err.message);
});

// =================================================================
// 2. DISCORD CLIENT INITIALIZATION
// =================================================================
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// =================================================================
// 3. HELPER FORMATTER UNTUK WAKTU WIB (UTC+7)
// =================================================================
function getWibTimestampString() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('id-ID', options);
  const parts = formatter.formatToParts(now);
  
  let weekday = '', day = '', month = '', year = '', hour = '', minute = '', second = '';
  for (const p of parts) {
    if (p.type === 'weekday') weekday = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'month') month = p.value;
    if (p.type === 'year') year = p.value;
    if (p.type === 'hour') hour = p.value;
    if (p.type === 'minute') minute = p.value;
    if (p.type === 'second') second = p.value;
  }

  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${formattedWeekday}, ${day} ${formattedMonth} ${year} | ${hour}.${minute}.${second} (WIB)`;
}

// =================================================================
// 4. HELPER BUILDER UNTUK MONITORING PAYLOAD
// =================================================================
function buildMonitoringPayload(timeframeMinutes, styleOption) {
  const history = db.getHistory();
  const latestCount = history.length > 0 ? history[history.length - 1].count : 0;
  
  const chartUrl = generateChartUrl(history, timeframeMinutes, styleOption);
  const timeframeText = formatTimeframeLabel(timeframeMinutes);
  const styleDisplayLabel = getStyleLabel(styleOption);

  const currentUnixSec = Math.floor(Date.now() / 1000);
  const customWibTimeStr = getWibTimestampString();

  const embed = new EmbedBuilder()
    .setTitle('<a:emoji_11:1342592665337856021> 𝗚𝗿𝗼𝘄𝘁𝗼𝗽𝗶𝗮 𝗟𝗶𝘃𝗲 𝗦𝗲𝗿𝘃𝗲𝗿 𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗶𝗻𝗴')
    .setDescription(
      'Real-time statistics dashboard for monitoring active Growtopia online player counts with interactive charts.\n\n' +
      '🛠️ **Custom Bot Development Services (Discord, Telegram & WhatsApp)**\n' +
      'Need a custom bot or selfbot for your server, business, or project automation?\n' +
      'Contact Developer: <@758224726526656513>'
    )
    .setColor('#FF3333')
    .setThumbnail(THUMBNAIL_URL)
    .addFields(
      { name: '<a:online:1409290610870849609> 𝗢𝗡𝗟𝗜𝗡𝗘 𝗣𝗟𝗔𝗬𝗘𝗥 𝗖𝗨𝗥𝗥𝗘𝗡𝗧𝗟𝗬', value: `\`${latestCount.toLocaleString()}\` Players`, inline: true },
      { name: '<a:emoji_23:1349148026400276500> 𝗧𝗜𝗠𝗘𝗙𝗥𝗔𝗠𝗘 𝗚𝗥𝗔𝗣𝗛𝗜𝗖', value: `\`${timeframeText}\``, inline: true },
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

// =================================================================
// 5. RENDER & EDIT EMBED HANDLER (HANYA JIKA ADA PERUBAHAN)
// =================================================================
async function renderAndEditEmbed() {
  const active = db.getActiveMonitoring();
  if (!active) return;

  const currentStyle = active.style || 'fill_value';
  const currentTimeframe = Number(active.timeframe) || 60;

  try {
    const channel = await client.channels.fetch(active.channelId).catch(() => null);
    if (!channel) return;

    const message = await channel.messages.fetch(active.messageId).catch(() => null);
    if (!message) return;

    const payload = buildMonitoringPayload(currentTimeframe, currentStyle);
    await message.edit(payload);
  } catch (err) {
    console.error('[Discord Error] Edit Embed Failure:', err.message);
  }
}

// =================================================================
// 6. CHECK & SEND NOTIFICATION (DENGAN TAG @everyone JIKA BANNED)
// =================================================================
async function checkAndSendNotification(newCount) {
  const channelId = db.getNotificationChannel();
  if (!channelId) return;

  const history = db.getHistory();
  if (history.length === 0) return;

  const prevCount = history[history.length - 1].count;

  if (newCount === prevCount) return;

  const percentChange = ((newCount - prevCount) / prevCount) * 100;
  const absChange = Math.abs(percentChange).toFixed(2);

  let emoji = '<a:StatusTypingIdle:1409293104766255247>'; // NORMAL
  let statusText = 'Stable';
  let arrow = '→';
  let isBanned = false;

  if (percentChange < -1.0) {
    emoji = '<a:StatusTypingDND:1409292967675695198>'; // BANNED (Turun > 1%)
    statusText = 'Ban Rate';
    arrow = '↓';
    isBanned = true;
  } else if (percentChange > 1.0) {
    emoji = '<a:StatusTyping:1409292656437235732>'; // SAFE (Naik > 1%)
    statusText = 'Player Surge';
    arrow = '↑';
  } else if (percentChange >= -0.8 && percentChange <= 0.8) {
    emoji = '<a:StatusTypingIdle:1409293104766255247>'; // NORMAL
    statusText = 'Activity';
    arrow = '→';
  } else {
    return;
  }

  const currentUnixSec = Math.floor(Date.now() / 1000);
  const contentBody = `**${emoji} [<t:${currentUnixSec}:T>] ${statusText} ${arrow} (${prevCount.toLocaleString()} → ${newCount.toLocaleString()} / ${percentChange > 0 ? '+' : ''}${absChange}%)**`;

  // Tambahkan @everyone di atas baris pesan berformat **...** jika status BANNED
  const finalMessage = isBanned ? `@everyone\n${contentBody}` : contentBody;

  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (channel && channel.isTextBased()) {
      await channel.send(finalMessage);
    }
  } catch (err) {
    console.error('[Notification Error] Failed to send alert:', err.message);
  }
}

// =================================================================
// 7. CLIENT READY & EVENT DRIVEN POLLING
// =================================================================
client.once('ready', async () => {
  console.log(`🤖 Bot logged in as: ${client.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(config.TOKEN);
    await rest.put(
      Routes.applicationCommands(config.CLIENT_ID),
      { body: [gtCommand.data.toJSON(), proxyCommand.data.toJSON(), notifCommand.data.toJSON()] }
    );
    console.log('[System] Slash Commands (/gt, /proxy, /notif) successfully registered.');
  } catch (err) {
    console.error('[System Error] Failed to register commands:', err.message);
  }

  setInterval(async () => {
    const count = await fetchOnlinePlayers();
    if (count !== null) {
      if (lastKnownPlayerCount === null || count !== lastKnownPlayerCount) {
        await checkAndSendNotification(count);
        db.addHistoryRecord(count);
        await renderAndEditEmbed();
        lastKnownPlayerCount = count;
      }
    }
  }, config.FETCH_INTERVAL);
});

// =================================================================
// 8. INTERACTION EVENT LISTENER
// =================================================================
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'gt') {
        await gtCommand.execute(interaction);
      } else if (interaction.commandName === 'proxy') {
        await proxyCommand.execute(interaction);
      } else if (interaction.commandName === 'notif') {
        await notifCommand.execute(interaction);
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

      const payload = buildMonitoringPayload(newTimeframe, newStyle);
      await interaction.message.edit(payload);
    }
  } catch (err) {
    console.error('[Interaction Error] Failure:', err.message);
  }
});

// =================================================================
// 9. LOGIN DISCORD BOT
// =================================================================
client.login(config.TOKEN);
