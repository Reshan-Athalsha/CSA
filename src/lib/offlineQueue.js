/**
 * CSA Offline Queue — IndexedDB-backed queue for attendance operations
 * When network fails (poolside 3G dropout), operations get queued here and
 * automatically retried when the connection comes back.
 *
 * Queue entries: { id, table, op, data, createdAt }
 *   - table: 'attendance' (extensible to other tables)
 *   - op: 'create' | 'update'
 *   - data: { swimmer_id, date, status, existingId? }
 */

const DB_NAME = 'csa-offline';
const DB_VERSION = 1;
const STORE = 'pending_ops';

// ── IndexedDB helpers ──────────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addToStore(entry) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.add(entry);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function getAllFromStore() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function deleteFromStore(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function clearStore() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

// ── Public API ─────────────────────────────────────────────────────────────────

let _flushInProgress = false;
const _listeners = new Set();

export const offlineQueue = {
  /**
   * Push an attendance operation to the offline queue.
   * Called when the network request fails in PoolsideCheckIn.
   */
  async enqueue(entry) {
    await addToStore({ ...entry, createdAt: Date.now() });
    this._notifyListeners();
  },

  /** Get all pending operations (for UI badge count) */
  async pending() {
    try { return await getAllFromStore(); }
    catch { return []; }
  },

  /** Count of pending operations */
  async count() {
    const items = await this.pending();
    return items.length;
  },

  /**
   * Flush the queue — retry all pending operations against Supabase.
   * Returns { synced: number, failed: number }.
   * Prevents concurrent flushes.
   */
  async flush(supabase) {
    if (_flushInProgress) return { synced: 0, failed: 0 };
    _flushInProgress = true;

    let synced = 0;
    let failed = 0;

    try {
      const items = await getAllFromStore();
      for (const item of items) {
        try {
          if (item.table === 'attendance') {
            if (item.op === 'create') {
              const { error } = await supabase
                .from('attendance')
                .insert({ swimmer_id: item.data.swimmer_id, date: item.data.date, status: item.data.status })
                .select()
                .single();
              if (error) throw error;
            } else if (item.op === 'update') {
              const { error } = await supabase
                .from('attendance')
                .update({ status: item.data.status, updated_at: new Date().toISOString() })
                .eq('id', item.data.existingId);
              if (error) throw error;
            }
          }
          // Success — remove from queue
          await deleteFromStore(item.id);
          synced++;
        } catch {
          failed++;
          // Leave in queue for next retry
        }
      }
    } finally {
      _flushInProgress = false;
      this._notifyListeners();
    }

    return { synced, failed };
  },

  /** Subscribe to queue changes (for badge count in UI) */
  subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  _notifyListeners() {
    _listeners.forEach(fn => { try { fn(); } catch {} });
  },

  /** Clear all pending operations (manual override) */
  async clear() {
    await clearStore();
    this._notifyListeners();
  },
};

// ── Auto-flush when connectivity returns ───────────────────────────────────────

let _supabaseRef = null;

/**
 * Call once at app startup with the supabase client reference.
 * Sets up online/offline listeners to auto-flush the queue.
 */
export function initOfflineSync(supabase) {
  _supabaseRef = supabase;

  const tryFlush = async () => {
    if (!navigator.onLine || !_supabaseRef) return;
    const { synced } = await offlineQueue.flush(_supabaseRef);
    if (synced > 0) {
      console.info(`[CSA] Synced ${synced} queued attendance record(s)`);
    }
  };

  window.addEventListener('online', tryFlush);

  // Also try on visibility change (user switches back to the app tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tryFlush();
  });

  // Initial flush attempt on load
  tryFlush();
}
