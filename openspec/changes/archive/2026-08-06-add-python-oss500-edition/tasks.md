## 1. Reference module (lock the template)

- [x] 1.1 Enhance `01-modern-toolchain` README in place: keep the strong prose; add diagrams (torchtriton
      attack chain, the `sift` spine pipeline, strangler-fig migration); Learn→"Go deeper"; date→2026-08.
- [x] 1.2 Rewrite `plaintext-labs/python-for-security/01-modern-toolchain/lab.md` to the cognitive-load
      template — landing `sift` v0, preserving the intermediate-plus altitude (objective-level rails).
- [x] 1.3 Interim `mkdocs build --strict` green (spot-check the reference).

## 2. Rebuild modules 02–09 (parallel fan-out; preserve the `sift` spine + altitude)

- [x] 2.1 `02-parse-dont-validate` — README + lab (adds the typed EVE boundary to `sift`) + diagrams.
- [x] 2.2 `03-data-at-scale` — README + lab (adds streaming + columnar triage + JSON logs).
- [x] 2.3 `04-async-concurrency` — README + lab (adds bounded-concurrency async enrichment).
- [x] 2.4 `05-driving-tools-safely` — README + lab (adds safe subprocess wrappers; `shell=True` review).
- [x] 2.5 `06-cli-and-api` — README + lab (adds typer CLI + FastAPI over one core).
- [x] 2.6 `07-llm-native-mcp` — README + lab (exposes `sift` over MCP; instructor validates LLM output).
- [x] 2.7 `08-redteam-your-mcp` — README + lab (prompt-injection exploit + the eval that catches it); auth note.
- [x] 2.8 `09-eval-property-supplychain` — README + lab (held-out eval gate + property tests + supply-chain gate).

## 3. Overview & verify

- [x] 3.1 Rebuild `tracks/09-python-for-security/README.md` with a phase Mermaid diagram (keep the spine table).
- [x] 3.2 Resolve every `<!-- VALIDATE -->` marker; confirm each link resolves.
- [x] 3.3 Consistency pass: front-matter, "Go deeper" (not "Learn"), 2–4 diagrams, honor system, lab rails at
      intermediate-plus altitude, and the `sift` spine + through-line intact per module.
- [x] 3.4 Keep the existing per-module `cheatsheet.md`.
- [x] 3.5 `mkdocs build --strict` green; render spot-check.

## 4. Ship

- [ ] 4.1 Commit `plaintext-labs` (9 lab bodies) and `plaintext` (9 READMEs + overview + archived change +
      synced specs) on `track09-python-oss500` in both repos.
- [ ] 4.2 Self-containment + spine-integrity audit before merge.
- [ ] 4.3 Push both; merge into `main`; confirm the deploy runs green.
- [ ] 4.4 `openspec archive add-python-oss500-edition`; commit the archive.
