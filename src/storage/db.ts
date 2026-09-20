import type { Chat, Interaction, Prompt, PromptVersion, Settings, Usage } from '../types';

export type StoreName = 'prompts' | 'promptVersions' | 'chats' | 'usages' | 'interactions' | 'settings';
const DB_NAME = 'prompt-gateway';
const DB_VERSION = 1;
const stores: StoreName[] = ['prompts', 'promptVersions', 'chats', 'usages', 'interactions', 'settings'];

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
      }
      const prompts = request.transaction!.objectStore('prompts');
      if (!prompts.indexNames.contains('updatedAt')) prompts.createIndex('updatedAt', 'updatedAt');
      if (!prompts.indexNames.contains('favorite')) prompts.createIndex('favorite', 'favorite');
      const chats = request.transaction!.objectStore('chats');
      if (!chats.indexNames.contains('identityKey')) chats.createIndex('identityKey', 'identityKey', { unique: true });
      if (!chats.indexNames.contains('provider')) chats.createIndex('provider', 'provider');
      const usages = request.transaction!.objectStore('usages');
      if (!usages.indexNames.contains('promptId')) usages.createIndex('promptId', 'promptId');
      if (!usages.indexNames.contains('chatId')) usages.createIndex('chatId', 'chatId');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function list<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => { const req = db.transaction(store).objectStore(store).getAll(); req.onsuccess = () => resolve(req.result as T[]); req.onerror = () => reject(req.error); });
}
export async function get<T>(store: StoreName, id: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => { const req = db.transaction(store).objectStore(store).get(id); req.onsuccess = () => resolve(req.result as T | undefined); req.onerror = () => reject(req.error); });
}
export async function put<T extends { id: string }>(store: StoreName, value: T): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => { const req = db.transaction(store, 'readwrite').objectStore(store).put(value); req.onsuccess = () => resolve(value); req.onerror = () => reject(req.error); });
}
export async function remove(store: StoreName, id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => { const req = db.transaction(store, 'readwrite').objectStore(store).delete(id); req.onsuccess = () => resolve(); req.onerror = () => reject(req.error); });
}
export async function clearStore(store: StoreName): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => { const req = db.transaction(store, 'readwrite').objectStore(store).clear(); req.onsuccess = () => resolve(); req.onerror = () => reject(req.error); });
}
export type Entity = Prompt | PromptVersion | Chat | Usage | Interaction | Settings;
