# Panduan Deployment Mandiri (Self-Hosting Deployment)

Dokumen ini memuat prosedur deployment aplikasi secara mandiri pada infrastruktur server VPS / Bare-Metal Linux (Ubuntu/Debian/RHEL).

---

## 1. Prasyarat Sistem

* **OS**: Linux distribution (Ubuntu 20.04/22.04 LTS direkomendasikan)
* **Runtime**: Node.js v18.x atau lebih baru
* **Package Manager**: `npm` v9.x+
* **Process Manager**: PM2 / Systemd / Docker Engine

---

## 2. Persiapan Repositori & Konfigurasi

### A. Clone Repositori & Install Dependensi
```bash
git clone <repository_url>
cd growtopia-bot
npm install --production
```

### B. Inisialisasi Berkas Konfigurasi
Salin berkas template konfigurasi dan atur kredensial Discord Bot:
```bash
cp config/config.example.js config/config.js
```

Edit `config/config.js`:
```javascript
module.exports = {
  TOKEN: "BOT_TOKEN_DISCORD_ANDA",
  CLIENT_ID: "APPLICATION_CLIENT_ID_DISCORD_ANDA",
  FETCH_INTERVAL: 10000,
  EMBED_UPDATE_INTERVAL: 10000,
  DB_PATH: "./data/data.json",
  MAX_HISTORY_MS: 86400000
};
```

### C. Inisialisasi Directory Data & List Proxy (Opsional)
```bash
mkdir -p data
touch data/proxies.txt
```
Format isi `data/proxies.txt` (satu proxy per baris):
```text
http://ip:port
http://username:password@ip:port
```

---

## 3. Opsi Deployment 1: PM2 Process Manager (Rekomendasi Utama)

PM2 memastikan proses berjalan di background dan otomatis melakukan restart jika terjadi kegagalan/crash.

### Step 1: Install PM2 Globally
```bash
npm install -g pm2
```

### Step 2: Jalankan Bot
```bash
pm2 start index.js --name "gt-monitor-bot"
```

### Step 3: Konfigurasi Auto-Start Saat System Reboot
```bash
pm2 save
pm2 startup
```
*(Jalankan perintah yang dimunculkan oleh output `pm2 startup` untuk mendaftarkan systemd service).*

### Useful Management Commands:
```bash
pm2 status                  # Cek status proses
pm2 logs gt-monitor-bot     # Streaming log runtime
pm2 restart gt-monitor-bot  # Restart aplikasi
pm2 stop gt-monitor-bot     # Hentikan aplikasi
```

---

## 4. Opsi Deployment 2: Systemd Service (Linux Native)

### Step 1: Buat File Unit Service
```bash
sudo nano /etc/systemd/system/gt-bot.service
```

Isi file dengan konfigurasi berikut (sesuaikan jalur `/path/to/growtopia-bot` dan user):
```ini
[Unit]
Description=Growtopia Monitoring Discord Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/growtopia-bot
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=gt-bot

[Install]
WantedBy=multi-user.target
```

### Step 2: Reload Systemd & Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable gt-bot
sudo systemctl start gt-bot
```

### Useful Management Commands:
```bash
sudo systemctl status gt-bot
sudo journalctl -u gt-bot -f -n 100
```

---

## 5. Opsi Deployment 3: Containerized (Docker & Docker Compose)

Jika Anda lebih memilih menjalankan aplikasi di dalam kontainer Docker yang terisolasi.

### Step 1: Buat `Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

VOLUME ["/app/data", "/app/config"]

CMD ["node", "index.js"]
```

### Step 2: Buat `docker-compose.yml`
```yaml
version: '3.8'

services:
  gt-bot:
    build: .
    container_name: gt-monitoring-bot
    restart: always
    volumes:
      - ./data:/app/data
      - ./config/config.js:/app/config/config.js
```

### Step 3: Build & Jalankan Container
```bash
docker compose up -d --build
```

### Useful Management Commands:
```bash
docker compose logs -f
docker compose down
```

---

## 6. Verifikasi Post-Deployment

1. Periksa log eksekusi dan pastikan pesan berikut muncul:
   ```text
   🤖 Bot logged in as: <BotName>#<Discriminator>
   [System] Slash Commands (/gt, /proxy, /notif) successfully registered.
   ```
2. Buka Discord server, jalankan command `/gt` di channel tujuan monitoring.
3. Uji coba interaksi dropdown menu timeframe dan style grafik pada embed.
