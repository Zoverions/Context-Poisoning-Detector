# Security policy

Context Poisoning Detector is an **experimental ingestion-triage prototype**, not an autonomous security boundary. Treat every analyzed document, filename, parser result, and model response as hostile input. Never use its output alone to delete, quarantine, block, approve, trust, or authorize content.

## Implemented boundaries

- Gemini credentials are server-side only in `server.mjs`; browser code receives no API key through Vite configuration.
- The browser calls the local `/api/analyze` endpoint rather than the model provider directly.
- The local development server binds to `127.0.0.1` by default.
- Request bodies, uploaded files, and extracted text have explicit size limits.
- PDF worker code is bundled locally rather than downloaded as runtime executable code from a CDN.
- The model prompt marks document content as untrusted data and tells the model not to follow instructions contained in the document.
- Model responses must satisfy the advisory response contract before the UI uses them.
- Empty/unextractable input, parse failures, provider failures, and invalid model responses fail into **Not assessed**, not “safe” and not a fabricated threat.
- The UI distinguishes “No mismatch detected” from approval/safety and requires human review for consequential use.

## Remaining production blockers

The current local server is **not production hardened**. It does not provide:

- user authentication or authorization;
- tenant isolation;
- production-grade rate limiting or abuse prevention;
- malware/content sandboxing for all parser libraries;
- independent deterministic detection sufficient to validate model output;
- a measured labelled-corpus precision/recall/false-positive/false-negative baseline;
- durable privacy/data-retention controls; or
- a security review establishing deployment readiness.

Do not expose the prototype to untrusted public traffic or sensitive document workflows without a separate deployment/security design.

## Model and prompt-injection boundary

Prompt instructions are defense-in-depth, not a proof that the model cannot be influenced by adversarial input. Documents may contain direct or indirect prompt injection, encoded instructions, misleading structure, resource-exhaustion content, or parser exploits. Model output is evidence for review only.

“No mismatch detected” means only that this model invocation did not identify a concrete internal prose-versus-structure mismatch in the extracted text. It is not evidence that the document is benign, accurate, unpoisoned, or safe to retrieve.

## Reporting

Report vulnerabilities privately through the repository Security tab when available. Do not place live credentials, private documents, personal data, or unpatched exploit details in public issues. Include the affected commit, a minimized reproduction, impact, and a safe proof of concept.

No repository-level reuse license is currently granted.
