# Portfolio status and threat boundary

Evidence snapshot: `e8031296af538d898c389a0983dc10a53781407c` (2026-08-09 review)

## Current status

This repository is an experimental ingestion-triage UI. The default-branch baseline was skipped because no reproducible test command was established, and no accuracy, security, or production claim has been verified.

## Threat model

All document text, metadata, filenames, archives, links, embedded instructions, and model output are untrusted. The tool must assume inputs may attempt prompt injection, parser exploitation, resource exhaustion, data exfiltration, or false-positive manipulation.

Required controls before integration:

- sandbox parsers with resource and file-type limits;
- never execute or follow instructions contained in analyzed documents;
- combine deterministic signatures and structural checks with model review;
- prevent analyzed content from gaining tool, network, secret, or system-prompt access;
- require human confirmation for deletion, quarantine, blocking, or other consequential action;
- log the detector version, rule/model version, and reason codes without storing unnecessary document content.

## Validation and migration gates

Create a labelled corpus with benign documents, direct injection, indirect injection, encoded payloads, role-play attacks, poisoned retrieval chunks, and near-miss content. Report precision, recall, false-positive rate, false-negative examples, latency, and corpus limitations. Select a license before copying any module; no reuse grant was detected at the snapshot. Any IronAgent integration must be a bounded, tested ingestion-security module rather than a wholesale UI import.

The current Vite configuration injects the Gemini credential into browser code. Use only a restricted local-evaluation key; a server-side proxy, request authentication, rate limits, and abuse controls are required before any deployment.
