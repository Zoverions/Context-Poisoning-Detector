<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Context Poisoning Detector

> **Status:** Experimental RAG-ingestion triage, not an autonomous security decision-maker. Treat documents, parser output, and model output as untrusted. Consequential actions require separate evidence and human confirmation. See [`PORTFOLIO_STATUS.md`](PORTFOLIO_STATUS.md) and [`SECURITY.md`](SECURITY.md).

The current prototype extracts text from bounded local document uploads and asks a server-side Gemini model to look for concrete inconsistencies between prose claims and structured data in the **same document**. The model can return:

- **No mismatch detected** — the advisory model did not identify an internal prose/structure mismatch in the extracted text. This is not proof that the document is safe, benign, correct, or trustworthy.
- **Review suggested** — one or more concrete internal mismatches were identified for human inspection.
- **Not assessed** — extraction, input validation, provider access, or response validation failed; no verdict is invented.

The detector does not autonomously approve, quarantine, delete, block, or authorize content.

## Current security boundary

- `GEMINI_API_KEY` is read only by the local Node server in `server.mjs`; Vite no longer injects it into browser code.
- The browser calls only the local `/api/analyze` endpoint.
- Development binds to loopback by default.
- Request bodies are limited to 512 KiB; uploaded files are limited to 8 MiB; extracted text is limited to 400,000 characters.
- PDF worker code is bundled locally instead of fetched from a runtime CDN.
- The server prompt treats the document as untrusted data and explicitly rejects instructions contained in it.
- Provider responses are schema-checked and normalized before the UI can use them.

These controls improve the prototype boundary but do **not** make the detector a production security service. The local Node server has no user authentication, tenant isolation, distributed rate limiting, production abuse controls, or accuracy certification.

## Run locally

**Prerequisite:** Node.js 22.

1. Install the exact dependency graph:
   ```bash
   npm ci
   ```
2. Copy `.env.example` to `.env.local` and add a restricted local-evaluation Gemini key:
   ```text
   GEMINI_API_KEY=...
   ```
3. Start the server-side analysis boundary in one terminal:
   ```bash
   npm run dev:api
   ```
4. Start the Vite UI in a second terminal:
   ```bash
   npm run dev
   ```
5. Open the loopback URL printed by Vite.

For a built local evaluation:

```bash
npm run build
GEMINI_API_KEY=... npm start
```

`npm start` intentionally reads the key from the host environment rather than a browser bundle.

## Verification

```bash
node --check server.mjs
npm test
npm run build
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

CI binds these checks to the reviewed branch. The test suite covers parser behavior, advisory response validation, the explicit unknown state, server-side credential failure, request limits, and undeclared API routes.

## Important non-claims

This repository has not established measured precision, recall, false-positive rate, or false-negative rate against a representative attack corpus. It does not detect every form of prompt injection, data poisoning, retrieval manipulation, malicious file content, or factual falsehood. “No mismatch detected” must never be used as an authorization signal by itself.

The original AI Studio prototype link may be useful as historical provenance, but the repository server boundary is now the maintained local evaluation path. Do not put a production credential into a browser-hosted copy of the older prototype.

No repository-level reuse license has been selected. Do not infer a reuse grant from source availability alone.
