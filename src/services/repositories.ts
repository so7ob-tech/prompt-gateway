import * as db from '../storage/db';
import type { Backup, Chat, Interaction, Prompt, PromptVersion, Settings, Usage } from '../types';

export const PromptRepository = { list: () => db.list<Prompt>('prompts'), get: (id: string) => db.get<Prompt>('prompts', id), put: (v: Prompt) => db.put('prompts', v), remove: (id: string) => db.remove('prompts', id) };
export const PromptVersionRepository = { list: () => db.list<PromptVersion>('promptVersions'), put: (v: PromptVersion) => db.put('promptVersions', v) };
export const ChatRepository = { list: () => db.list<Chat>('chats'), get: (id: string) => db.get<Chat>('chats', id), put: (v: Chat) => db.put('chats', v), remove: (id: string) => db.remove('chats', id) };
export const UsageRepository = { list: () => db.list<Usage>('usages'), put: (v: Usage) => db.put('usages', v) };
export const InteractionRepository = { list: () => db.list<Interaction>('interactions'), put: (v: Interaction) => db.put('interactions', v) };
export const SettingsRepository = { get: () => db.get<Settings>('settings', 'settings'), put: (v: Settings) => db.put('settings', v) };

export async function exportBackup(): Promise<Backup> {
  return { schemaVersion: 1, exportedAt: Date.now(), prompts: await PromptRepository.list(), promptVersions: await PromptVersionRepository.list(), chats: await ChatRepository.list(), usages: await UsageRepository.list(), interactions: await InteractionRepository.list(), settings: (await SettingsRepository.get()) ?? { id: 'settings', autoRegisterChats: true, confirmBeforeSend: true, theme: 'system', locale: 'ar' } };
}
export async function importBackup(input: Backup): Promise<{ imported: number; skipped: number }> {
  if (input?.schemaVersion !== 1 || !Array.isArray(input.prompts) || !Array.isArray(input.chats)) throw new Error('Unsupported or invalid backup schema');
  let imported = 0; let skipped = 0;
  for (const [store, values] of [['prompts', input.prompts], ['promptVersions', input.promptVersions ?? []], ['chats', input.chats], ['usages', input.usages ?? []], ['interactions', input.interactions ?? []]] as const) {
    for (const value of values) { if (await db.get(store, value.id)) skipped++; else { await db.put(store, value as never); imported++; } }
  }
  if (input.settings) await SettingsRepository.put(input.settings);
  return { imported, skipped };
}
