import * as db from '../storage/db';
import type { Backup, Chat, Interaction, LegacyBackup, Prompt, PromptVersion, Settings, Usage, Workspace, WorkspaceChat, WorkspacePrompt } from '../types';

export const PromptRepository = { list: () => db.list<Prompt>('prompts'), get: (id: string) => db.get<Prompt>('prompts', id), put: (v: Prompt) => db.put('prompts', v), remove: (id: string) => db.remove('prompts', id) };
export const PromptVersionRepository = { list: () => db.list<PromptVersion>('promptVersions'), put: (v: PromptVersion) => db.put('promptVersions', v) };
export const ChatRepository = { list: () => db.list<Chat>('chats'), get: (id: string) => db.get<Chat>('chats', id), put: (v: Chat) => db.put('chats', v), remove: (id: string) => db.remove('chats', id) };
export const UsageRepository = { list: () => db.list<Usage>('usages'), put: (v: Usage) => db.put('usages', v) };
export const InteractionRepository = { list: () => db.list<Interaction>('interactions'), put: (v: Interaction) => db.put('interactions', v) };
export const SettingsRepository = { get: () => db.get<Settings>('settings', 'settings'), put: (v: Settings) => db.put('settings', v) };
export const WorkspaceRepository = { list: () => db.list<Workspace>('workspaces'), get: (id: string) => db.get<Workspace>('workspaces', id), put: (v: Workspace) => db.put('workspaces', v), remove: (id: string) => db.remove('workspaces', id) };

async function uniqueRelation(store: 'workspacePrompts' | 'workspaceChats', workspaceId: string, targetId: string) {
  const relations = await db.list<WorkspacePrompt | WorkspaceChat>(store);
  return relations.find((relation) => relation.workspaceId === workspaceId && (store === 'workspacePrompts' ? (relation as WorkspacePrompt).promptId === targetId : (relation as WorkspaceChat).chatId === targetId));
}
export const WorkspacePromptRepository = {
  list: () => db.list<WorkspacePrompt>('workspacePrompts'),
  add: async (workspaceId: string, promptId: string) => (await uniqueRelation('workspacePrompts', workspaceId, promptId)) ?? db.put('workspacePrompts', { id: crypto.randomUUID(), workspaceId, promptId, createdAt: Date.now() }),
  remove: async (workspaceId: string, promptId: string) => { const relation = await uniqueRelation('workspacePrompts', workspaceId, promptId); if (relation) await db.remove('workspacePrompts', relation.id); },
};
export const WorkspaceChatRepository = {
  list: () => db.list<WorkspaceChat>('workspaceChats'),
  add: async (workspaceId: string, chatId: string) => (await uniqueRelation('workspaceChats', workspaceId, chatId)) ?? db.put('workspaceChats', { id: crypto.randomUUID(), workspaceId, chatId, createdAt: Date.now() }),
  remove: async (workspaceId: string, chatId: string) => { const relation = await uniqueRelation('workspaceChats', workspaceId, chatId); if (relation) await db.remove('workspaceChats', relation.id); },
};

export const defaultSettings = (): Settings => ({ id: 'settings', autoRegisterChats: true, confirmBeforeSend: true, theme: 'system', locale: 'ar' });
export async function exportBackup(): Promise<Backup> {
  return { schemaVersion: 2, exportedAt: Date.now(), prompts: await PromptRepository.list(), promptVersions: await PromptVersionRepository.list(), chats: await ChatRepository.list(), usages: await UsageRepository.list(), interactions: await InteractionRepository.list(), workspaces: await WorkspaceRepository.list(), workspacePrompts: await WorkspacePromptRepository.list(), workspaceChats: await WorkspaceChatRepository.list(), settings: (await SettingsRepository.get()) ?? defaultSettings() };
}
function normalizeBackup(input: Backup | LegacyBackup): Backup {
  if (!input || ![1, 2].includes(input.schemaVersion) || !Array.isArray(input.prompts) || !Array.isArray(input.chats)) throw new Error('Unsupported or invalid backup schema');
  if (input.schemaVersion === 1) return { schemaVersion: 2, exportedAt: input.exportedAt ?? Date.now(), prompts: input.prompts, promptVersions: input.promptVersions ?? [], chats: input.chats, usages: input.usages ?? [], interactions: input.interactions ?? [], workspaces: [], workspacePrompts: [], workspaceChats: [], settings: input.settings ?? defaultSettings() };
  return input as Backup;
}
export async function importBackup(input: Backup | LegacyBackup): Promise<{ imported: number; skipped: number; schemaVersion: 2 }> {
  const backup = normalizeBackup(input); let imported = 0; let skipped = 0;
  const collections = [['prompts', backup.prompts], ['promptVersions', backup.promptVersions], ['chats', backup.chats], ['usages', backup.usages], ['interactions', backup.interactions], ['workspaces', backup.workspaces], ['workspacePrompts', backup.workspacePrompts], ['workspaceChats', backup.workspaceChats]] as const;
  for (const [store, values] of collections) for (const value of values) { if (await db.get(store, value.id)) skipped++; else { await db.put(store, value as never); imported++; } }
  await SettingsRepository.put(backup.settings);
  return { imported, skipped, schemaVersion: 2 };
}
