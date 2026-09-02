# Growtopia Server Monitoring Bot

Bot Discord berbasis Node.js untuk pemantauan realtime jumlah pemain online Growtopia secara otomatis. Sistem menggunakan mekanisme polling terinterval, rotasi HTTPS proxy, penyimpanan histori terlokalisasi via file JSON, serta rendering grafik dinamis menggunakan QuickChart API (Chart.js v3).

---

## Arsitektur & Komponen Utama

### 1. Polling & Ingestion Engine (`index.js` & `services/fetcher.js`)
* **Interval Execution**: Polling dijalankan menggunakan `setInterval` berdasarkan `FETCH_INTERVAL` (default: 5,000ms / 5s, dibatasi minimum 5 detik).
* **HTTP Client**: Pengambilan data dari endpoint API Growtopia dilakukan via `axios` dengan custom header spoofing (User-Agent Chrome, No-Cache).
* **Failover & Rotasi Proxy**: Menggunakan `ProxyService` (`services/proxyService.js`) untuk memutar IP proxy HTTPS secara round-robin via `https-proxy-agent`. Jika sebuah proxy mengalami kendala jaringan atau *timeout*, request akan dialihkan secara urut ke proxy berikutnya.

### 2. State & Storage Engine (`services/database.js`)
* **Persistence Mechanism**: Menggunakan `data/data.json` sebagai penyimpan state terpusat. Operasi I/O dilakukan secara *synchronous* saat inisialisasi (`loadSync`) dan *asynchronous* (`fs.promises`) saat perubahan state terjadi.
* **Data Schema**:
  ```json
  {
    "activeMonitoring": {
      "channelId": "STRING",
      "messageId": "STRING",
      "timeframe": 60,
      "style": "fill_value"
    },
    "notificationChannelId": "STRING",
    "history": [
      {
        "timestamp": 1700000000000,
        "count": 45000
      }
    ]
  }
  ```
* **Retention Policy**: Data histori tua dibersihkan otomatis berdasarkan batas `MAX_HISTORY_MS` (default: 24 jam / 86,400,000 ms) setiap kali record baru ditambahkan.

### 3. Chart Rendering Engine (`services/chartService.js`)
* **Chart Provider**: QuickChart API (`quickchart-js`).
* **Aggregation**: Histori direduksi menggunakan *bucket averaging downsampling* berdasarkan jendela timeframe yang dipilih pengguna (1, 3, 5, 15, 30, 60, atau 1440 menit). Untuk timeframe $\le 5$ menit, timestamp sumbu X menyertakan format detik (`HH:mm:ss`).
* **Styles**: Mendukung multiple konfigurasi visual Chart.js (mis. `fill_value`, `sparkline`, `stepped_line`, `bubble`, `horizontal_bar`, dll.).

### 4. Discord Interaction & Commands (`commands/`)
* **`/gt`**: Menginisialisasi dashboard pemantauan interaktif di channel tempat command dipanggil. Menyajikan embed beserta dropdown menu (`StringSelectMenuBuilder`) untuk memilih timeframe dan gaya grafik.
* **`/notif`**: Menentukan channel target untuk kalkulasi fluktuasi pemain secara terotomatisasi.
* **`/proxy`**: Menerima unggahan file `.txt` berisi daftar proxy baru (`ip:port` atau `ip:port:user:pass`), kemudian memperbarui list proxy aktif tanpa memerlukan *restart* aplikasi.

### 5. Fluctuation & Alert Handling (`index.js`)
* Menghitung persentase perubahan pemain antara record terakhir dan record sebelumnya:
  $$\Delta\% = \frac{\text{Count}_{\text{new}} - \text{Count}_{\text{prev}}}{\text{Count}_{\text{prev}}} \times 100$$
* **Kondisi Notifikasi**:
  * $\Delta\% < -1.0\%$: Terdeteksi penurunan drastis (Ban Rate / Drop). Mengirim notifikasi dengan mention `@everyone` yang secara otomatis dihapus dari konten pesan setelah jeda 5 detik (`setTimeout 5000ms`).
  * $\Delta\% > 1.0\%$: Terdeteksi lonjakan pemain (Player Surge).
  * $-0.8\% \le \Delta\% \le 0.8\%$: Kondisi normal / stabil.

---

## Struktur Direktori

```
.
├── commands/
│   ├── gt.js          # Handler slash command /gt
│   ├── notif.js       # Handler slash command /notif
│   └── proxy.js       # Handler slash command /proxy
├── components/
│   └── buttons.js     # Component builder (String Select Menus)
├── config/
│   ├── config.js      # Configuration file (di-generate dari config.example.js)
│   └── config.example.js
├── data/              # Storage directory (di-generate runtime)
│   ├── data.json      # File database JSON
│   └── proxies.txt    # List proxy HTTPS
├── services/
│   ├── chartService.js# Wrapper QuickChart & agregasi data
│   ├── database.js    # Interface CRUD file JSON
│   ├── fetcher.js     # Engine HTTP Request & Proxy Failover
│   └── proxyService.js# Parser & State Manager List Proxy
├── index.js           # Main Entry Point & Event Loop
└── package.json
```

---

## Spesifikasi Konfigurasi (`config/config.js`)

| Key | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `TOKEN` | `string` | Discord Bot Token dari Discord Developer Portal |
| `CLIENT_ID` | `string` | Application Client ID untuk registrasi Slash Commands |
| `FETCH_INTERVAL` | `number` | Interval polling API Growtopia (dalam milidetik, min: 5000ms) |
| `EMBED_UPDATE_INTERVAL` | `number` | Interval pembaruan UI Embed Discord (dalam milidetik, min: 5000ms) |
| `DB_PATH` | `string` | Jalur relatif file penyimpanan data JSON |
| `MAX_HISTORY_MS` | `number` | Batas maksimum usia simpan data histori (dalam milidetik) |

---

## Alur Eksekusi Runtime

```
[Start Engine]
      │
      ▼
Inisialisasi Database Sync & Proxy List
      │
      ▼
Login Discord REST API & Registrasi Slash Commands
      │
      ▼
Polling Loop (`setInterval`, min 5000ms)
      │
      ├─► Fetch Online Players via HTTP Proxy (Failover Loop)
      │         │
      │         ▼
      ├─► Hitung Fluktuasi vs Record Terakhir
      │         │
      │         ├─► [Jika Δ% < -1.0%]: Send Alert + Tag @everyone -> Delete Tag after 5s
      │         └─► [Jika Δ% > 1.0%]: Send Alert Normal
      │
      ├─► Simpan Record Baru ke `data.json` & Purge Data Old
      │
      └─► Re-render Graphic Embed pada Active Monitoring Channel
```
