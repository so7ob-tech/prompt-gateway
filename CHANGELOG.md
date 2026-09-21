# Changelog

## [0.3.3] - 2026-09-21

### Fixed

- Removed the unused `scripting` permission from the Chrome extension manifest to comply with Chrome Web Store permission requirements.

## [0.3.2] - 2026-09-20

### Changed

- Replaced `<all_urls>` host access with explicit permissions for supported AI websites, including ChatGPT, Claude, Gemini, Copilot, Perplexity, Manus, and other major AI services.
- Removed the development-only manifest `key` from the Web Store package.
- Kept the generic composer adapter available on the explicitly declared AI hosts.

## [0.3.1] - 2026-09-20

### Fixed

- Google Drive API failures now show Google's detailed error reason instead of only `403`.
- Upload responses are now checked for errors in both create and update flows.
- Content-script context notifications ignore expected stale-extension messaging errors after a reload.

## [0.3.0] - 2026-09-20

### Added

- Workspaces as a first-class organization layer for prompts, chats, usage, and interactions.
- Workspace switcher, CRUD, favorites, archive-ready model, dashboard counts, scoped prompts/chats/activity, and notes.
- Many-to-many `WorkspacePrompt` and `WorkspaceChat` relationships without copying or deleting source records.
- IndexedDB version 2 migration, schema-versioned backup export/import, and Google Drive merge support for workspace data.

### Compatibility

- Existing prompts, chats, usage, interactions, settings, and schema version 1 backups remain importable.
- Global / No Workspace remains the default behavior.

## [0.2.3] - 2026-09-20

The Google account connection now uses a fixed OAuth client in the Manifest. Users connect through a button and no longer enter a Client ID manually. Settings also provides Sync Now and Disconnect controls.

## [0.2.0] - 2026-09-20

### Added

- Google Drive App Data synchronization through an OAuth button flow.
- Merge-by-ID synchronization for prompts, versions, chats, usage records, and interactions.
- Advanced chat search across names, titles, URLs, providers, categories, notes, and tags.
- Tag, provider, and favorites-only filters with reset controls.
- Manual chat creation, local renaming, editing, full URL retention, and local deletion.
- Generic website mode for all URLs.

### Notes

The Google OAuth client ID is intentionally not hard-coded until the extension's stable Chrome identity key is supplied. The current code accepts a client ID in Settings as a development fallback.
