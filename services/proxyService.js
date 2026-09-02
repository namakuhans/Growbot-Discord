const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

class ProxyService {
  constructor() {
    this.filePath = path.resolve(__dirname, '../data/proxies.txt');
    this.proxies = [];
    this.currentIndex = 0;
    this.ensureFile();
    this.loadProxies();
  }

  ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '', 'utf8');
    }
  }

  // Helper untuk mengubah format HOST:PORT:USER:PASS menjadi http://USER:PASS@HOST:PORT
  parseProxyString(rawProxy) {
    let clean = rawProxy.trim();
    if (!clean || clean.startsWith('#')) return null;

    // Jika sudah berformat http:// atau https://
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }

    const parts = clean.split(':');

    // Format: HOST:PORT:USER:PASS (4 bagian)
    if (parts.length === 4) {
      const [host, port, user, pass] = parts;
      return `http://${user}:${pass}@${host}:${port}`;
    }
    // Format: HOST:PORT (2 bagian - IP Whitelist)
    else if (parts.length === 2) {
      const [host, port] = parts;
      return `http://${host}:${port}`;
    }

    return `http://${clean}`;
  }

  loadProxies() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      this.proxies = content
        .split('\n')
        .map(line => this.parseProxyString(line))
        .filter(proxy => proxy !== null);
      
      this.currentIndex = 0;
      console.log(`[ProxyService] Berhasil memuat ${this.proxies.length} proxy dari proxies.txt`);
    } catch (err) {
      console.error('[ProxyService Error] Gagal memuat proxies.txt:', err.message);
      this.proxies = [];
    }
  }

  saveProxies(proxyListString) {
    try {
      fs.writeFileSync(this.filePath, proxyListString, 'utf8');
      this.loadProxies();
      return true;
    } catch (err) {
      console.error('[ProxyService Error] Gagal menyimpan proxies.txt:', err.message);
      return false;
    }
  }

  clearProxies() {
    try {
      fs.writeFileSync(this.filePath, '', 'utf8');
      this.proxies = [];
      this.currentIndex = 0;
      console.log('[ProxyService] Semua proxy berhasil dihapus.');
      return true;
    } catch (err) {
      console.error('[ProxyService Error] Gagal menghapus proxies.txt:', err.message);
      return false;
    }
  }

  getAgent() {
    if (this.proxies.length === 0) return null;
    const proxyUrl = this.proxies[this.currentIndex];

    try {
      return new HttpsProxyAgent(proxyUrl);
    } catch (err) {
      console.error(`[ProxyService Error] Invalid proxy URL format [${proxyUrl}]:`, err.message);
      return null;
    }
  }

  getCurrentProxyString() {
    if (this.proxies.length === 0) return 'Direct Connection (No Proxy)';
    // Sembunyikan password di log console demi keamanan
    const proxyUrl = this.proxies[this.currentIndex];
    return proxyUrl.replace(/:([^:@]+)@/, ':****@');
  }

  rotateProxy() {
    if (this.proxies.length <= 1) return;
    const oldProxy = this.getCurrentProxyString();
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    console.warn(`[Proxy System] Auto-Switch Proxy: Dari [${oldProxy}] ke -> [${this.getCurrentProxyString()}]`);
  }

  getProxyCount() {
    return this.proxies.length;
  }
}

module.exports = new ProxyService();
