# Proof Pack

Proof Pack is a local-first proof packet workspace for turning shipped work into reviewable evidence.

It exists for operators, consultants, technical builders, security reviewers, and client-service teams who need to answer one question clearly:

What proof did this work create?

## Why it matters

Most useful work dies in scattered screenshots, chat threads, folders, terminal output, and vague memory. Proof Pack turns that mess into a structured packet with the problem, work performed, evidence, impact, risks, and next ask.

This is not a generic notes app. It is a proof desk.

## Current capabilities

- Local-first packet storage in the browser
- No backend, no account, no telemetry
- Structured proof model for client ops, security fixes, marketing proof, personal systems, and product work
- Search across clients, tags, status, evidence, and packet body
- Completion scoring and quality audit
- Markdown brief generation
- Per-packet Markdown and JSON export
- Whole-workspace JSON export
- JSON import with merge behavior
- Defensive import normalization for malformed packet files
- Versioned storage with corrupt-data quarantine
- Browser sandbox smoke tests with Playwright
- Desktop installer scaffold for macOS, Linux, and Windows 11 through Electron
- Responsive dark operator UI
- TypeScript, Vitest, Vite, React
- GitHub Actions CI for install, test, browser smoke, typecheck, and production build

## Use cases

- Client work summaries
- Website and social proof packets
- Local service business reporting
- Security hardening evidence
- Ops fixes and downtime proof
- Product demos and ship notes
- Personal operating-system reviews

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually:

```text
http://127.0.0.1:5173
```

## Production build

```bash
npm run build
npm run preview
```

## Quality gates

```bash
npm test
npm run e2e
npm run typecheck
npm run build
```

## Desktop app and installers

Run the desktop shell in development:

```bash
npm run electron:dev
```

Build an unpacked desktop app:

```bash
npm run pack
```

Build Linux installers on Linux:

```bash
npm run dist:linux
```

Build Windows and macOS installers on native CI runners:

```bash
npm run dist:win
npm run dist:mac
```

Release artifacts are configured in `.github/workflows/release.yml`. macOS and Windows releases should be signed before broad distribution.

Research and platform details live in:

- `docs/product-research.md`
- `docs/desktop-distribution.md`
- `docs/sandbox-qa.md`

## Data model

A proof packet captures:

- title
- client or project
- owner
- type
- status
- date
- tags
- problem
- work performed
- evidence
- impact
- risks
- next ask

The browser storage key is:

```text
proof-pack:v1
```

Corrupt storage is moved to:

```text
proof-pack:v1:corrupt
```

## Product direction

The next valuable slices are:

1. Professional export suite with print/PDF output
2. Project-level workspaces and client folders
3. Structured evidence manifest
4. Durable storage upgrade beyond localStorage
5. ReeseBrain export target
6. Mission Control integration
7. Public read-only packet links, only after auth and privacy design

## Privacy posture

Proof Pack is intentionally local-first. It does not send packets anywhere unless the user exports a file or copies Markdown.

Do not store secrets, API keys, credentials, private customer data, or regulated personal data in proof packets.

## License

MIT
