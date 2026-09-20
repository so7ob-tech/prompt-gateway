import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AI host access is explicit and all-site access is not requested', () => {
  const manifest = JSON.parse(readFileSync('dist/manifest.json', 'utf8'));
  const expectedHosts = [
    'https://chatgpt.com/*',
    'https://claude.ai/*',
    'https://gemini.google.com/*',
    'https://manus.im/*',
    'https://perplexity.ai/*',
    'https://grok.com/*'
  ];
  assert.ok(expectedHosts.every((host) => manifest.host_permissions.includes(host)));
  assert.ok(!manifest.host_permissions.includes('<all_urls>'));
  assert.ok(!manifest.content_scripts[0].matches.includes('<all_urls>'));
  assert.ok(expectedHosts.every((host) => manifest.content_scripts[0].matches.includes(host)));
});

test('development-only manifest key is excluded from the store package', () => {
  const manifest = JSON.parse(readFileSync('dist/manifest.json', 'utf8'));
  assert.equal('key' in manifest, false);
});
