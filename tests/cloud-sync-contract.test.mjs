import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('cloud sync uses the least-privilege Drive App Data scope', () => {
  const source = readFileSync('src/services/cloudSync.ts', 'utf8');
  assert.match(source, /drive\.appdata/);
  assert.match(source, /mergeBackups/);
});
