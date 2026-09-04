const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notif')
    .setDescription('Set channel dan role opsional untuk notifikasi fluktuasi player')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel tempat notifikasi akan dikirimkan')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role yang akan di-mention saat notifikasi (opsional, default: @everyone)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('channel');
      const role = interaction.options.getRole('role');

      if (!channel.isTextBased()) {
        return interaction.reply({ content: '❌ Mohon pilih channel teks yang valid!', ephemeral: true });
      }

      const roleId = role ? role.id : null;
      db.setNotificationConfig(channel.id, roleId);

      const roleMentionText = role ? `<@&${role.id}>` : '`@everyone`';

      await interaction.reply({
        content: `✅ Channel notifikasi berhasil diatur ke <#${channel.id}> dengan tag mention ${roleMentionText}!`,
        ephemeral: true
      });
    } catch (err) {
      console.error('[Command Error] Failed to execute /notif:', err.message);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred while setting up notifications.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
