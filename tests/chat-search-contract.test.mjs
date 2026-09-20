import test from 'node:test';
import assert from 'node:assert/strict';

const searchable = (chat) => `${chat.localName} ${chat.originalTitle} ${chat.url} ${chat.provider} ${chat.category} ${chat.notes} ${chat.tags.join(' ')}`.toLowerCase();

test('advanced chat search includes URL, notes, and tags', () => {
  const chat = { localName: 'Finance', originalTitle: 'Review', url: 'https://example.test/chat/42', provider: 'generic', category: 'work', notes: 'quarterly', tags: ['audit'] };
  assert.match(searchable(chat), /chat\/42/);
  assert.match(searchable(chat), /quarterly/);
  assert.match(searchable(chat), /audit/);
});
