# Resume Privacy Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task. Execute inline; preserve unrelated working-tree changes.

**Goal:** Publish only masked identity while generating a full, local-only application PDF.

**Architecture:** Public Nuxt data contains masked values only. Real identity lives in Git-ignored .private/resume/identity.json. An existing-Playwright-based Node script starts a loopback-only production server, loads SSR with JavaScript disabled and external requests blocked, inserts private fields only inside the local browser, and writes a PDF under .private/.

**Tech Stack:** Existing Nuxt/Vue, Node ESM, Playwright, node:test.

**Spec:** User-approved public-masked/local-full-PDF recommendation in this conversation.

## Global Constraints
- Keep project wording, tech icons, Feishu original colors, university logo and (985) unchanged.
- Never place full identity in public runtime config, source fixtures, HTML/payload, deployable assets, logs or Git.
- Do not deploy, push, commit or reset unrelated edits.
- Website print remains masked. No public full-resume endpoint or URL parameter.

## Review Focus
- Disabled JavaScript and SSR must remain masked; test both.
- Telephone and email hrefs must not leak complete values; remove public contact links.
- Private JSON and PDF must be Git ignored; verify with git check-ignore.
- Export must fail closed on missing/invalid config or leaked identity in build.
- Export must use an isolated loopback service, block external requests, and clean up its own process.

## Task 1: Public identity boundary
- [x] Update public DOM/title/contact assertions and add SSR/print privacy regression tests; observe failure against existing build.
- [x] Migrate current identity to ignored local JSON; mask app/data/resume.ts and add stable data-resume-field attributes to ResumeDocument.vue.
- [x] Verify public tests after a fresh build.

## Task 2: Private PDF exporter
- [x] Add node:test coverage for validation, public artifact scanning and local PDF export; observe failure before implementation.
- [x] Implement scripts/export-resume.mjs with input validation, build privacy scan, isolated server and offline browser injection.
- [x] Add npm run resume:pdf and test:resume-export; document local-only data and public-print behavior.
- [x] Run exporter tests, typecheck, production build and full desktop/mobile e2e suite.

## Task 3: Deliver and review
- [x] Export actual full PDF locally. Check extracted identity, metadata, one-page A4 size and rendered layout.
- [x] Scan public build and request HTML for private identity; verify ignored configuration/output.
- [x] Restart existing local preview and verify masked public view. Record evidence below.

## Execution Evidence
- RED: privacy SSR test failed against the original full-identity production build; exporter tests failed before the module existed.
- GREEN: typecheck and production build passed. All 66 desktop/mobile end-to-end tests passed (19.4s); all 6 exporter tests passed.
- Export integration tests use copied production output in temporary roots, so they cannot overwrite the real application PDF.
- Cross-origin stylesheet requests stayed at zero. Isolated child servers exited after both successful export and a missing-template-field error.
- npm run resume:pdf succeeded without browser environment overrides on this machine. Actual private PDF contains all three full identity fields, no masked values, complete project content and full-name metadata; pdfinfo confirmed one A4 page. Rendered PDF and masked public preview visually reviewed.
- Scanned app/, public/, .output/ and all 60 Git-tracked/new nonignored files: no complete private identity found. cv SSR/browser both masked; private JSON/PDF URLs returned 404.
- git check-ignore confirms local config/PDF/previews ignored; git diff --check passed (existing LF/CRLF warnings only).
- Restarted the prior 4318 preview on loopback with the fresh production build; no deployment, commits, pushes or unrelated resets.

## Review Decisions
- Ruling: keep browser printing masked; the complete PDF is only created by a local Node command — prevents an unauthenticated full-resume endpoint — user runs one local command for application copies.
- Ruling: use SSR with page JavaScript disabled during export — prevents hydration/network behavior from touching injected identity — exporter relies on stable data-resume-field selectors, covered by tests.
- Ruling: retain existing project wording and layout — preserve user edits — no unrelated resume polishing in this privacy change.
