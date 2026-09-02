const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../services/database');
const { fetchOnlinePlayers } = require('../services/fetcher');
const { generateChartUrl, getStyleLabel, getDynamicColorConfig } = require('../services/chartService');
const { createMonitoringComponents } = require('../components/buttons');

const { getWibTimestampString } = require('../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display real-time Growtopia player monitoring dashboard'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const currentCount = await fetchOnlinePlayers();
      if (currentCount !== null) {
        db.addHistoryRecord(currentCount);
      }

      const history = db.getHistory();
      const latestCount = history.length > 0 ? history[history.length - 1].count : 0;
      const defaultStyle = 'fill_value';
      
      const colorConfig = getDynamicColorConfig(history, defaultStyle);
      const chartUrl = generateChartUrl(history, defaultStyle, colorConfig);
      const styleDisplayLabel = getStyleLabel(defaultStyle);

      const currentUnixSec = Math.floor(Date.now() / 1000);
      const customWibTimeStr = getWibTimestampString();

      // Gambar Thumbnail dari Profil Avatar Bot Secara Dinamis
      const botAvatarUrl = interaction.client.user.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 });

      const embed = new EmbedBuilder()
        .setTitle('<a:emoji_11:1342592665337856021> 𝗚𝗿𝗼𝘄𝘁𝗼𝗽𝗶𝗮 𝗟𝗶𝘃𝗲 𝗦𝗲𝗿𝘃𝗲𝗿 𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗶𝗻𝗴')
        .setDescription(
          'Real-time statistics dashboard for monitoring active Growtopia online player counts with interactive charts.\n\n' +
          '🛠️ **Custom Bot Development Services (Discord, Telegram & WhatsApp)**\n' +
          'Need a custom bot or selfbot for your server, business, or project automation?\n' +
          'Contact Developer: <@758224726526656513>'
        )
        .setColor(colorConfig.hex)
        .setThumbnail(botAvatarUrl)
        .addFields(
          { name: '<a:online:1409290610870849609> 𝗢𝗡𝗟𝗜𝗡𝗘 𝗣𝗟𝗔𝗬𝗘𝗥 𝗖𝗨𝗥𝗥𝗘𝗡𝗧𝗟𝗬', value: `\`${latestCount.toLocaleString()}\` Players`, inline: true },
          { name: '<a:emoji_22:1349147982498500824> 𝗩𝗜𝗦𝗨𝗔𝗟 𝗦𝗧𝗬𝗟𝗘', value: `\`${styleDisplayLabel}\``, inline: true },
          { name: '<a:emoji_23:1349148026400276500> **Last Update**', value: `<t:${currentUnixSec}:R>`, inline: false }
        )
        .setImage(chartUrl)
        .setFooter({ text: `! iHannsy A.K.A MasPakan - Aurhelana ©\nGrowtopia Server Stats - ${customWibTimeStr}` });

      const replyMessage = await interaction.editReply({
        embeds: [embed],
        components: createMonitoringComponents(defaultStyle)
      });

      db.setActiveMonitoring(interaction.channelId, replyMessage.id, 60, defaultStyle);

    } catch (err) {
      console.error('[Command Error] Failed to execute /stats:', err.message);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: '❌ An error occurred while loading GT monitoring.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
