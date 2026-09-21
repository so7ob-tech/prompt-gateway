# Prompt Gateway

Prompt Gateway is a Manifest V3 Chrome Extension MVP for a local-first prompt repository, chat registry, unified composer, and usage ledger. It keeps application data in IndexedDB and uses Chrome APIs only to communicate with the current tab.

## Implemented in this MVP

The extension includes a React + TypeScript Side Panel, prompt CRUD with categories and tags, favorites, search, prompt version records, current-chat detection, local chat names, Composer actions for Insert and Insert & Send, ad-hoc interaction logging, usage and interaction history, context-menu hooks, JSON backup and merge import, RTL Arabic UI, dark/light themes, and a provider adapter boundary for ChatGPT and Claude. Version 0.3.0 adds first-class Workspaces that organize prompts and chats, persist the active project, and stamp usage and interaction history with workspace context.

The adapter selectors are deliberately isolated in `src/providers/adapters.ts`. Provider DOM layouts change frequently, so the extension fails safely when it cannot find an input instead of modifying arbitrary page content.

## Development

```bash
npm install
npm run build
```

The production artifact is written to `dist/`.

## Load Unpacked

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the project `dist/` directory.
5. Open `https://chatgpt.com/` or `https://claude.ai/` and open the extension Side Panel.

After source changes, run `npm run build`, then press **Reload** for the extension on the extensions page.

## Data and privacy

Prompts, chats, usage records, interaction snapshots, settings, and prompt versions are stored locally in IndexedDB. No backend, analytics, remote code, or external synchronization is included. The backup format is versioned with `schemaVersion: 1` and import merges by record ID without deleting existing data.

Permissions are limited to `sidePanel`, `storage`, `activeTab`, `contextMenus`, `tabs`, and optional Google identity access. Host access is restricted to an explicit list of supported AI websites, including ChatGPT, Claude, Gemini, Copilot, Perplexity, Manus, Mistral, DeepSeek, Qwen, Kimi, Meta AI, Grok, Poe, Hugging Face, OpenRouter, NotebookLM, and other declared AI services. The extension no longer requests `<all_urls>` or the unused `scripting` permission. The generic composer adapter is used on these declared hosts, while content interaction remains limited to the current supported page.

## Known limitations

Provider selectors are best-effort and may need maintenance when a provider changes its UI. Model extraction, chat-title extraction beyond the document title, and persistent URL identity resolution across provider redirects are planned for future releases. The current implementation records prompt usage and interaction snapshots but does not capture provider responses.

## Google Drive synchronization

The extension now includes an optional Google Drive App Data synchronization service. It uses the narrow `drive.appdata` scope, stores one versioned JSON file in the application data area, merges records by ID, and chooses the newest record for prompts, chats, usage records, interactions, workspaces, and workspace relationships. Users press **ربط حساب Google** and complete the Google authentication page without entering a Client ID. Settings provides **Sync Now** and **فصل الحساب** controls. See [docs/workspaces.md](docs/workspaces.md) for the Workspace data model and migration behavior.
