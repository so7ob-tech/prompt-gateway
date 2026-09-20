import type { Chat, Interaction, Prompt, PromptVersion, Settings, Usage, Workspace, WorkspaceChat, WorkspacePrompt } from '../types';

export type StoreName = 'prompts' | 'promptVersions' | 'chats' | 'usages' | 'interactions' | 'settings' | 'workspaces' | 'workspacePrompts' | 'workspaceChats';
const DB_NAME = 'prompt-gateway';
export const DB_VERSION = 2;
const stores: StoreName[] = ['prompts', 'promptVersions', 'chats', 'usages', 'interactions', 'settings', 'workspaces', 'workspacePrompts', 'workspaceChats'];

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const transaction = request.transaction!;
      for (const store of stores) if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
      const prompts = transaction.objectStore('prompts');
      if (!prompts.indexNames.contains('updatedAt')) prompts.createIndex('updatedAt', 'updatedAt');
      if (!prompts.indexNames.contains('favorite')) prompts.createIndex('favorite', 'favorite');
      const chats = transaction.objectStore('chats');
      if (!chats.indexNames.contains('identityKey')) chats.createIndex('identityKey', 'identityKey', { unique: true });
      if (!chats.indexNames.contains('provider')) chats.createIndex('provider', 'provider');
      const usages = transaction.objectStore('usages');
      if (!usages.indexNames.contains('promptId')) usages.createIndex('promptId', 'promptId');
      if (!usages.indexNames.contains('chatId')) usages.createIndex('chatId', 'chatId');
      if (!usages.indexNames.contains('workspaceId')) usages.createIndex('workspaceId', 'workspaceId');
      const interactions = transaction.objectStore('interactions');
      if (!interactions.indexNames.contains('workspaceId')) interactions.createIndex('workspaceId', 'workspaceId');
      const workspaces = transaction.objectStore('workspaces');
      if (!workspaces.indexNames.contains('updatedAt')) workspaces.createIndex('updatedAt', 'updatedAt');
      if (!workspaces.indexNames.contains('favorite')) workspaces.createIndex('favorite', 'favorite');
      for (const name of ['workspacePrompts', 'workspaceChats'] as const) {
        const store = transaction.objectStore(name);
        if (!store.indexNames.contains('workspaceId')) store.createIndex('workspaceId', 'workspaceId');
        if (!store.indexNames.contains(name === 'workspacePrompts' ? 'promptId' : 'chatId')) store.createIndex(name === 'workspacePrompts' ? 'promptId' : 'chatId', name === 'workspacePrompts' ? 'promptId' : 'chatId');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function list<T>(store: StoreName): Promise<T[]> { const db = await openDb(); return new Promise((resolve, reject) => { const req = db.transaction(store).objectStore(store).getAll(); req.onsuccess = () => resolve(req.result as T[]); req.onerror = () => reject(req.error); }); }
export async function get<T>(store: StoreName, id: string): Promise<T | undefined> { const db = await openDb(); return new Promise((resolve, reject) => { const req = db.transaction(store).objectStore(store).get(id); req.onsuccess = () => resolve(req.result as T | undefined); req.onerror = () => reject(req.error); }); }
export async function put<T extends { id: string }>(store: StoreName, value: T): Promise<T> { const db = await openDb(); return new Promise((resolve, reject) => { const req = db.transaction(store, 'readwrite').objectStore(store).put(value); req.onsuccess = () => resolve(value); req.onerror = () => reject(req.error); }); }
export async function remove(store: StoreName, id: string): Promise<void> { const db = await openDb(); return new Promise((resolve, reject) => { const req = db.transaction(store, 'readwrite').objectStore(store).delete(id); req.onsuccess = () => resolve(); req.onerror = () => reject(req.error); }); }
export async function clearStore(store: StoreName): Promise<void> { const db = await openDb(); return new Promise((resolve, reject) => { const req = db.transaction(store, 'readwrite').objectStore(store).clear(); req.onsuccess = () => resolve(); req.onerror = () => reject(req.error); }); }
export type Entity = Prompt | PromptVersion | Chat | Usage | Interaction | Settings | Workspace | WorkspacePrompt | WorkspaceChat;
