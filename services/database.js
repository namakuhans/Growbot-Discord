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
        this.data = JSON.parse(raw);
        if (!this.data.notificationChannelId) this.data.notificationChannelId = null;
        console.log('[DB] Database lokal berhasil dimuat.');
      }
    } catch (err) {
      console.error('[DB Error] Gagal membaca file database:', err.message);
      this.data = { activeMonitoring: null, notificationChannelId: null, history: [] };
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
    const now = Date.now();
    this.data.history.push({ timestamp: now, count });
    
    const cutoff = now - MAX_HISTORY_MS;
    this.data.history = this.data.history.filter(item => item.timestamp >= cutoff);
    
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

  getHistory() {
    return this.data.history;
  }
}

module.exports = new DatabaseService();
