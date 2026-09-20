# Contributing

## Branches

- `main` contains stable releases and should remain installable.
- `develop` contains the next integration state.
- `feature/<name>` is used for new features.
- `fix/<name>` is used for corrections.
- `release/<version>` is used for final release checks.

Changes should be developed on a feature or fix branch, reviewed, tested with `npm run build` and `npm test`, and merged into `develop`. Stable releases are merged from `develop` into `main` and tagged with a semantic version such as `v0.2.0`.

## Versioning

The extension, package, and release tag use the same semantic version. Patch releases fix defects, minor releases add backward-compatible features, and major releases may change data or extension behavior. IndexedDB migrations must be added before changing persisted schemas.

## Pull requests

Every change should describe the user-visible behavior, permissions impact, data migration impact, and known limitations. Never commit OAuth client secrets, private keys, tokens, local backups, or browser profiles.
