
function renderPhase2() {
  renderIncomeTable();
  renderExpenseTable();
  renderSummaryCards();
}

function renderIncomeTable() {
  const tbody = document.getElementById('incomeTableBody');
  if (!tbody) return;

  let html = '';
  DataStore.income.forEach((row, idx) => {
    if (isEditing) {
      html += '<tr>';
      html += '<td><input type="date" value="' + row.date + '" onchange="updateIncome(' + idx + ', 'date', this.value)" style="width:110px;"></td>';
      html += '<td><input type="text" value="' + row.duty + '" onchange="updateIncome(' + idx + ', 'duty', this.value)" style="width:50px;"></td>';
      html += '<td><input type="text" value="' + row.patient + '" onchange="updateIncome(' + idx + ', 'patient', this.value)" style="width:120px;"></td>';
      html += '<td><input type="text" value="' + row.procedure + '" onchange="updateIncome(' + idx + ', 'procedure', this.value)" style="width:80px;"></td>';
      html += '<td><input type="number" value="' + row.labFee + '" onchange="updateIncome(' + idx + ', 'labFee', parseFloat(this.value)||0)" style="width:60px;"></td>';
      html += '<td><input type="number" value="' + row.discount + '" onchange="updateIncome(' + idx + ', 'discount', parseFloat(this.value)||0)" style="width:60px;"></td>';
      html += '<td><input type="number" value="' + row.amountPaid + '" onchange="updateIncome(' + idx + ', 'amountPaid', parseFloat(this.value)||0)" style="width:70px;"></td>';
      html += '<td><input type="number" value="' + row.pct + '" onchange="updateIncome(' + idx + ', 'pct', parseFloat(this.value)||0)" style="width:50px;"></td>';
      html += '<td><input type="text" value="' + row.paymentTerminal + '" onchange="updateIncome(' + idx + ', 'paymentTerminal', this.value)" style="width:70px;"></td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.ccMerchantFee) + '</td>';
      html += '<td><input type="number" value="' + row.hmo + '" onchange="updateIncome(' + idx + ', 'hmo', parseFloat(this.value)||0)" style="width:50px;"></td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.totalGross) + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.netTotal) + '</td>';
      html += '</tr>';
    } else {
      html += '<tr>';
      html += '<td>' + row.date + '</td>';
      html += '<td>' + row.duty + '</td>';
      html += '<td>' + row.patient + '</td>';
      html += '<td>' + row.procedure + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.labFee) + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.discount) + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.amountPaid) + '</td>';
      html += '<td class="num">' + row.pct + '</td>';
      html += '<td>' + row.paymentTerminal + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.ccMerchantFee) + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.hmo) + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.totalGross) + '</td>';
      html += '<td class="num">' + formatMoneyNoSymbol(row.netTotal) + '</td>';
      html += '</tr>';
    }
  });
  tbody.innerHTML = html;
}

function updateIncome(idx, field, value) {
  DataStore.income[idx][field] = value;
  const row = DataStore.income[idx];
  row.totalGross = row.amountPaid + row.hmo + row.labFee;
  row.netTotal = row.totalGross - row.ccMerchantFee - (row.amountPaid * row.pct);
  DataStore.save();
  renderPhase2();
  if (currentPhase === 1) renderPhase1();
}

function addIncomeRow() {
  DataStore.income.push({
    date: '2026-06-09', duty: '', patient: '', procedure: '', labFee: 0, discount: 0,
    amountPaid: 0, percentCommission: 10, pct: 0.1, paymentTerminal: 'Cash',
    ccMerchantFee: 0, hmo: 0, totalGross: 0, salaryRestricted: 'DATA FOR ADMIN ONLY', netTotal: 0
  });
  DataStore.save();
  renderPhase2();
}

