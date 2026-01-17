/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * IndexedDB-backed storage for queued orders with localStorage fallback.
 */

export interface QueuedOrderRecord {
  id: string;
  orderData: any;
  timestamp: number;
}

const DB_NAME = 'dinein-offline';
const DB_VERSION = 1;
const STORE_NAME = 'queued_orders';
const LOCAL_STORAGE_KEY = 'queued_orders';
const MIGRATION_KEY = 'queued_orders_migrated_v1';

const isIndexedDbAvailable = (): boolean => {
  return typeof indexedDB !== 'undefined';
};

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllRecords = async (): Promise<QueuedOrderRecord[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as QueuedOrderRecord[]);
    request.onerror = () => reject(request.error);

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
};

const putRecord = async (record: QueuedOrderRecord): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
};

const deleteRecords = async (ids: string[]): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    ids.forEach((id) => {
      store.delete(id);
    });

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
};

const clearStore = async (): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
};

const replaceRecords = async (records: QueuedOrderRecord[]): Promise<void> => {
  await clearStore();
  for (const record of records) {
    await putRecord(record);
  }
};

const getLocalStorageQueue = (): QueuedOrderRecord[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOrderRecord[]) : [];
  } catch (error) {
    console.warn('Failed to read localStorage queue:', error);
    return [];
  }
};

const setLocalStorageQueue = (records: QueuedOrderRecord[]): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn('Failed to write localStorage queue:', error);
  }
};

const migrateLocalStorageQueue = async (): Promise<void> => {
  if (!isIndexedDbAvailable() || typeof localStorage === 'undefined') return;
  if (localStorage.getItem(MIGRATION_KEY)) return;

  const existing = getLocalStorageQueue();
  if (existing.length === 0) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return;
  }

  try {
    await replaceRecords(existing);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch (error) {
    console.warn('Failed to migrate localStorage queue to IndexedDB:', error);
  }
};

export const enqueueQueuedOrder = async (record: QueuedOrderRecord): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    const existing = getLocalStorageQueue();
    existing.push(record);
    setLocalStorageQueue(existing);
    return;
  }

  try {
    await migrateLocalStorageQueue();
    await putRecord(record);
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to localStorage:', error);
    const existing = getLocalStorageQueue();
    existing.push(record);
    setLocalStorageQueue(existing);
  }
};

export const getQueuedOrders = async (): Promise<QueuedOrderRecord[]> => {
  if (!isIndexedDbAvailable()) {
    return getLocalStorageQueue();
  }

  try {
    await migrateLocalStorageQueue();
    return await getAllRecords();
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to localStorage:', error);
    return getLocalStorageQueue();
  }
};

export const replaceQueuedOrders = async (records: QueuedOrderRecord[]): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    setLocalStorageQueue(records);
    return;
  }

  try {
    await replaceRecords(records);
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to localStorage:', error);
    setLocalStorageQueue(records);
  }
};

export const removeQueuedOrders = async (ids: string[]): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    const existing = getLocalStorageQueue();
    const remaining = existing.filter((record) => !ids.includes(record.id));
    setLocalStorageQueue(remaining);
    return;
  }

  try {
    await deleteRecords(ids);
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to localStorage:', error);
    const existing = getLocalStorageQueue();
    const remaining = existing.filter((record) => !ids.includes(record.id));
    setLocalStorageQueue(remaining);
  }
};
