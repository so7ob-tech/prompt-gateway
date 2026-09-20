import { getAdapter } from './providers/adapters';

const adapter = getAdapter();
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_CHAT') { sendResponse(adapter.getCurrentChat()); return true; }
  if (message.type === 'INSERT_TEXT') { sendResponse({ ok: adapter.insertText(String(message.text ?? '')) }); return true; }
  if (message.type === 'SEND_MESSAGE') { sendResponse({ ok: adapter.sendMessage() }); return true; }
  return false;
});
let lastUrl = location.href;
new MutationObserver(() => { if (lastUrl !== location.href) { lastUrl = location.href; chrome.runtime.sendMessage({ type: 'CHAT_CONTEXT_CHANGED', chat: adapter.getCurrentChat() }).catch(() => undefined); } }).observe(document, { subtree: true, childList: true });
