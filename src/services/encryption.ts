import type { Backup } from '../types';

export interface EncryptedBackup {
  schemaVersion: 1;
  encrypted: true;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

const ITERATIONS = 310000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function deriveKey(passphrase: string, salt: Uint8Array, iterations = ITERATIONS) {
  if (passphrase.length < 8) throw new Error('عبارة مرور التشفير يجب أن تكون 8 أحرف على الأقل');
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptBackup(backup: Backup, passphrase: string): Promise<EncryptedBackup> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(backup)));
  return { schemaVersion: 1, encrypted: true, algorithm: 'AES-GCM', kdf: 'PBKDF2-SHA-256', iterations: ITERATIONS, salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) };
}

export async function decryptBackup(envelope: EncryptedBackup, passphrase: string): Promise<Backup> {
  if (!envelope?.encrypted || envelope.algorithm !== 'AES-GCM' || envelope.kdf !== 'PBKDF2-SHA-256') throw new Error('صيغة التشفير غير مدعومة');
  try {
    const key = await deriveKey(passphrase, fromBase64(envelope.salt), envelope.iterations);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(envelope.iv) }, key, fromBase64(envelope.ciphertext));
    const backup = JSON.parse(decoder.decode(plaintext)) as Backup;
    if (backup.schemaVersion !== 1) throw new Error('إصدار النسخة غير مدعوم');
    return backup;
  } catch { throw new Error('عبارة المرور غير صحيحة أو النسخة السحابية تالفة'); }
}
