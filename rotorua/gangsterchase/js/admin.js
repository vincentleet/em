/**
 * Admin – edit conversation messages, save to localStorage
 */

(function () {
  const STORAGE_KEY = 'em_rotorua_conv_edits';

  function collectMessages() {
    const items = [];
    const steps = CONV.steps;

    // Pre-loaded batch (j0_batch)
    const batch = steps.j0_batch?.batch;
    if (batch) {
      batch.forEach((item, i) => {
        if (item.message) {
          items.push({
            path: `j0_batch.batch.${i}`,
            section: 'Pre-loaded (Jimmy)',
            text: item.message.text,
            from: item.message.from,
          });
        }
      });
    }

    // Rotorua Police messages
    ['mp1', 'mp2', 'mp3', 'mp4'].forEach((id) => {
      const step = steps[id];
      if (step?.message) {
        items.push({
          path: id,
          section: 'Rotorua Police',
          text: step.message.text,
          from: step.message.from,
        });
      }
    });

    // Jimmy branch messages
    ['j9_reply', 'j10', 'j11', 'j12', 'j13', 'j14', 'j15'].forEach((id) => {
      const step = steps[id];
      if (step?.message) {
        items.push({
          path: id,
          section: 'Jimmy branch',
          text: step.message.text,
          from: step.message.from,
        });
      }
    });

    return items;
  }

  function getByPath(path) {
    if (path.startsWith('j0_batch.batch.')) {
      const i = parseInt(path.split('.')[2], 10);
      return CONV.steps.j0_batch.batch[i].message;
    }
    return CONV.steps[path]?.message;
  }

  function setByPath(path, text) {
    const obj = getByPath(path);
    if (obj) obj.text = text;
  }

  function render() {
    const items = collectMessages();
    const form = document.getElementById('admin-form');
    let html = '';
    let lastSection = '';

    items.forEach((item) => {
      if (item.section !== lastSection) {
        lastSection = item.section;
        html += `<div class="section"><h2>${lastSection}</h2>`;
      }
      const fromClass = item.from === 'player' ? 'from-player' : item.from === 'rotorua_police' ? 'from-police' : 'from-jimmy';
      html += `
        <div class="message-row" data-path="${item.path}">
          <label>${item.from} <span class="from-badge ${fromClass}">${item.from}</span></label>
          <textarea rows="2">${escapeHtml(item.text)}</textarea>
        </div>
      `;
    });

    form.innerHTML = html;
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function collectEdits() {
    const edits = {};
    document.querySelectorAll('.message-row').forEach((row) => {
      const path = row.dataset.path;
      const textarea = row.querySelector('textarea');
      if (path && textarea) {
        const t = textarea.value.trim();
        if (t) edits[path] = t;
      }
    });
    return edits;
  }

  function save() {
    const edits = collectEdits();
    Object.entries(edits).forEach(([path, text]) => setByPath(path, text));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    alert('Saved to this device. Refresh the app to see changes.');
  }

  function download() {
    const edits = collectEdits();
    const json = JSON.stringify(edits, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conv-edits.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('Downloaded conv-edits.json. Replace the file in your project directory and deploy.');
  }

  function reset() {
    if (!confirm('Reset all messages to default? This will clear your saved edits.')) return;
    localStorage.removeItem(STORAGE_KEY);
    const blob = new Blob(['{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conv-edits.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('Reset. Downloaded empty conv-edits.json – replace the file in your project to reset on all devices.');
    location.reload();
  }

  function applyStoredEdits() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const edits = JSON.parse(stored);
      Object.entries(edits).forEach(([path, text]) => setByPath(path, text));
    } catch (_) {}
  }

  applyStoredEdits();
  render();

  document.getElementById('save-btn').addEventListener('click', save);
  document.getElementById('download-btn').addEventListener('click', download);
  document.getElementById('reset-btn').addEventListener('click', reset);
})();
