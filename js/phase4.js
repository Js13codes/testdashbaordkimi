
function renderPhase4() {
  renderExcelFileList();
  renderReceiptFileList();
  renderReceiptGallery();
}

// ═══════════════════════════════════════════
// EXCEL UPLOAD - Folder 1
// ═══════════════════════════════════════════
function handleExcelUpload(event) {
  const files = event.target.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = e.target.result;
      // Parse Excel data (simplified - in real app use SheetJS)
      const fileData = {
        id: Date.now() + Math.random(),
        filename: file.name,
        data: data,
        timestamp: new Date().toISOString(),
        size: file.size
      };
      DataStore.excelFiles.push(fileData);
      DataStore.save();

      // Auto-import to Phase 1 & 2 (mock parsing)
      alert('Excel file "' + file.name + '" uploaded! Data will be reflected in Phase 1 & 2.');
      renderExcelFileList();
    };
    reader.readAsBinaryString(file);
  }
}

function renderExcelFileList() {
  const container = document.getElementById('excelFileList');
  if (!container) return;

  let html = '<div style="font-weight:700;color:var(--teal);margin-bottom:12px;">📁 Uploaded Excel Files</div>';
  if (DataStore.excelFiles.length === 0) {
    html += '<div style="color:var(--muted-dark);font-size:0.85rem;">No Excel files uploaded yet.</div>';
  } else {
    DataStore.excelFiles.forEach((file, idx) => {
      const date = new Date(file.timestamp).toLocaleDateString();
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-dark);border-radius:8px;margin-bottom:6px;border:1px solid var(--border-dark);">';
      html += '<div><div style="font-weight:700;">' + file.filename + '</div><div style="font-size:0.75rem;color:var(--muted-dark);">' + date + ' | ' + (file.size/1024).toFixed(1) + ' KB</div></div>';
      html += '<button class="btn btn-red" style="padding:4px 12px;font-size:0.75rem;" onclick="deleteExcelFile(' + idx + ')">🗑️</button>';
      html += '</div>';
    });
  }
  container.innerHTML = html;
}

function deleteExcelFile(idx) {
  if (confirm('Delete this Excel file?')) {
    DataStore.excelFiles.splice(idx, 1);
    DataStore.save();
    renderExcelFileList();
  }
}

// ═══════════════════════════════════════════
// RECEIPT UPLOAD - Folder 2
// ═══════════════════════════════════════════
function handleReceiptUpload(event) {
  const files = event.target.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;

      // Auto-categorize by time
      const hour = new Date().getHours();
      let timeCategory = '';
      if (hour >= 6 && hour < 12) timeCategory = 'Morning Receipt';
      else if (hour >= 12 && hour < 18) timeCategory = 'Afternoon Receipt';
      else timeCategory = 'Evening/Night Receipt';

      // Detect receipt type by filename keywords
      const fname = file.name.toLowerCase();
      let receiptType = 'General';
      if (fname.includes('rent') || fname.includes('water') || fname.includes('electric') || fname.includes('bill')) receiptType = 'Utility/Bill';
      else if (fname.includes('supply') || fname.includes('glove') || fname.includes('material')) receiptType = 'Supplies';
      else if (fname.includes('food') || fname.includes('meal') || fname.includes('grocery')) receiptType = 'Food/Meals';
      else if (fname.includes('equip') || fname.includes('chair') || fname.includes('tool')) receiptType = 'Equipment';
      else if (fname.includes('market') || fname.includes('ad') || fname.includes('fb')) receiptType = 'Marketing/Ads';
      else if (fname.includes('misc') || fname.includes('other')) receiptType = 'Miscellaneous';

      const receipt = {
        id: Date.now() + Math.random(),
        filename: file.name,
        dataUrl: dataUrl,
        timestamp: new Date().toISOString(),
        timeCategory: timeCategory,
        receiptType: receiptType,
        size: file.size
      };

      DataStore.receipts.push(receipt);
      DataStore.save();

      alert('Receipt "' + file.name + '" saved!\nType: ' + receiptType + '\nTime: ' + timeCategory);
      renderReceiptFileList();
      renderReceiptGallery();
    };
    reader.readAsDataURL(file);
  }
}

