# Workspaces

Workspaces are a first-class organizational context for Prompt Gateway. The active workspace is optional: **Global / No Workspace** preserves the existing repository behavior for records that are not assigned to a project.

## Data model

`Workspace` stores the project identity and presentation metadata: `id`, `name`, `description`, optional `icon` and `color`, `tags`, `favorite`, `archived`, `notes`, and timestamps. Prompts and chats remain independent global records. `WorkspacePrompt` and `WorkspaceChat` are separate many-to-many relationship stores, so one prompt or chat can be used by multiple workspaces without duplication.

Usage and Interaction records have an optional `workspaceId` snapshot. When a prompt is inserted or sent while a workspace is active, the workspace is written into both records. This preserves historical context even if a relationship is later removed or the workspace is renamed.

## Current workspace

The side-panel switcher persists `settings.currentWorkspaceId` in IndexedDB. It offers Global / No Workspace, active workspaces, favorites, and quick creation. Selecting a workspace scopes the Prompts, Chats, and Activity views; the global repository remains available by selecting Global / No Workspace.

## Lifecycle and integrity

Creating, editing, favoriting, and deleting a workspace affect only the workspace and its relationship rows. Deleting a workspace never deletes prompts, chats, usage, or interactions. Removing a relationship also preserves its source record. Duplicate relationships are prevented by repository-level lookup before insert. Missing historical relationships do not invalidate usage records.

## Persistence and backup

IndexedDB version 2 creates `workspaces`, `workspacePrompts`, and `workspaceChats`, plus the required relationship and filtering indexes. Existing version 1 databases are upgraded in place; no existing store is deleted. Full backups use schema version 2 and include all workspace records. The importer accepts schema version 1 and upgrades it in memory with empty workspace collections.

## Google Drive sync

Cloud sync merges workspace entities and relationship rows by ID using their creation/update timestamps, alongside the existing prompt, chat, usage, and interaction merge rules. A remote schema version 1 backup is treated as a compatible legacy payload; it remains valid, but contains no workspace records.
