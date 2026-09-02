const { REST, Routes, Collection } = require('discord.js');
const config = require('../config/config');

const gtCommand = require('../commands/gt');
const proxyCommand = require('../commands/proxy');
const delproxyCommand = require('../commands/delproxy');
const notifCommand = require('../commands/notif');

const commands = new Collection();
commands.set(gtCommand.data.name, gtCommand);
commands.set(proxyCommand.data.name, proxyCommand);
commands.set(delproxyCommand.data.name, delproxyCommand);
commands.set(notifCommand.data.name, notifCommand);

async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(config.TOKEN);
    const commandData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());

    await rest.put(
      Routes.applicationCommands(config.CLIENT_ID),
      { body: commandData }
    );
    console.log('[System] Slash Commands (/gt, /proxy, /delproxy, /notif) successfully registered.');
  } catch (err) {
    console.error('[System Error] Failed to register commands:', err.message);
  }
}

module.exports = {
  commands,
  registerCommands
};
