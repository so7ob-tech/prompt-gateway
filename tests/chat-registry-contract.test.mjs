import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('generic mode and all-site content scripts are enabled', () => {
  const manifest = JSON.parse(readFileSync('dist/manifest.json', 'utf8'));
  assert.ok(manifest.host_permissions.includes('<all_urls>'));
  assert.equal(manifest.content_scripts[0].matches[0], '<all_urls>');
});
