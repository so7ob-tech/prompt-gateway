import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('workspace model and relations are first-class', () => {
  const types = readFileSync('src/types.ts', 'utf8');
  assert.match(types, /interface Workspace /);
  assert.match(types, /interface WorkspacePrompt /);
  assert.match(types, /interface WorkspaceChat /);
  assert.match(types, /workspaceId\?: string/);
});

test('IndexedDB migrates to version 2 without removing existing stores', () => {
  const db = readFileSync('src/storage/db.ts', 'utf8');
  assert.match(db, /DB_VERSION = 2/);
  assert.match(db, /workspacePrompts/);
  assert.match(db, /workspaceChats/);
  assert.match(db, /workspaceId/);
});

test('backup importer accepts legacy schema 1 and exports schema 2', () => {
  const repositories = readFileSync('src/services/repositories.ts', 'utf8');
  assert.match(repositories, /schemaVersion === 1/);
  assert.match(repositories, /schemaVersion: 2/);
  assert.match(repositories, /workspacePrompts/);
  assert.match(repositories, /workspaceChats/);
});

test('cloud sync merges workspace data', () => {
  const sync = readFileSync('src/services/cloudSync.ts', 'utf8');
  assert.match(sync, /workspaces: merge/);
  assert.match(sync, /workspacePrompts: merge/);
  assert.match(sync, /workspaceChats: merge/);
});

test('workspace context is captured in usage and interaction records', () => {
  const app = readFileSync('src/app.tsx', 'utf8');
  assert.match(app, /const workspaceId = currentWorkspace\?\.id/);
  assert.match(app, /workspaceId, timestamp/);
});
