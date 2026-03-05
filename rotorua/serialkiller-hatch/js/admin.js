/**
 * Admin – content editor
 * Save: writes to localStorage. Use Export to get content.json for manual updates.
 * ES5 compatible
 */

(function () {
  var content = { categories: [], documents: [] };
  var msgEl = document.getElementById('admin-message');

  function showMessage(text, type) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'admin-message show ' + (type || '');
    setTimeout(function () {
      msgEl.classList.remove('show');
    }, 5000);
  }

  function generateId() {
    return 'id_' + Math.random().toString(36).slice(2, 10);
  }

  function loadContent(callback) {
    var stored = localStorage.getItem('serialkiller_hatch_content');
    if (stored) {
      try {
        var data = JSON.parse(stored);
        callback(null, data);
        return;
      } catch (e) {}
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'content.json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch (e) {
          callback(e);
        }
      } else {
        callback(new Error('Failed to load'));
      }
    };
    xhr.send();
  }

  function getData() {
    var data = {
      categories: [],
      documents: []
    };
    var catContainer = document.getElementById('categories-container');
    var docContainer = document.getElementById('documents-container');
    if (catContainer) {
      var catItems = catContainer.querySelectorAll('.admin-item');
      for (var i = 0; i < catItems.length; i++) {
        var idEl = catItems[i].querySelector('.cat-id');
        var nameEl = catItems[i].querySelector('.cat-name');
        var iconEl = catItems[i].querySelector('.cat-icon');
        if (idEl && nameEl) {
          data.categories.push({
            id: idEl.value || generateId(),
            name: nameEl.value || '',
            icon: iconEl ? iconEl.value : ''
          });
        }
      }
    }
    if (docContainer) {
      var docItems = docContainer.querySelectorAll('.admin-item.doc-item');
      for (var j = 0; j < docItems.length; j++) {
        var di = docItems[j];
        var docIdEl = di.querySelector('.doc-id');
        var docCatEl = di.querySelector('.doc-category');
        var docTitleEl = di.querySelector('.doc-title');
        var docTypeEl = di.querySelector('.doc-type');
        var docLockedEl = di.querySelector('.doc-locked');
        var docPwEl = di.querySelector('.doc-password');
        var docContentEl = di.querySelector('.doc-content');
        if (docIdEl && docTitleEl) {
          data.documents.push({
            id: docIdEl.value || generateId(),
            categoryId: docCatEl ? docCatEl.value : '',
            title: docTitleEl.value || '',
            type: docTypeEl ? docTypeEl.value : 'note',
            locked: docLockedEl ? docLockedEl.checked : false,
            password: docPwEl ? docPwEl.value : '',
            content: docContentEl ? docContentEl.value : ''
          });
        }
      }
    }
    return data;
  }

  function renderCategories() {
    var container = document.getElementById('categories-container');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < content.categories.length; i++) {
      var c = content.categories[i];
      container.appendChild(createCategoryItem(c));
    }
  }

  function createCategoryItem(cat) {
    var div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML =
      '<div class="admin-item-header">' +
        '<span class="admin-item-title">' + (cat.name || 'New category') + '</span>' +
        '<div class="admin-item-actions">' +
          '<button type="button" class="admin-item-btn delete cat-delete">Delete</button>' +
        '</div>' +
      '</div>' +
      '<div class="admin-form-group">' +
        '<label>ID (unique)</label>' +
        '<input type="text" class="cat-id" value="' + escapeAttr(cat.id || '') + '" placeholder="e.g. voice">' +
      '</div>' +
      '<div class="admin-form-group">' +
        '<label>Name</label>' +
        '<input type="text" class="cat-name" value="' + escapeAttr(cat.name || '') + '" placeholder="Voice Notes">' +
      '</div>' +
      '<div class="admin-form-group">' +
        '<label>Icon (emoji)</label>' +
        '<input type="text" class="cat-icon" value="' + escapeAttr(cat.icon || '') + '" placeholder="🎙">' +
      '</div>';
    var delBtn = div.querySelector('.cat-delete');
    if (delBtn) delBtn.addEventListener('click', function () {
      div.remove();
    });
    return div;
  }

  function renderDocuments() {
    var container = document.getElementById('documents-container');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < content.documents.length; i++) {
      container.appendChild(createDocumentItem(content.documents[i]));
    }
  }

  function createDocumentItem(doc) {
    var div = document.createElement('div');
    div.className = 'admin-item doc-item';
    var catOptions = '';
    for (var k = 0; k < content.categories.length; k++) {
      var cat = content.categories[k];
      var sel = cat.id === doc.categoryId ? ' selected' : '';
      catOptions += '<option value="' + escapeAttr(cat.id) + '"' + sel + '>' + escapeHtml(cat.name || cat.id) + '</option>';
    }
    var typeOptions = [
      { v: 'voice', l: 'Voice note' },
      { v: 'map', l: 'Map' },
      { v: 'note', l: 'Note' },
      { v: 'password-list', l: 'Password list' }
    ];
    var typeOpts = '';
    for (var t = 0; t < typeOptions.length; t++) {
      var sel = typeOptions[t].v === doc.type ? ' selected' : '';
      typeOpts += '<option value="' + typeOptions[t].v + '"' + sel + '>' + typeOptions[t].l + '</option>';
    }
    var contentLabel = 'Content';
    if (doc.type === 'voice') contentLabel = 'Filename (e.g. audio/note.mp3)';
    if (doc.type === 'map') contentLabel = 'Filename (e.g. images/map.png)';
    div.innerHTML =
      '<div class="admin-item-header">' +
        '<span class="admin-item-title">' + (doc.title || 'New document') + '</span>' +
        '<div class="admin-item-actions">' +
          '<button type="button" class="admin-item-btn delete doc-delete">Delete</button>' +
        '</div>' +
      '</div>' +
      '<input type="hidden" class="doc-id" value="' + escapeAttr(doc.id || '') + '">' +
      '<div class="admin-form-group">' +
        '<label>Category</label>' +
        '<select class="doc-category">' + catOptions + '</select>' +
      '</div>' +
      '<div class="admin-form-group">' +
        '<label>Title</label>' +
        '<input type="text" class="doc-title" value="' + escapeAttr(doc.title || '') + '" placeholder="Document title">' +
      '</div>' +
      '<div class="admin-form-group">' +
        '<label>Type</label>' +
        '<select class="doc-type">' + typeOpts + '</select>' +
      '</div>' +
      '<div class="admin-form-row">' +
        '<div class="admin-form-group checkbox">' +
          '<input type="checkbox" class="doc-locked" id="lock-' + (doc.id || i) + '"' + (doc.locked ? ' checked' : '') + '>' +
          '<label for="lock-' + (doc.id || i) + '">Password protected</label>' +
        '</div>' +
      '</div>' +
      '<div class="admin-form-group doc-pw-group' + (doc.locked ? '' : ' admin-hidden') + '">' +
        '<label>Password</label>' +
        '<input type="text" class="doc-password" value="' + escapeAttr(doc.password || '') + '" placeholder="e.g. blood">' +
      '</div>' +
      '<div class="admin-form-group">' +
        '<label>' + contentLabel + '</label>' +
        '<textarea class="doc-content" placeholder="Content or filename">' + escapeHtml(doc.content || '') + '</textarea>' +
      '</div>';
    var typeSel = div.querySelector('.doc-type');
    var lockedCb = div.querySelector('.doc-locked');
    var pwGroup = div.querySelector('.doc-pw-group');
    function togglePw() {
      pwGroup.classList.toggle('admin-hidden', !lockedCb.checked);
    }
    if (lockedCb) lockedCb.addEventListener('change', togglePw);
    if (typeSel) {
      typeSel.addEventListener('change', function () {
        var lbl = div.querySelector('.admin-form-group:last-child label');
        if (lbl) {
          if (typeSel.value === 'voice') lbl.textContent = 'Filename (e.g. audio/note.mp3)';
          else if (typeSel.value === 'map') lbl.textContent = 'Filename (e.g. images/map.png)';
          else lbl.textContent = 'Content';
        }
      });
    }
    var delBtn = div.querySelector('.doc-delete');
    if (delBtn) delBtn.addEventListener('click', function () { div.remove(); });
    return div;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML.replace(/"/g, '&quot;');
  }

  function doSave() {
    var data = getData();
    saveContentToStorage(data);
    showMessage('Saved. Use Export to download content.json, then replace the file in the project folder to make changes permanent.', 'success');
  }

  function doReset() {
    if (!confirm('Reset to default content? This will clear your saved changes.')) return;
    clearContentStorage();
    loadContent(function (err, data) {
      content = data || { categories: [], documents: [] };
      renderCategories();
      renderDocuments();
      showMessage('Reset to default. Reload the main app to see changes.', 'success');
    });
  }

  function doExport() {
    var data = getData();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showMessage('Exported content.json. Replace the file in the project folder to make changes permanent.', 'success');
  }

  function doImport() {
    var input = document.getElementById('import-file');
    if (input) input.click();
  }

  function onImportFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(r.result);
        if (data.categories) content.categories = data.categories;
        if (data.documents) content.documents = data.documents;
        saveContentToStorage(data);
        renderCategories();
        renderDocuments();
        showMessage('Import complete. Click Save to persist.', 'success');
      } catch (err) {
        showMessage('Invalid JSON file.', 'error');
      }
    };
    r.readAsText(file);
    e.target.value = '';
  }

  function addCategory() {
    content.categories.push({ id: '', name: '', icon: '' });
    renderCategories();
  }

  function addDocument() {
    content.documents.push({
      id: '',
      categoryId: content.categories[0] ? content.categories[0].id : '',
      title: '',
      type: 'note',
      locked: false,
      password: '',
      content: ''
    });
    renderDocuments();
  }

  function init() {
    loadContent(function (err, data) {
      content = data || { categories: [], documents: [] };
      if (!content.categories) content.categories = [];
      if (!content.documents) content.documents = [];
      renderCategories();
      renderDocuments();
    });

    document.getElementById('btn-save').addEventListener('click', doSave);
    document.getElementById('btn-reset').addEventListener('click', doReset);
    document.getElementById('btn-export').addEventListener('click', doExport);
    document.getElementById('btn-import').addEventListener('click', doImport);
    document.getElementById('import-file').addEventListener('change', onImportFile);
    document.getElementById('add-category').addEventListener('click', addCategory);
    document.getElementById('add-document').addEventListener('click', addDocument);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
