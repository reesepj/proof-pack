# Sandbox QA Notes

This pass used unit tests, Testing Library, Vite smoke loading, and Playwright browser sandbox tests.

## Bugs found and fixed

### Malformed import crash

Problem:

- Importing packet JSON with non-string fields could crash completion scoring and packet rendering.

Fix:

- Import now reuses the normalized store parser.
- Empty packet-shaped objects are rejected.
- Malformed fields fall back safely or are filtered.
- Bad imports show a status message instead of crashing.

Coverage:

- storage normalization test
- app malformed import test
- Playwright malformed import smoke test

### Clipboard failure

Problem:

- Browsers without clipboard support could reject the Copy action.

Fix:

- Copy checks for clipboard support.
- Clipboard errors are caught.
- User gets Copy unavailable or Copy failed status.

Coverage:

- app clipboard failure test

### Accessibility feedback

Problem:

- Toast status was visual only.
- Quality severity was color-only.

Fix:

- Toast now uses role=status and aria-live=polite.
- Quality findings show severity text.

## Current sandbox command

```bash
npm run e2e
```

The e2e suite starts Vite, opens Chromium, creates a packet, saves it, searches it, downloads Markdown, and imports malformed JSON safely.

## Remaining QA gaps

- dirty edit protection or autosave
- duplicate import conflict handling
- storage quota failure UI
- PDF/print export once implemented
- Electron app smoke test
- release artifact install smoke tests per OS
