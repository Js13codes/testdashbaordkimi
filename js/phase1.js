
function renderPhase1() {
  const totals = DataStore.getTotals();

  document.getElementById('p1-gross').textContent = formatMoney(totals.totalIncome);
  document.getElementById('p1-expenses').textContent = formatMoney(totals.totalExpenses);
  document.getElementById('p1-net').textContent = formatMoney(totals.net);
  document.getElementById('p1-margin').textContent = totals.margin + '%';

  renderBarChart();
  renderDonutChart();
  renderLineChart();
}

function renderBarChart() {
  const canvas = document.getElementById('barChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);

  const totals = DataStore.getTotals();
  const max = Math.max(totals.totalIncome, totals.totalExpenses, totals.net) * 1.1;
  const barW = 70, gap = 50;
  const startX = (w - (barW * 3 + gap * 2)) / 2;

  const bars = [
    { label: 'Income', val: totals.totalIncome, color: isDark ? '#f472b6' : '#ec4899' },
    { label: 'Expenses', val: totals.totalExpenses, color: isDark ? '#38bdf8' : '#0ea5e9' },
    { label: 'Net', val: totals.net, color: isDark ? '#fbbf24' : '#d97706' }
  ];

  bars.forEach((b, i) => {
    const x = startX + i * (barW + gap);
    const barH = (b.val / max) * (h - 70);
    const y = h - 50 - barH;

    // Silky gradient
    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, b.color + 'cc');
    grad.addColorStop(0.5, b.color + '88');
    grad.addColorStop(1, b.color + '44');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [8, 8, 0, 0]);
    ctx.fill();

    // Glow effect
    ctx.shadowColor = b.color + '66';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('₱' + (b.val/1000).toFixed(1) + 'k', x + barW/2, y - 10);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(b.label, x + barW/2, h - 25);
  });
}

function renderDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width, h = rect.height;
  const cx = w/2, cy = h/2 - 20, r = Math.min(w,h)/2 - 40;

  const totals = DataStore.getTotals();
  const data = [
    { label: 'Net', val: totals.net, color: isDark ? '#f472b6' : '#ec4899' },
    { label: 'Expenses', val: totals.totalExpenses, color: isDark ? '#38bdf8' : '#0ea5e9' }
  ];
  const total = data.reduce((s,d) => s+d.val, 0);

  let start = -Math.PI/2;
  data.forEach(d => {
    const angle = (d.val / total) * Math.PI * 2;

    // Silky gradient arc
    const grad = ctx.createRadialGradient(cx, cy, r-30, cx, cy, r);
    grad.addColorStop(0, d.color + '44');
    grad.addColorStop(0.5, d.color + 'aa');
    grad.addColorStop(1, d.color);

    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.stroke();

    start += angle;
  });

  // Center glow
  ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r-35, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = isDark ? '#f472b6' : '#ec4899';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('₱' + (totals.net/1000).toFixed(1) + 'k', cx, cy - 4);
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('NET', cx, cy + 14);

  // Legend
  let ly = h - 30;
  data.forEach((d, i) => {
    ctx.fillStyle = d.color;
    ctx.shadowColor = d.color + '66';
    ctx.shadowBlur = 10;
    ctx.fillRect(15, ly, 14, 14);
    ctx.shadowBlur = 0;
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.label + ' (' + ((d.val/total)*100).toFixed(1) + '%)', 34, ly + 11);
    ly += 20;
  });
}

function renderLineChart() {
  const canvas = document.getElementById('lineChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);

  // Daily income for June
  const daily = {};
  for (let d = 1; d <= 30; d++) daily['2026-06-' + String(d).padStart(2,'0')] = 0;
  DataStore.income.forEach(r => { daily[r.date] = (daily[r.date] || 0) + r.amountPaid; });

  const days = Object.keys(daily).sort();
  const values = days.map(d => daily[d]);
  const max = Math.max(...values, 1) * 1.1;

  const pad = 50;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2;
  const stepX = chartW / (days.length - 1);

  // Grid
  ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 5; i++) {
    const y = pad + (chartH / 5) * i;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
  }

  // Area under line (silky gradient)
  const areaGrad = ctx.createLinearGradient(0, pad, 0, h - pad);
  areaGrad.addColorStop(0, isDark ? '#f472b666' : '#ec489944');
  areaGrad.addColorStop(1, isDark ? '#f472b600' : '#ec489900');

  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  days.forEach((d, i) => {
    const x = pad + i * stepX;
    const y = pad + chartH - (values[i] / max) * chartH;
    if (i === 0) ctx.lineTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad + (days.length - 1) * stepX, h - pad);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = isDark ? '#f472b6' : '#ec4899';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  days.forEach((d, i) => {
    const x = pad + i * stepX;
    const y = pad + chartH - (values[i] / max) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Glow line
  ctx.shadowColor = isDark ? '#f472b688' : '#ec489988';
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Points
  days.forEach((d, i) => {
    const x = pad + i * stepX;
    const y = pad + chartH - (values[i] / max) * chartH;
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = isDark ? '#f472b6' : '#ec4899';
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
  });

  // Labels
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  days.forEach((d, i) => {
    if (i % 5 === 0 || i === days.length - 1) {
      const day = d.split('-')[2];
      ctx.fillText(day, pad + i * stepX, h - 15);
    }
  });

  // Title
  ctx.fillStyle = isDark ? '#f472b6' : '#ec4899';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Daily Income Trend (June 2026)', pad, 25);
}
