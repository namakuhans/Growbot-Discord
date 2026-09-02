const { Client, GatewayIntentBits, ActivityType, Options } = require('discord.js');
const config = require('./config/config');
const db = require('./services/database');
const { fetchOnlinePlayers } = require('./services/fetcher');
const { renderAndEditEmbed } = require('./services/monitoringService');
const { checkAndSendNotification } = require('./services/notificationService');
const { registerCommands } = require('./handlers/commandHandler');
const { handleInteraction } = require('./handlers/interactionHandler');

// Cache jumlah player terakhir guna mendeteksi perubahan
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
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    MessageManager: 0,
    StageInstanceManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildScheduledEventManager: 0,
    VoiceStateManager: 0,
    GuildStickerManager: 0,
    GuildEmojiManager: 0
  })
});

// =================================================================
// 3. HELPER DYNAMIC BOT RPC (WATCHING ONLINE PLAYERS)
// =================================================================
function updateBotPresence(playerCount) {
  if (!client.user) return;
  const countStr = playerCount !== null ? playerCount.toLocaleString() : '0';
  client.user.setPresence({
    activities: [{
      name: `${countStr} Online Players`,
      type: ActivityType.Watching
    }],
    status: 'online'
  });
}

// =================================================================
// 4. CLIENT READY & POLLING LOOP
// =================================================================
client.once('ready', async () => {
  console.log(`🤖 Bot logged in as: ${client.user.tag}`);

  // Inisialisasi Rich Presence Awal
  const initialHistory = db.getHistory();
  const initialCount = initialHistory.length > 0 ? initialHistory[initialHistory.length - 1].count : 0;
  updateBotPresence(initialCount);

  // Registrasi Slash Commands
  await registerCommands();

  // Polling Data Player
  setInterval(async () => {
    const count = await fetchOnlinePlayers();
    if (count !== null) {
      updateBotPresence(count);

      await checkAndSendNotification(client, count);
      db.addHistoryRecord(count);
      await renderAndEditEmbed(client);
      lastKnownPlayerCount = count;
    }
  }, config.FETCH_INTERVAL || 60000);
});

// =================================================================
// 5. INTERACTION EVENT LISTENER
// =================================================================
client.on('interactionCreate', (interaction) => handleInteraction(interaction));

// =================================================================
// 6. LOGIN DISCORD BOT
// =================================================================
client.login(config.TOKEN);
