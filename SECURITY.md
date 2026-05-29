# Security Policy

## Supported versions

The current `main` branch is the supported development version.

## Reporting issues

Open a private security advisory or contact the repository owner. Do not publish proof-of-concept exploit details before a fix is available.

## Security model

Proof Pack is local-first browser software. It stores packets in `localStorage` and does not include a backend.

This means:

- packet data stays in the browser unless exported or copied
- anyone with access to the browser profile can read stored packets
- exported JSON or Markdown files are user-controlled artifacts
- Proof Pack is not a secrets manager

## Do not store

- API keys
- passwords
- bearer tokens
- private keys
- regulated personal data
- customer secrets
- raw incident data that should stay in a secure case system

## Dependency posture

The app uses a small React, Vite, TypeScript, and Vitest stack. CI runs tests, typecheck, and production build on every push and pull request.
