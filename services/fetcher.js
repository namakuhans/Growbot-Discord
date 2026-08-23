const axios = require('axios');
const proxyService = require('./proxyService');

async function fetchOnlinePlayers() {
  let attempts = 0;
  const totalProxies = proxyService.getProxyCount();
  const maxAttempts = totalProxies > 0 ? totalProxies : 1;

  while (attempts < maxAttempts) {
    attempts++;
    const currentProxy = proxyService.getCurrentProxyString();
    const agent = proxyService.getAgent();

    try {
      const axiosConfig = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Referer': 'https://growtopiagame.com/'
        },
        timeout: 8000
      };

      if (agent) {
        axiosConfig.httpsAgent = agent;
        axiosConfig.httpAgent = agent;
      }

      const response = await axios.get('https://growtopiagame.com/detail', axiosConfig);

      if (!response.data) throw new Error('Response data kosong');

      const parsed = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      const count = parseInt(parsed.online_user, 10);

      if (isNaN(count)) throw new Error('Data online_user tidak valid/bukan angka');

      return count;

    } catch (err) {
      const statusCode = err.response ? err.response.status : null;
      console.error(`[API Error] Retry (${attempts}/${maxAttempts}) via [${currentProxy}] -> Status: ${statusCode || err.message}`);

      if (statusCode === 403 || statusCode === 429 || err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED') {
        if (totalProxies > 0) {
          proxyService.rotateProxy();
        }
      } else {
        break;
      }
    }
  }

  return null;
}

module.exports = { fetchOnlinePlayers };
