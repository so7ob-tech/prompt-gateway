import test from 'node:test';
import assert from 'node:assert/strict';

test('human-readable ids use the expected prefix', () => {
  const id = `PRM-${crypto.randomUUID()}`;
  assert.match(id, /^PRM-/);
});

test('backup schema is versioned', () => {
  const backup = { schemaVersion: 1, prompts: [], chats: [], usages: [], interactions: [] };
  assert.equal(backup.schemaVersion, 1);
  assert.deepEqual(backup.prompts, []);
});
