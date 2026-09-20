import type { Backup, Chat, Interaction, Prompt, PromptVersion, Settings, Usage } from '../types';
import { exportBackup, importBackup, SettingsRepository } from './repositories';

const FILE_NAME = 'prompt-gateway-sync.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

type GoogleTokenResponse = { access_token?: string; expires_in?: number };

type SyncResult = { imported: number; skipped: number; uploaded: boolean; message: string };

function redirectUri() { return chrome.identity.getRedirectURL('google'); }

async function getAccessToken(clientId: string): Promise<string> {
  if (!clientId.trim() || clientId.includes('YOUR_')) throw new Error('أدخل Google OAuth Client ID من Settings أولًا');
  const params = new URLSearchParams({ client_id: clientId.trim(), response_type: 'token', redirect_uri: redirectUri(), scope: DRIVE_SCOPE, include_granted_scopes: 'true' });
  const response = await chrome.identity.launchWebAuthFlow({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, interactive: true });
  if (!response) throw new Error('لم تكتمل مصادقة Google');
  const fragment = new URL(response).hash.slice(1);
  const token = new URLSearchParams(fragment).get('access_token');
  if (!token) throw new Error(new URLSearchParams(fragment).get('error_description') ?? 'تعذر الحصول على رمز Google');
  return token;
}

async function driveFetch(path: string, token: string, init: RequestInit = {}) { const response = await fetch(`${DRIVE_API}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) } }); if (!response.ok) throw new Error(`Google Drive API ${response.status}`); return response; }

async function findSyncFile(token: string): Promise<{ id: string } | undefined> { const q = encodeURIComponent(`name='${FILE_NAME}' and 'appDataFolder' in parents and trashed=false`); const response = await driveFetch(`/files?q=${q}&spaces=appDataFolder&fields=files(id,name,modifiedTime)`, token); const data = await response.json() as { files?: { id: string }[] }; return data.files?.[0]; }

async function downloadRemote(fileId: string, token: string): Promise<Backup> { const response = await driveFetch(`/files/${fileId}?alt=media`, token); return await response.json() as Backup; }

async function uploadRemote(backup: Backup, token: string, fileId?: string) { const body = JSON.stringify(backup); if (fileId) { await fetch(`${DRIVE_UPLOAD}/files/${fileId}?uploadType=media`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body }); return; } const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' }); const multipart = `--promptgateway\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--promptgateway\r\nContent-Type: application/json\r\n\r\n${body}\r\n--promptgateway--`; const response = await fetch(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/related; boundary=promptgateway' }, body: multipart }); if (!response.ok) throw new Error(`Google Drive upload ${response.status}`); }

function newest<T extends { id: string }>(local: T | undefined, remote: T | undefined, timestamp: (v: T) => number): T | undefined { if (!local) return remote; if (!remote) return local; return timestamp(remote) > timestamp(local) ? remote : local; }
function mergeBackups(local: Backup, remote: Backup): Backup { const merge = <T extends { id: string }>(a: T[], b: T[], timestamp: (v: T) => number) => [...new Map([...a, ...b].map((value) => [value.id, value])).values()].map((value) => newest(a.find((x) => x.id === value.id), b.find((x) => x.id === value.id), timestamp)!).filter(Boolean); return { schemaVersion: 1, exportedAt: Date.now(), prompts: merge(local.prompts, remote.prompts, (v) => v.updatedAt), promptVersions: merge(local.promptVersions, remote.promptVersions, (v) => v.createdAt), chats: merge(local.chats, remote.chats, (v) => v.lastVisitedAt), usages: merge(local.usages, remote.usages, (v) => v.timestamp), interactions: merge(local.interactions, remote.interactions, (v) => v.timestamp), settings: local.settings }; }

export async function syncWithGoogle(clientId: string): Promise<SyncResult> { const token = await getAccessToken(clientId); const local = await exportBackup(); const file = await findSyncFile(token); const remote = file ? await downloadRemote(file.id, token) : undefined; const merged = remote ? mergeBackups(local, remote) : local; const result = await importBackup(merged); await uploadRemote(merged, token, file?.id); const settings = (await SettingsRepository.get()) ?? local.settings; await SettingsRepository.put({ ...settings, syncEnabled: true, lastSyncAt: Date.now() }); return { imported: result.imported, skipped: result.skipped, uploaded: true, message: remote ? 'تم دمج البيانات المحلية والسحابية ورفع النسخة الموحدة' : 'تم إنشاء ملف المزامنة في Google Drive' }; }

export { DRIVE_SCOPE };
