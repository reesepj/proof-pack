# Desktop Distribution Plan

Proof Pack uses Electron plus electron-builder for desktop installers.

## Why Electron first

Proof Pack is already a Vite React app. Electron is the fastest robust path to real installers without rewriting the product.

Benefits:

- macOS dmg and zip targets
- Windows 11 NSIS setup and portable exe targets
- Linux AppImage and deb targets
- mature GitHub Releases support
- simple local-first desktop shell
- no Rust/WebKitGTK setup required

## Platform support

### Verified in this pass

On the Linux development host, `npm run dist:linux` produced:

- `release/Proof-Pack-0.2.0-linux-x86_64.AppImage`
- `release/Proof-Pack-0.2.0-linux-amd64.deb`

A local Linux-to-Windows build was attempted and failed because Wine is not installed. The Windows installer path is still configured and should run on the Windows GitHub Actions runner.

### Linux

Primary artifact:

- AppImage

Secondary artifact:

- deb

Linux artifacts can be built from Linux with:

```bash
npm run dist:linux
```

### Windows 11

Primary artifact:

- NSIS setup exe

Secondary artifact:

- portable exe

Windows artifacts are configured with:

```bash
npm run dist:win
```

Best build host: Windows GitHub Actions runner.

Linux cross-builds may work with Wine or Docker, but Windows CI is cleaner.

### macOS

Primary artifact:

- dmg

Secondary artifact:

- zip

macOS artifacts are configured with:

```bash
npm run dist:mac
```

Release-quality macOS builds require macOS runner, Apple Developer signing, and notarization.

## Signing reality

Unsigned installers are fine for internal testing, but not for broad distribution.

Before public distribution:

- macOS: sign and notarize with Apple Developer credentials
- Windows: code-sign to reduce SmartScreen friction
- Linux: publish checksums and GitHub release provenance

## GitHub release workflow

The release workflow runs on tags matching `v*` and produces desktop artifacts using a platform matrix:

- ubuntu-latest -> Linux artifacts
- windows-latest -> Windows artifacts
- macos-latest -> macOS artifacts

Artifacts are uploaded and attached to a draft GitHub Release.

## Storage warning

The Electron build currently uses the same browser localStorage model as the web app, scoped to the app origin.

Future desktop data durability should move to an appData vault:

- JSON workspace file first
- IndexedDB/OPFS for browser/PWA path
- SQLite later if audit/version history becomes central
