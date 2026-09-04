const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { DB_PATH, MAX_HISTORY_MS } = require('../config/config');

class DatabaseService {
  constructor() {
    this.filePath = path.resolve(DB_PATH);
    this.data = { activeMonitoring: null, notificationChannelId: null, history: [] };
    this.ensureDirectory();
    this.loadSync();
  }

  ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
  }

  loadSync() {
    try {
      if (fsSync.existsSync(this.filePath)) {
        const raw = fsSync.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          activeMonitoring: parsed.activeMonitoring || null,
          notificationChannelId: parsed.notificationChannelId || null,
          notificationRoleId: parsed.notificationRoleId || null,
          history: Array.isArray(parsed.history) ? parsed.history : []
        };
        console.log('[DB] Database lokal berhasil dimuat.');
      }
    } catch (err) {
      console.error('[DB Error] Gagal membaca file database:', err.message);
      this.data = { activeMonitoring: null, notificationChannelId: null, notificationRoleId: null, history: [] };
    }
  }

  async save() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB Error] Critical error saat menulis ke file database:', err.message);
    }
  }

  addHistoryRecord(count) {
    if (typeof count !== 'number' || isNaN(count)) return;

    // Jangan catat jika player count sama dengan data terakhir
    if (this.data.history.length > 0) {
      const last = this.data.history[this.data.history.length - 1];
      if (last && last.count === count) return;
    }

    const now = Date.now();
    this.data.history.push({ timestamp: now, count });
    
    const cutoff = now - MAX_HISTORY_MS;
    this.data.history = this.data.history.filter(item => item && typeof item.timestamp === 'number' && item.timestamp >= cutoff);
    
    this.save();
  }

  setActiveMonitoring(channelId, messageId, timeframe = 60, style = 'fill_value') {
    this.data.activeMonitoring = { channelId, messageId, timeframe, style };
    this.save();
  }

  getActiveMonitoring() {
    return this.data.activeMonitoring;
  }

  setNotificationChannel(channelId) {
    this.data.notificationChannelId = channelId;
    this.save();
  }

  getNotificationChannel() {
    return this.data.notificationChannelId;
  }

  setNotificationConfig(channelId, roleId = null) {
    this.data.notificationChannelId = channelId;
    this.data.notificationRoleId = roleId;
    this.save();
  }

  getNotificationConfig() {
    return {
      channelId: this.data.notificationChannelId || null,
      roleId: this.data.notificationRoleId || null
    };
  }

  getHistory() {
    return this.data.history || [];
  }

  resetData() {
    this.data = { activeMonitoring: null, notificationChannelId: null, notificationRoleId: null, history: [] };
    this.save();
    return true;
  }
}

module.exports = new DatabaseService();
