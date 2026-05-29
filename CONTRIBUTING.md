# Contributing

Proof Pack is small on purpose. Changes should make proof easier to capture, verify, export, or review.

## Development loop

```bash
npm install
npm test
npm run typecheck
npm run build
```

## Standards

- Keep the app local-first unless a feature explicitly requires a backend.
- Add tests for proof model, storage, import, export, and scoring changes.
- Do not add telemetry.
- Do not add accounts or sync without a privacy design.
- Keep exports deterministic.
- Keep UI copy plain and operator-useful.
- Avoid fake precision, decorative metrics, and vague productivity claims.

## Commit hygiene

Before opening a pull request:

```bash
npm test
npm run typecheck
npm run build
```

Do not commit `node_modules`, `dist`, `.env`, logs, or generated private packet exports.
