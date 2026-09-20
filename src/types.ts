export type Provider = 'chatgpt' | 'claude' | 'generic' | 'unknown';
export type UsageType = 'COPY' | 'INSERT' | 'INSERT_AND_SEND' | 'COMPOSER' | 'OTHER';
export type InputType = 'STORED_PROMPT' | 'MODIFIED_PROMPT' | 'AD_HOC';

export interface Prompt {
  id: string; title: string; description: string; content: string; category: string; tags: string[];
  favorite: boolean; archived: boolean; notes: string; createdAt: number; updatedAt: number;
  lastUsedAt?: number; usageCount: number; version: number; variables: string[];
}
export interface PromptVersion { id: string; promptId: string; version: number; content: string; createdAt: number; }
export interface Chat {
  id: string; localName: string; originalTitle: string; url: string; provider: Provider; model?: string;
  category: string; tags: string[]; favorite: boolean; notes: string; createdAt: number; firstSeenAt: number;
  lastVisitedAt: number; lastUsedAt?: number; promptUses: number; interactions: number; archived: boolean;
  identityKey: string;
}
export interface Usage {
  id: string; promptId?: string; promptVersion?: number; promptTitleSnapshot?: string; promptSnapshotHash: string;
  chatId?: string; chatName?: string; chatUrl?: string; provider?: Provider; model?: string; timestamp: number;
  usageType: UsageType; inputType: InputType; variables: Record<string, string>; wasModifiedBeforeUse: boolean;
  inserted: boolean; sent: boolean; resultStatus: 'SUCCESS' | 'FAILED' | 'CANCELLED';
}
export interface Interaction {
  id: string; timestamp: number; chatId?: string; provider?: Provider; url?: string; promptId?: string;
  inputType: InputType; inputSnapshot: string; variables: Record<string, string>; action: UsageType;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
}
export interface Settings { id: 'settings'; autoRegisterChats: boolean; confirmBeforeSend: boolean; theme: 'system' | 'light' | 'dark'; locale: 'ar' | 'en'; syncEnabled?: boolean; googleClientId?: string; lastSyncAt?: number; }
export interface CurrentChat { provider: Provider; url: string; title: string; identityKey: string; model?: string; chatId?: string; }
export interface Backup { schemaVersion: 1; exportedAt: number; prompts: Prompt[]; promptVersions: PromptVersion[]; chats: Chat[]; usages: Usage[]; interactions: Interaction[]; settings: Settings; }
export const now = () => Date.now();
export const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export const hashText = async (text: string) => {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
};
