# Portfolio status and threat boundary

Status date: 2026-08-10

## Current status

Context Poisoning Detector is an **experimental RAG-ingestion triage prototype**. It is not an autonomous security authority and is not approved for public or sensitive-document deployment.

The current hardening branch implements a server-side Gemini credential boundary, bounded local parsing, explicit advisory result states, fail-closed handling for unknown/error conditions, deterministic response validation, and CI-bound parser/client/server tests. These controls reduce known prototype risks but do not establish detector accuracy or production readiness.

## Current result semantics

The application has three result states:

- `no_issue_detected` — no internal prose-versus-structure mismatch was identified in the extracted text; **not** a safety or trust verdict;
- `review` — concrete potential mismatches were identified for human review;
- `unknown` — the file was not successfully assessed because extraction, validation, provider access, or response validation failed.

No result may autonomously approve, quarantine, delete, block, trust, or authorize content.

## Threat model

All document text, metadata, filenames, links, embedded instructions, parser output, and model output are untrusted. Inputs may attempt prompt injection, parser exploitation, resource exhaustion, data exfiltration, false-positive/false-negative manipulation, or model-response confusion.

Implemented controls include:

- Gemini key held only by `server.mjs`; Vite no longer injects it into browser code;
- loopback-bound local development API;
- 512 KiB API body limit, 8 MiB uploaded-file limit, and 400,000-character extracted-text limit;
- locally bundled PDF worker code;
- prompt isolation that marks document text as untrusted data and rejects document-contained instructions;
- strict model-response schema/shape validation;
- parser/provider/model failures represented as `unknown` rather than safe/threat guesses;
- immutable/read-only CI actions for ordinary verification.

## Dependency-remediation evidence

The hardening work replaced the vulnerable locked graph with a hash-bound candidate whose only direct manifest migration is `mammoth` `1.7.2` → `1.12.1`; all other package movement is lock-resolved compatible dependency/transitive remediation.

The final compact lock preserves exact registry `resolved` URLs, `integrity` hashes, executable `bin` metadata, dependency/peer/optional relationships, platform selectors, and install-script flags. A disposable read-only verification run proved that a clean `npm ci` does not rewrite it and that the resulting graph passes the repository test/build/audit boundary:

- candidate workflow run `31451584264`, job `93656886514`: success;
- 15 tests passed across parser, advisory-client, and server-contract suites;
- production Vite build passed on Vite `6.4.3`;
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities;
- `npm audit --audit-level=high`: 0 vulnerabilities;
- committed `package.json` Git blob: `cc858668e22a2045f8abcffeb75b3caa27768116`;
- committed `package-lock.json` Git blob: `310b16541256717997d83d5aed3725e026a1283b`;
- compact lock SHA-256: `194aff736c7b2425b2b6d537627ec13278393b368e4f3e498e97164ed91a12c6`.

The verified artifact was transferred to the feature branch by a one-shot workflow that rechecked the artifact and file hashes, re-ran install/tests/build/audits, committed only the two dependency files while deleting its temporary transfer/diagnostic workflows, and then removed its own write authority from the branch. Pull request promotion still requires an ordinary owner-authored PR CI run to independently pass on the final head.

## Remaining gates before any production claim

- add real authentication/authorization, tenant isolation, production rate limits, abuse controls, and deployment hardening;
- evaluate parser sandboxing/isolation rather than assuming library parsing is safe because file size is bounded;
- combine independent deterministic structural checks with model review where useful;
- create a labelled corpus covering benign documents, direct/indirect injection, encoded payloads, role-play attacks, poisoned retrieval chunks, structural spoofing, parser edge cases, and near misses;
- report precision, recall, false-positive rate, false-negative examples, latency, and corpus limitations;
- define privacy/data-retention rules for document handling;
- log detector/model/rule versions and reason codes without retaining unnecessary document content;
- complete independent security review before public/sensitive deployment;
- select a reuse license before copying modules into other products.

## Axiom / IronAgent boundary

If this work is retained in the wider Axiom ecosystem, treat it as an **advisory ingestion signal or research fixture source**. Its output must not become an AXIOM capability grant, policy override, or execution authorization. Any future IronAgent or AXIOM integration should be a bounded tested module rather than a wholesale UI/runtime import.

## Evidence boundary

A green test/build/audit run proves only the repository behaviors exercised by those checks. It does not prove that model classifications are factually correct, that prompt injection is impossible, that parser libraries are exploit-free, or that the detector is enterprise-ready.
