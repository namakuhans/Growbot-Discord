const QuickChart = require('quickchart-js');

// Map nama variabel internal ke nama tampilan label Dropdown
function getStyleLabel(styleKey) {
  const styleMap = {
    'fill_value': 'Fill to Value (Chart.js v3)',
    'bubble': 'Bubble Chart',
    'sparkline': 'Sparkline',
    'horizontal_bar': 'Horizontal Bar',
    'stepped_line': 'Stepped Line',
    'point_circle': 'Point Styles: Circle',
    'point_triangle': 'Point Styles: Triangle',
    'hide_axes': 'Hide Axes, Gridlines & Gradient',
    'no_fill': 'Boundaries (Line) No Fill',
    'formatted_numbers': 'Formatted Numbers',
    'vertical_axis': 'Vertical Axis Labels'
  };
  return styleMap[styleKey] || 'Fill to Value (Chart.js v3)';
}

function formatTimeframeLabel(minutes) {
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return `${days} ${days > 1 ? 'Days' : 'Day'}`;
  } else if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `${hours} ${hours > 1 ? 'Hours' : 'Hour'}`;
  } else {
    return `${minutes} ${minutes > 1 ? 'Minutes' : 'Minute'}`;
  }
}

function generateChartUrl(history, timeframeMinutes, styleOption = 'fill_value') {
  try {
    const now = Date.now();
    const cutoff = now - (timeframeMinutes * 60 * 1000);
    
    let filteredData = (history || []).filter(item => item && typeof item.count === 'number' && item.timestamp >= cutoff);

    if (filteredData.length === 0 && Array.isArray(history) && history.length > 0) {
      const validItem = history[history.length - 1];
      if (validItem && typeof validItem.count === 'number') {
        filteredData = [validItem];
      }
    }

    // Downsampling dengan Bucket Averaging jika data point melebihi MAX_POINTS
    const MAX_POINTS = 12;
    if (filteredData.length > MAX_POINTS) {
      const bucketSize = filteredData.length / MAX_POINTS;
      const sampled = [];
      for (let i = 0; i < MAX_POINTS; i++) {
        const startIdx = Math.floor(i * bucketSize);
        const endIdx = Math.min(Math.floor((i + 1) * bucketSize), filteredData.length);
        const bucket = filteredData.slice(startIdx, endIdx);
        if (bucket.length > 0) {
          const avgCount = Math.round(bucket.reduce((sum, item) => sum + item.count, 0) / bucket.length);
          const reprTimestamp = bucket[bucket.length - 1].timestamp;
          sampled.push({ timestamp: reprTimestamp, count: avgCount });
        }
      }
      filteredData = sampled;
    }

    // Format label sumbu X (sertakan detik untuk timeframe <= 5 menit)
    const includeSeconds = timeframeMinutes <= 5;
    const labels = filteredData.map(item => {
      const date = new Date(item.timestamp);
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      if (includeSeconds) {
        const ss = date.getSeconds().toString().padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }
      return `${hh}:${mm}`;
    });

    const dataPoints = filteredData.map(item => item.count);

    const chart = new QuickChart();
    chart.setBackgroundColor('#ffffff');
    chart.setWidth(500);
    chart.setHeight(300);

    const latestVal = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : 0;
    const titleLabel = `Online Players: ${latestVal.toLocaleString()} (${formatTimeframeLabel(timeframeMinutes)})`;

    switch (styleOption) {
      case 'bubble':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'bubble',
          data: {
            datasets: [{
              label: titleLabel,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1,
              data: dataPoints.map((val, idx) => ({
                x: idx + 1,
                y: val,
                r: Math.min(Math.max(Math.round(val / 3000), 4), 16)
              }))
            }]
          },
          options: { title: { display: true, text: 'Chart.js Bubble Chart' } }
        });
        break;

      case 'sparkline':
        chart.setVersion('2.9.4');
        chart.setWidth(300);
        chart.setHeight(100);
        chart.setConfig({
          type: 'sparkline',
          data: { datasets: [{ data: dataPoints.length > 0 ? dataPoints : [0] }] }
        });
        break;

      case 'horizontal_bar':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'horizontalBar',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{ label: titleLabel, data: dataPoints, backgroundColor: 'gold' }]
          },
          options: {
            scales: {
              xAxes: [{ gridLines: { display: true, drawOnChartArea: false, color: 'black' }, ticks: { fontColor: 'black', beginAtZero: true } }],
              yAxes: [{ display: true, gridLines: { display: true, drawOnChartArea: false, color: 'black' }, ticks: { fontColor: 'black' } }]
            },
            legend: { display: false }
          }
        });
        break;

      case 'stepped_line':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{ label: titleLabel, steppedLine: true, data: dataPoints, borderColor: 'rgb(255, 99, 132)', fill: false }]
          },
          options: { title: { display: true, text: 'Stepped line' } }
        });
        break;

      case 'point_circle':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{ label: titleLabel, backgroundColor: 'rgb(255, 99, 132)', borderColor: 'rgb(255, 99, 132)', data: dataPoints, fill: false, pointRadius: 10, showLine: false }]
          },
          options: {
            title: { display: true, text: 'Point Style: circle' },
            legend: { display: false },
            elements: { point: { pointStyle: 'circle' } }
          }
        });
        break;

      case 'point_triangle':
      case 'hide_axes':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{ label: titleLabel, backgroundColor: 'rgb(255, 99, 132)', borderColor: 'rgb(255, 99, 132)', data: dataPoints, fill: false, pointRadius: 10, showLine: false }]
          },
          options: {
            title: { display: true, text: 'Point Style: triangle' },
            legend: { display: false },
            elements: { point: { pointStyle: 'triangle' } }
          }
        });
        break;

      case 'no_fill':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{ backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgb(255, 99, 132)', data: dataPoints, label: titleLabel, fill: false }]
          },
          options: { title: { text: 'fill: false', display: true } }
        });
        break;

      case 'formatted_numbers':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{ label: titleLabel, backgroundColor: 'rgb(255, 99, 132)', borderColor: 'rgb(255, 99, 132)', data: dataPoints, fill: false }]
          },
          options: {
            scales: { yAxes: [{ ticks: { beginAtZero: true, callback: (val) => val.toLocaleString() + ' Players' } }] }
          }
        });
        break;

      case 'vertical_axis':
        chart.setVersion('2.9.4');
        chart.setConfig({
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{ label: titleLabel, backgroundColor: 'rgb(255, 99, 132)', borderColor: 'rgb(255, 99, 132)', data: dataPoints, fill: false }]
          },
          options: {
            scales: { xAxes: [{ ticks: { minRotation: 90 } }] }
          }
        });
        break;

      case 'fill_value':
      default:
        chart.setVersion('3');
        const avgVal = dataPoints.length > 0 ? Math.round(dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length) : 0;
        chart.setConfig({
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['1'],
            datasets: [{
              label: titleLabel,
              data: dataPoints,
              lineTension: 0.4,
              borderColor: '#ff3333',
              backgroundColor: '#ffcccc',
              fill: { target: { value: avgVal }, above: 'transparent', below: '#ffcccc' }
            }]
          }
        });
        break;
    }

    const rawUrl = chart.getUrl();
    const nonce = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return rawUrl.includes('?') ? `${rawUrl}&_ts=${nonce}` : `${rawUrl}?_ts=${nonce}`;

  } catch (err) {
    console.error('[Chart Error] Failed to generate Chart URL:', err.message);
    return 'https://via.placeholder.com/500x300/ffffff/ff3333?text=Error+Generating+Chart';
  }
}

module.exports = { generateChartUrl, formatTimeframeLabel, getStyleLabel };
