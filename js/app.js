
let currentPhase = 1;
let isEditing = false;
let isDark = DataStore.theme === 'dark';
let phaseGroup = DataStore.phaseGroup; // 'left' or 'right'

function initTheme() {
  document.body.classList.toggle('dark', isDark);
  document.body.classList.toggle('light', !isDark);
  updateThemeIcon();
}

function toggleTheme() {
  isDark = !isDark;
  DataStore.theme = isDark ? 'dark' : 'light';
  localStorage.setItem('arka_theme', DataStore.theme);
  document.body.classList.toggle('dark', isDark);
  document.body.classList.toggle('light', !isDark);
  updateThemeIcon();
  renderAll();
}

function updateThemeIcon() {
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = isDark ? '☀️' : '🌙';
}

function togglePhaseGroup() {
  phaseGroup = phaseGroup === 'left' ? 'right' : 'left';
  DataStore.phaseGroup = phaseGroup;
  localStorage.setItem('arka_phase_group', phaseGroup);
  updateSwitchUI();
  showPhaseGroup();
}

function updateSwitchUI() {
  const thumb = document.getElementById('switchThumb');
  if (thumb) {
    thumb.classList.toggle('left', phaseGroup === 'left');
    thumb.classList.toggle('right', phaseGroup === 'right');
    thumb.textContent = phaseGroup === 'left' ? 'Phase 1-2' : 'Phase 3-4';
  }
}

function showPhaseGroup() {
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  if (phaseGroup === 'left') {
    document.getElementById('phase1').classList.add('active');
    currentPhase = 1;
  } else {
    document.getElementById('phase3').classList.add('active');
    currentPhase = 3;
  }
  renderAll();
}

function switchPhase(n) {
  currentPhase = n;
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  document.getElementById('phase' + n).classList.add('active');
  const editBtn = document.getElementById('editToggle');
  if (n === 2) { editBtn.classList.add('show'); }
  else { editBtn.classList.remove('show'); editBtn.classList.remove('active'); isEditing = false; }
  renderAll();
}

function toggleEdit() {
  isEditing = !isEditing;
  const btn = document.getElementById('editToggle');
  btn.classList.toggle('active', isEditing);
  if (currentPhase === 2) renderPhase2();
}

function printPhase() {
  window.print();
}

function formatMoney(n) {
  return '₱' + n.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function formatMoneyNoSymbol(n) {
  return n.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function renderAll() {
  if (currentPhase === 1) renderPhase1();
  if (currentPhase === 2) renderPhase2();
  if (currentPhase === 3) renderPhase3();
  if (currentPhase === 4) renderPhase4();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateSwitchUI();
  showPhaseGroup();
});

window.addEventListener('resize', () => {
  if (currentPhase === 1) renderPhase1();
});
