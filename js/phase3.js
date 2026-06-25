
function renderPhase3() {
  renderPaystubs();
  renderAttendance();
  renderCalendar();
  renderYTD();
}

function renderPaystubs() {
  const container = document.getElementById('paystubContainer');
  if (!container) return;

  let html = '';
  DataStore.employees.forEach(emp => {
    const gross = DataStore.getEmployeeGross(emp.code);
    const commission = DataStore.getEmployeeCommission(emp.code);
    const basePay = emp.baseSalary;
    const totalEarnings = basePay + commission + gross;

    const sss = totalEarnings > 0 ? 1125 : 0;
    const philhealth = totalEarnings > 0 ? 550 : 0;
    const pagibig = totalEarnings > 0 ? 100 : 0;
    const tax = totalEarnings > 0 ? totalEarnings * 0.05 : 0;
    const totalDeductions = sss + philhealth + pagibig + tax;
    const netPay = totalEarnings - totalDeductions;

    const tierLabel = emp.tier === 2 ? 'Tier 2 (40%)' : emp.tier === 1 ? 'Tier 1 (30%)' : 'Fixed Salary';
    const tierColor = emp.tier === 2 ? '#f472b6' : emp.tier === 1 ? '#38bdf8' : '#22c55e';

    html += '<div class="paystub-card">';
    html += '<h3>' + emp.name + ' <span style="color:' + tierColor + ';font-size:0.8rem;">(' + tierLabel + ')</span></h3>';
    html += '<div class="paystub-row"><span>Base Salary</span><span class="amount">' + formatMoney(basePay) + '</span></div>';
    html += '<div class="paystub-row"><span>Gross Procedures</span><span>' + formatMoney(gross) + '</span></div>';
    html += '<div class="paystub-row"><span>Commission (' + (emp.commissionRate*100) + '%)</span><span>' + formatMoney(commission) + '</span></div>';
    html += '<div class="paystub-row total"><span>TOTAL EARNINGS</span><span class="amount">' + formatMoney(totalEarnings) + '</span></div>';
    html += '<div style="margin-top:16px;"></div>';
    html += '<div class="paystub-row"><span>SSS</span><span>-' + formatMoney(sss) + '</span></div>';
    html += '<div class="paystub-row"><span>PhilHealth</span><span>-' + formatMoney(philhealth) + '</span></div>';
    html += '<div class="paystub-row"><span>Pag-IBIG</span><span>-' + formatMoney(pagibig) + '</span></div>';
    html += '<div class="paystub-row"><span>Withholding Tax (5%)</span><span>-' + formatMoney(tax) + '</span></div>';
    html += '<div class="paystub-row total"><span>TOTAL DEDUCTIONS</span><span class="amount" style="color:#ef4444;">-' + formatMoney(totalDeductions) + '</span></div>';
    html += '<div style="margin-top:16px;"></div>';
    html += '<div class="paystub-row total"><span>NET PAY</span><span class="amount" style="color:#22c55e;font-size:1.3rem;">' + formatMoney(netPay) + '</span></div>';
    html += '</div>';
  });

  container.innerHTML = html;
}

function renderAttendance() {
  const container = document.getElementById('attendanceContainer');
  if (!container) return;

  let html = '';
  DataStore.employees.forEach(emp => {
    html += '<div class="card" style="margin-bottom:16px;">';
    html += '<div style="font-weight:700;color:var(--teal);margin-bottom:12px;">' + emp.name + '</div>';
    html += '<div class="attendance-grid">';
    for (let d = 1; d <= 30; d++) {
      const key = '2026-06-' + String(d).padStart(2, '0');
      const status = DataStore.attendance[emp.code][key] || 'present';
      const cls = status === 'present' ? 'present' : status === 'absent' ? 'absent' : 'leave';
      html += '<div class="attendance-day ' + cls + '" onclick="toggleAttendance('' + emp.code + '', '' + key + '')">' + d + '</div>';
    }
    html += '</div></div>';
  });

  container.innerHTML = html;
}