function renderExpenseTable() {
  const tbody = document.getElementById('expenseTableBody');
  if (!tbody) return;

  let html = '';
  DataStore.expenses.forEach((row, idx) => {
    const catColor = row.category === 'reducible' ? 'color:#ef4444;' : '';
    const catLabel = row.category === 'reducible' ? '🔴 Reducible' : '🟢 Fixed';
    if (isEditing) {
      html += '<tr>';
      html += '<td>' + (idx+1) + '</td>';
      html += '<td><input type="date" value="' + row.date + '" onchange="updateExpense(' + idx + ', 'date', this.value)" style="width:110px;"></td>';
      html += '<td><select onchange="updateExpense(' + idx + ', 'type', this.value)" style="width:140px;">';
      DataStore.expenseTypes.forEach(t => {
        html += '<option value="' + t + '"' + (t === row.type ? ' selected' : '') + '>' + t + '</option>';
      });
      html += '</select></td>';
      html += '<td><input type="text" value="' + row.description + '" onchange="updateExpense(' + idx + ', 'description', this.value)" style="width:150px;"></td>';
      html += '<td><input type="number" value="' + row.amount + '" onchange="updateExpense(' + idx + ', 'amount', parseFloat(this.value)||0)" style="width:90px;"></td>';
      html += '<td style="' + catColor + '">' + catLabel + '</td>';
      html += '<td><button class="btn btn-red" onclick="deleteExpense(' + idx + ')" style="padding:4px 8px;font-size:0.75rem;">🗑️</button></td>';
      html += '</tr>';
    } else {
      html += '<tr>';
      html += '<td>' + (idx+1) + '</td>';
      html += '<td>' + row.date + '</td>';
      html += '<td>' + row.type + '</td>';
      html += '<td>' + row.description + '</td>';
      html += '<td class="num" style="' + catColor + '">' + formatMoneyNoSymbol(row.amount) + '</td>';
      html += '<td style="' + catColor + '">' + catLabel + '</td>';
      html += '<td></td>';
      html += '</tr>';
    }
  });

  const totalExp = DataStore.expenses.reduce((s, r) => s + r.amount, 0);
  const totalFixed = DataStore.expenses.filter(e => e.category === 'fixed').reduce((s, r) => s + r.amount, 0);
  const totalReducible = DataStore.expenses.filter(e => e.category === 'reducible').reduce((s, r) => s + r.amount, 0);

  html += '<tr style="background:rgba(20,184,166,0.1);font-weight:700;">';
  html += '<td colspan="4" style="text-align:right;color:var(--teal);">TOTAL EXPENSES:</td>';
  html += '<td class="num" style="color:var(--teal);">' + formatMoneyNoSymbol(totalExp) + '</td>';
  html += '<td colspan="2"></td></tr>';
  html += '<tr style="font-size:0.8rem;">';
  html += '<td colspan="4" style="text-align:right;color:#22c55e;">Fixed:</td>';
  html += '<td class="num" style="color:#22c55e;">' + formatMoneyNoSymbol(totalFixed) + '</td>';
  html += '<td colspan="2"></td></tr>';
  html += '<tr style="font-size:0.8rem;">';
  html += '<td colspan="4" style="text-align:right;color:#ef4444;">Reducible:</td>';
  html += '<td class="num" style="color:#ef4444;">' + formatMoneyNoSymbol(totalReducible) + '</td>';
  html += '<td colspan="2"></td></tr>';

  tbody.innerHTML = html;
}

function updateExpense(idx, field, value) {
  DataStore.expenses[idx][field] = value;
  // Auto-categorize
  const reducibleTypes = ['Food', 'Misc', 'Marketing/Ads', 'Other'];
  DataStore.expenses[idx].category = reducibleTypes.includes(DataStore.expenses[idx].type) ? 'reducible' : 'fixed';
  DataStore.save();
  renderPhase2();
  if (currentPhase === 1) renderPhase1();
}

function deleteExpense(idx) {
  if (confirm('Delete this expense?')) {
    DataStore.expenses.splice(idx, 1);
    DataStore.save();
    renderPhase2();
    if (currentPhase === 1) renderPhase1();
  }
}

function addExpense() {
  const date = document.getElementById('expDate').value || '2026-06-01';
  const type = document.getElementById('expType').value;
  const desc = document.getElementById('expDesc').value;
  const amount = parseFloat(document.getElementById('expAmount').value) || 0;

  if (!type || amount <= 0) { alert('Please select type and enter amount'); return; }

  const reducibleTypes = ['Food', 'Misc', 'Marketing/Ads', 'Other'];
  const category = reducibleTypes.includes(type) ? 'reducible' : 'fixed';

  DataStore.expenses.push({
    id: Date.now(), date: date, type: type, description: desc, amount: amount, category: category
  });
  DataStore.save();

  document.getElementById('expDesc').value = '';
  document.getElementById('expAmount').value = '';
  renderPhase2();
  if (currentPhase === 1) renderPhase1();
}

function renderSummaryCards() {
  const totals = DataStore.getTotals();
  document.getElementById('p2-income').textContent = formatMoney(totals.totalIncome);
  document.getElementById('p2-expenses').textContent = formatMoney(totals.totalExpenses);
  document.getElementById('p2-net').textContent = formatMoney(totals.net);
}
