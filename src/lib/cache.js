/**
 * CSA Offline-First Cache
 * Wraps localStorage with TTL support for low-bandwidth / offline use.
 * Spec requirement: cache data in localStorage/IndexedDB so the app
 * works on poor 3G/4G connections at poolside.
 */

const PREFIX = 'csa:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const localCache = {
  /**
   * Save data to cache with a timestamp.
   */
  set(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  },

  /**
   * Get data only if it is fresher than maxAgeMs.
   * Returns null if missing or stale.
   */
  get(key, maxAgeMs = DEFAULT_TTL) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      return (Date.now() - ts) <= maxAgeMs ? data : null;
    } catch {
      return null;
    }
  },

  /**
   * Get data regardless of age — used as offline fallback when the
   * network is unavailable and any cached version is better than nothing.
   */
  getStale(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw).data;
    } catch {
      return null;
    }
  },

  /** Remove a single cache entry. */
  clear(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },

  /** Wipe all CSA cache entries. */
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  },
};
