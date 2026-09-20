# Changelog

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
