/**
 * Content loading – localStorage overlay, then content.json
 * ES5 compatible (XHR)
 */

var CONTENT_STORAGE_KEY = 'serialkiller_hatch_content';

function loadContent(callback) {
  var stored = localStorage.getItem(CONTENT_STORAGE_KEY);
  if (stored) {
    try {
      var data = JSON.parse(stored);
      callback(null, data);
      return;
    } catch (e) {
      /* fall through to fetch */
    }
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'content.json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        callback(null, data);
      } catch (e) {
        callback(e || new Error('Invalid JSON'));
      }
    } else {
      callback(new Error('Failed to load content'));
    }
  };
  xhr.send();
}

function saveContentToStorage(data) {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    return false;
  }
  return true;
}

function clearContentStorage() {
  try {
    localStorage.removeItem(CONTENT_STORAGE_KEY);
  } catch (e) {}
}
