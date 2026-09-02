function getWibTimestampString() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('id-ID', options);
  const parts = formatter.formatToParts(now);

  let weekday = '', day = '', month = '', year = '', hour = '', minute = '', second = '';
  for (const p of parts) {
    if (p.type === 'weekday') weekday = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'month') month = p.value;
    if (p.type === 'year') year = p.value;
    if (p.type === 'hour') hour = p.value;
    if (p.type === 'minute') minute = p.value;
    if (p.type === 'second') second = p.value;
  }

  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${formattedWeekday}, ${day} ${formattedMonth} ${year} | ${hour}.${minute}.${second} (WIB)`;
}

module.exports = { getWibTimestampString };
