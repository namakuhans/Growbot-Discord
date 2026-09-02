const db = require('./database');

async function checkAndSendNotification(client, newCount) {
  const channelId = db.getNotificationChannel();
  if (!channelId) return;

  const history = db.getHistory();
  if (history.length === 0) return;

  const prevCount = history[history.length - 1].count;

  if (newCount === prevCount) return;

  const percentChange = ((newCount - prevCount) / prevCount) * 100;
  const formattedPercent = (percentChange > 0 ? '+' : '') + percentChange.toFixed(2) + '%';

  let emoji = '<a:StatusTypingIdle:1409293104766255247>';
  let statusText = 'Stable';
  let arrow = '→';
  let isBanned = false;

  if (percentChange < -1.0) {
    emoji = '<a:StatusTypingDND:1409292967675695198>';
    statusText = 'Ban Rate';
    arrow = '↓';
    isBanned = true;
  } else if (percentChange > 1.0) {
    emoji = '<a:StatusTyping:1409292656437235732>';
    statusText = 'Player Surge';
    arrow = '↑';
  } else if (percentChange >= -0.8 && percentChange <= 0.8) {
    emoji = '<a:StatusTypingIdle:1409293104766255247>';
    statusText = 'Activity';
    arrow = '→';
  } else {
    return;
  }

  const currentUnixSec = Math.floor(Date.now() / 1000);
  const contentBody = `**${emoji} [<t:${currentUnixSec}:T>] ${statusText} ${arrow} (${prevCount.toLocaleString()} → ${newCount.toLocaleString()} / ${formattedPercent})**`;

  const finalMessage = isBanned ? `@everyone\n${contentBody}` : contentBody;

  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (channel && channel.isTextBased()) {
      const sentMessage = await channel.send(finalMessage);

      if (isBanned) {
        setTimeout(async () => {
          try {
            await sentMessage.edit(contentBody);
          } catch (editErr) {
            console.error('[Notification Error] Failed to remove @everyone tag:', editErr.message);
          }
        }, 1000);
      }
    }
  } catch (err) {
    console.error('[Notification Error] Failed to send alert:', err.message);
  }
}

module.exports = { checkAndSendNotification };
