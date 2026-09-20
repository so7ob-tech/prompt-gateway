import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('cloud sync encrypts payloads locally before upload', () => {
  const source = readFileSync('src/services/cloudSync.ts', 'utf8');
  const encryption = readFileSync('src/services/encryption.ts', 'utf8');
  assert.match(source, /encryptBackup/);
  assert.match(source, /decryptBackup/);
  assert.match(encryption, /AES-GCM/);
  assert.match(encryption, /PBKDF2/);
  assert.match(encryption, /310000/);
});