function toggleAttendance(code, date) {
  const current = DataStore.attendance[code][date];
  const next = current === 'present' ? 'absent' : current === 'absent' ? 'leave' : 'present';
  DataStore.attendance[code][date] = next;
  DataStore.save();
  renderAttendance();
}

function renderCalendar() {
  const container = document.getElementById('calendarContainer');
  if (!container) return;

  const now = new Date();
  const year = 2026, month = 5;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = 30;
  const daysInPrev = new Date(year, month, 0).getDate();

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
  html += '<button class="btn btn-blue" onclick="changeCalendarMonth(-1)">◀</button>';
  html += '<span style="font-weight:700;color:var(--teal);font-size:1.1rem;">' + monthNames[month] + ' ' + year + '</span>';
  html += '<button class="btn btn-blue" onclick="changeCalendarMonth(1)">▶</button>';
  html += '</div>';

  html += '<div class="calendar-grid">';
  dayNames.forEach(d => html += '<div class="cal-day-header">' + d + '</div>');

  for (let i = firstDay - 1; i >= 0; i--) {
    html += '<div class="cal-day" style="opacity:0.3;">' + (daysInPrev - i) + '</div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const hasLeave = DataStore.leaves.some(l => l.date === '2026-06-' + String(d).padStart(2,'0'));
    html += '<div class="cal-day ' + (hasLeave ? 'has-event' : '') + '" onclick="addLeave(' + d + ')">' + d + '</div>';
  }

  const remaining = (7 - ((firstDay + daysInMonth) % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    html += '<div class="cal-day" style="opacity:0.3;">' + d + '</div>';
  }

  html += '</div>';

  if (DataStore.leaves.length > 0) {
    html += '<div style="margin-top:20px;">';
    html += '<div style="font-weight:700;color:var(--teal);margin-bottom:12px;">Leave Requests</div>';
    DataStore.leaves.forEach((leave, idx) => {
      html += '<div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg-dark);border-radius:8px;margin-bottom:6px;border:1px solid var(--border-dark);">';
      html += '<span>' + leave.date + ' - ' + leave.reason + '</span>';
      html += '<button class="btn btn-red" style="padding:2px 10px;font-size:0.7rem;" onclick="deleteLeave(' + idx + ')">×</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

function changeCalendarMonth(delta) {
  renderCalendar();
}

function addLeave(day) {
  const reason = prompt('Leave reason for June ' + day + '?');
  if (reason) {
    DataStore.leaves.push({ date: '2026-06-' + String(day).padStart(2,'0'), reason: reason });
    DataStore.save();
    renderCalendar();
  }
}

function deleteLeave(idx) {
  DataStore.leaves.splice(idx, 1);
  DataStore.save();
  renderCalendar();
}

function renderYTD() {
  const tbody = document.getElementById('ytdTableBody');
  if (!tbody) return;

  let html = '';
  DataStore.employees.forEach(emp => {
    const gross = DataStore.getEmployeeGross(emp.code);
    const commission = DataStore.getEmployeeCommission(emp.code);
    const basePay = emp.baseSalary;
    const totalEarnings = basePay + commission + gross;
    const deductions = totalEarnings > 0 ? 1125 + 550 + 100 + (totalEarnings * 0.05) : 0;
    const netPay = totalEarnings - deductions;
    const ytdNet = netPay + (emp.ytdEarnings || 0) - (emp.ytdDeductions || 0);

    html += '<tr>';
    html += '<td>' + emp.name + '</td>';
    html += '<td>' + emp.role + '</td>';
    html += '<td class="num">' + formatMoneyNoSymbol(totalEarnings) + '</td>';
    html += '<td class="num">' + formatMoneyNoSymbol(deductions) + '</td>';
    html += '<td class="num">' + formatMoneyNoSymbol(netPay) + '</td>';
    html += '<td class="num">' + formatMoneyNoSymbol(ytdNet) + '</td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
}
