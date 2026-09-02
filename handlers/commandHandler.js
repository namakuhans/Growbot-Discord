const { REST, Routes, Collection } = require('discord.js');
const config = require('../config/config');

const statsCommand = require('../commands/stats');
const proxyCommand = require('../commands/proxy');
const delproxyCommand = require('../commands/delproxy');
const notifCommand = require('../commands/notif');
const resetCommand = require('../commands/reset');

const commands = new Collection();
commands.set(statsCommand.data.name, statsCommand);
commands.set(proxyCommand.data.name, proxyCommand);
commands.set(delproxyCommand.data.name, delproxyCommand);
commands.set(notifCommand.data.name, notifCommand);
commands.set(resetCommand.data.name, resetCommand);

async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(config.TOKEN);
    const commandData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());

    await rest.put(
      Routes.applicationCommands(config.CLIENT_ID),
      { body: commandData }
    );
    console.log('[System] Slash Commands (/stats, /proxy, /delproxy, /notif, /reset) successfully registered.');
  } catch (err) {
    console.error('[System Error] Failed to register commands:', err.message);
  }
}

module.exports = {
  commands,
  registerCommands
};
