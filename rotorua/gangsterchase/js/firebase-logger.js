/**
 * Optional Firebase event logging – no-op when offline or not configured
 */

const FirebaseLogger = {
  enabled: false,
  db: null,

  init() {
    if (!navigator.onLine) return;
    try {
      if (typeof firebase !== 'undefined' && firebase.app) {
        this.db = firebase.database?.();
        this.enabled = !!this.db;
      }
    } catch (e) {
      this.enabled = false;
    }
  },

  log(type, payload = {}) {
    if (!this.enabled || !this.db) return;
    try {
      const ref = this.db.ref('events');
      ref.push({
        type,
        payload,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('Firebase log failed:', e);
    }
  },
};