function renderReceiptFileList() {
  const container = document.getElementById('receiptFileList');
  if (!container) return;

  let html = '<div style="font-weight:700;color:var(--teal);margin-bottom:12px;">🧾 Stored Receipts</div>';
  if (DataStore.receipts.length === 0) {
    html += '<div style="color:var(--muted-dark);font-size:0.85rem;">No receipts stored yet.</div>';
  } else {
    // Group by type
    const types = {};
    DataStore.receipts.forEach(r => {
      if (!types[r.receiptType]) types[r.receiptType] = [];
      types[r.receiptType].push(r);
    });

    for (let type in types) {
      html += '<div style="margin-bottom:12px;">';
      html += '<div style="font-size:0.85rem;font-weight:700;color:var(--pink);margin-bottom:6px;">' + type + ' (' + types[type].length + ')</div>';
      types[type].forEach((r, idx) => {
        const date = new Date(r.timestamp).toLocaleDateString();
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg-dark);border-radius:6px;margin-bottom:4px;border:1px solid var(--border-dark);font-size:0.8rem;">';
        html += '<span>' + r.filename + ' | ' + r.timeCategory + '</span>';
        html += '<button class="btn btn-red" style="padding:2px 8px;font-size:0.65rem;" onclick="deleteReceipt(' + idx + ')">×</button>';
        html += '</div>';
      });
      html += '</div>';
    }
  }
  container.innerHTML = html;
}

function renderReceiptGallery() {
  const container = document.getElementById('receiptGallery');
  if (!container) return;

  if (DataStore.receipts.length === 0) {
    container.innerHTML = '<div style="color:var(--muted-dark);text-align:center;padding:40px;">No receipts to display. Upload receipts to see them here.</div>';
    return;
  }

  let html = '';
  DataStore.receipts.forEach((r, idx) => {
    const date = new Date(r.timestamp).toLocaleDateString();
    html += '<div style="border-radius:12px;overflow:hidden;border:1px solid var(--border-dark);background:var(--card-dark);">';
    html += '<img src="' + r.dataUrl + '" style="width:100%;height:150px;object-fit:cover;cursor:pointer;" onclick="viewReceipt(' + idx + ')">';
    html += '<div style="padding:12px;">';
    html += '<div style="font-size:0.85rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + r.filename + '</div>';
    html += '<div style="font-size:0.75rem;color:var(--muted-dark);margin-top:4px;">' + r.receiptType + ' | ' + r.timeCategory + '</div>';
    html += '<div style="font-size:0.7rem;color:var(--muted-dark);">' + date + '</div>';
    html += '</div></div>';
  });

  container.innerHTML = html;
}

function viewReceipt(idx) {
  const r = DataStore.receipts[idx];
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = '<div style="max-width:90%;max-height:90%;"><img src="' + r.dataUrl + '" style="max-width:100%;max-height:80vh;border-radius:12px;"><div style="text-align:center;color:white;margin-top:12px;font-size:1.1rem;">' + r.filename + '<br><span style="font-size:0.85rem;color:#94a3b8;">' + r.receiptType + ' | ' + r.timeCategory + '</span></div></div>';
  modal.onclick = function() { document.body.removeChild(modal); };
  document.body.appendChild(modal);
}

function deleteReceipt(idx) {
  if (confirm('Delete this receipt?')) {
    DataStore.receipts.splice(idx, 1);
    DataStore.save();
    renderReceiptFileList();
    renderReceiptGallery();
  }
}

// Drag and drop support
document.addEventListener('DOMContentLoaded', () => {
  const dropzones = document.querySelectorAll('.dropzone');
  dropzones.forEach(dz => {
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => { dz.classList.remove('dragover'); });
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('dragover');
      const input = dz.parentElement.querySelector('input[type="file"]');
      if (input) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  });
});
