const DB_NAME = 'lema-local-v1';
const DB_VERSION = 1;
const DRAFTS_STORE = 'drafts';
const SNAPSHOTS_STORE = 'snapshots';
const MAX_SNAPSHOTS_PER_DOC = 15;

export interface LocalDraftRecord<T = unknown> {
  key: string;
  payload: T;
  updatedAt: number;
}

export interface VersionSnapshotRecord<T = unknown> {
  id: string;
  docKey: string;
  label: string;
  payload: T;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
          db.createObjectStore(DRAFTS_STORE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
          const store = db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
          store.createIndex('docKey', 'docKey', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveLocalDraft(key: string, payload: unknown): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(DRAFTS_STORE, 'readwrite');
      const store = tx.objectStore(DRAFTS_STORE);
      store.put({ key, payload, updatedAt: Date.now() } satisfies LocalDraftRecord);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getLocalDraft<T = unknown>(
  key: string
): Promise<LocalDraftRecord<T> | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DRAFTS_STORE, 'readonly');
      const req = tx.objectStore(DRAFTS_STORE).get(key);
      req.onsuccess = () => resolve((req.result as LocalDraftRecord<T>) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function clearLocalDraft(key: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(DRAFTS_STORE, 'readwrite');
      tx.objectStore(DRAFTS_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function listVersionSnapshots<T = unknown>(
  docKey: string
): Promise<VersionSnapshotRecord<T>[]> {
  const db = await openDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SNAPSHOTS_STORE, 'readonly');
      const index = tx.objectStore(SNAPSHOTS_STORE).index('docKey');
      const req = index.getAll(docKey);
      req.onsuccess = () => {
        const items = (req.result as VersionSnapshotRecord<T>[]) ?? [];
        items.sort((a, b) => b.createdAt - a.createdAt);
        resolve(items);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function saveVersionSnapshot(
  docKey: string,
  label: string,
  payload: unknown
): Promise<void> {
  const db = await openDb();
  if (!db) return;

  const existing = await listVersionSnapshots(docKey);
  const id = `${docKey}::${Date.now()}::${Math.random().toString(36).slice(2, 7)}`;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(SNAPSHOTS_STORE, 'readwrite');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      store.put({
        id,
        docKey,
        label,
        payload,
        createdAt: Date.now(),
      } satisfies VersionSnapshotRecord);

      if (existing.length >= MAX_SNAPSHOTS_PER_DOC) {
        for (const stale of existing.slice(MAX_SNAPSHOTS_PER_DOC - 1)) {
          store.delete(stale.id);
        }
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
