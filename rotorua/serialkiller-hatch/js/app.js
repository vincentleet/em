/**
 * Serial Killer Hatch – main app
 * ES5 compatible
 */

(function () {
  var content = null;
  var currentCategoryId = null;
  var pendingDocument = null;

  var UNLOCKED_KEY = 'serialkiller_hatch_unlocked';

  function getUnlocked() {
    try {
      var s = sessionStorage.getItem(UNLOCKED_KEY);
      return s ? JSON.parse(s) : {};
    } catch (e) {
      return {};
    }
  }

  function setUnlocked(id) {
    var u = getUnlocked();
    u[id] = true;
    try {
      sessionStorage.setItem(UNLOCKED_KEY, JSON.stringify(u));
    } catch (e) {}
  }

  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('active');
    }
    var el = document.getElementById(id + '-screen');
    if (el) el.classList.add('active');
  }

  function getCategory(id) {
    if (!content || !content.categories) return null;
    for (var i = 0; i < content.categories.length; i++) {
      if (content.categories[i].id === id) return content.categories[i];
    }
    return null;
  }

  function getDocuments(categoryId) {
    if (!content || !content.documents) return [];
    var out = [];
    for (var i = 0; i < content.documents.length; i++) {
      if (content.documents[i].categoryId === categoryId) {
        out.push(content.documents[i]);
      }
    }
    return out;
  }

  function getDocument(id) {
    if (!content || !content.documents) return null;
    for (var i = 0; i < content.documents.length; i++) {
      if (content.documents[i].id === id) return content.documents[i];
    }
    return null;
  }

  function renderHome() {
    var grid = document.getElementById('category-grid');
    if (!grid || !content || !content.categories) return;
    grid.innerHTML = '';
    for (var i = 0; i < content.categories.length; i++) {
      var cat = content.categories[i];
      var card = document.createElement('a');
      card.href = '#';
      card.className = 'category-card';
      card.setAttribute('data-category-id', cat.id);
      card.innerHTML = '<span class="category-icon">' + (cat.icon || '') + '</span><span class="category-name">' + escapeHtml(cat.name) + '</span>';
      grid.appendChild(card);
    }
  }

  function renderCategory(categoryId) {
    var cat = getCategory(categoryId);
    var list = document.getElementById('document-list');
    var titleEl = document.getElementById('category-title');
    if (!list) return;
    if (titleEl && cat) titleEl.textContent = cat.name;
    list.innerHTML = '';
    var docs = getDocuments(categoryId);
    if (docs.length === 0) {
      list.innerHTML = '<p class="empty-state">No documents</p>';
      return;
    }
    var unlocked = getUnlocked();
    for (var i = 0; i < docs.length; i++) {
      var doc = docs[i];
      var isLocked = doc.locked && !unlocked[doc.id];
      var item = document.createElement('a');
      item.href = '#';
      item.className = 'document-item' + (isLocked ? ' locked' : '');
      item.setAttribute('data-document-id', doc.id);
      var lockSvg = isLocked
        ? '<svg class="document-lock" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>'
        : '';
      item.innerHTML = lockSvg + '<span class="document-title">' + escapeHtml(doc.title) + '</span><svg class="document-arrow" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>';
      list.appendChild(item);
    }
  }

  function renderDocument(doc) {
    var container = document.getElementById('document-content');
    var titleEl = document.getElementById('document-title');
    if (!container) return;
    if (titleEl) titleEl.textContent = doc.title;
    var html = '<h2>' + escapeHtml(doc.title) + '</h2>';
    if (doc.type === 'voice') {
      html += '<div class="audio-player"><audio src="' + escapeAttr(doc.content) + '" controls preload="metadata"></audio></div>';
    } else if (doc.type === 'map') {
      html += '<div class="map-viewer"><img src="' + escapeAttr(doc.content) + '" alt="' + escapeAttr(doc.title) + '"></div>';
    } else if (doc.type === 'note' || doc.type === 'password-list') {
      var cls = doc.type === 'password-list' ? 'password-content' : 'note-content';
      html += '<div class="' + cls + '">' + escapeHtml(doc.content) + '</div>';
    } else {
      html += '<div class="note-content">' + escapeHtml(doc.content) + '</div>';
    }
    container.innerHTML = html;
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

  function openCategory(categoryId) {
    currentCategoryId = categoryId;
    renderCategory(categoryId);
    showScreen('category');
  }

  function openDocument(doc, skipPassword) {
    var unlocked = getUnlocked();
    if (doc.locked && !skipPassword && !unlocked[doc.id]) {
      pendingDocument = doc;
      showPasswordModal(doc.title);
      return;
    }
    pendingDocument = null;
    renderDocument(doc);
    showScreen('document');
  }

  function showPasswordModal(title) {
    var modal = document.getElementById('password-modal');
    var input = document.getElementById('password-input');
    var card = document.getElementById('password-modal-card');
    if (modal && input && card) {
      card.classList.remove('error');
      modal.classList.remove('shake');
      input.value = '';
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('active');
      input.focus();
    }
  }

  function hidePasswordModal() {
    var modal = document.getElementById('password-modal');
    if (modal) {
      modal.classList.remove('active', 'shake');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function checkPassword(entered) {
    if (!pendingDocument) return false;
    if (entered === pendingDocument.password) {
      setUnlocked(pendingDocument.id);
      var doc = pendingDocument;
      hidePasswordModal();
      openDocument(doc, true);
      return true;
    }
    var card = document.getElementById('password-modal-card');
    var modal = document.getElementById('password-modal');
    if (card) card.classList.add('error');
    if (modal) modal.classList.add('shake');
    setTimeout(function () {
      if (card) card.classList.remove('error');
      if (modal) modal.classList.remove('shake');
    }, 400);
    return false;
  }

  function goHome() {
    currentCategoryId = null;
    renderHome();
    showScreen('home');
  }

  function goBackFromCategory() {
    goHome();
  }

  function goBackFromDocument() {
    if (currentCategoryId) {
      showScreen('category');
    } else {
      goHome();
    }
  }

  function onCategoryClick(e) {
    e.preventDefault();
    var card = e.target.closest('.category-card');
    if (card) {
      var id = card.getAttribute('data-category-id');
      if (id) openCategory(id);
    }
  }

  function onDocumentClick(e) {
    e.preventDefault();
    var item = e.target.closest('.document-item');
    if (item) {
      var id = item.getAttribute('data-document-id');
      var doc = id ? getDocument(id) : null;
      if (doc) openDocument(doc);
    }
  }

  function init() {
    loadContent(function (err, data) {
      content = data;
      if (!content) {
        content = { categories: [], documents: [] };
      }
      renderHome();

      document.getElementById('category-grid').addEventListener('click', onCategoryClick);
      document.getElementById('document-list').addEventListener('click', onDocumentClick);
      document.getElementById('category-back').addEventListener('click', goBackFromCategory);
      document.getElementById('document-back').addEventListener('click', goBackFromDocument);

      var pwInput = document.getElementById('password-input');
      var pwUnlock = document.getElementById('password-unlock');
      var pwCancel = document.getElementById('password-cancel');

      if (pwUnlock) {
        pwUnlock.addEventListener('click', function () {
          checkPassword(pwInput ? pwInput.value : '');
        });
      }
      if (pwInput) {
        pwInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') checkPassword(pwInput.value);
        });
      }
      if (pwCancel) {
        pwCancel.addEventListener('click', function () {
          pendingDocument = null;
          hidePasswordModal();
        });
      }

      var modal = document.getElementById('password-modal');
      if (modal) {
        modal.addEventListener('click', function (e) {
          if (e.target === modal) {
            pendingDocument = null;
            hidePasswordModal();
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
