chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.contextMenus.create({ id: 'save-selection', title: 'Save selected text as Prompt', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'send-selection', title: 'Send selected text to Composer', contexts: ['selection'] });
});
chrome.commands.onCommand.addListener((command) => { if (command === 'open-side-panel') chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }); });
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab?.id) return;
  await chrome.storage.session.set({ pendingSelection: info.selectionText });
  if (info.menuItemId === 'send-selection') chrome.sidePanel.open({ windowId: tab.windowId });
  if (info.menuItemId === 'save-selection') chrome.runtime.sendMessage({ type: 'SAVE_SELECTION', text: info.selectionText });
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => { if (changeInfo.status === 'complete') chrome.tabs.sendMessage(tabId, { type: 'PAGE_READY' }).catch(() => undefined); });
