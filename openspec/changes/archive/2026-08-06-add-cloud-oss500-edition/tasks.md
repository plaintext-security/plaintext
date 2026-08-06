## 1. Reference module (lock the template)

- [x] 1.1 Rebuild `01-cloud-fundamentals` README in place: enhance self-contained prose, add 2–3 diagrams
      (shared-responsibility model; account/CLI/region topology), Learn→"Go deeper", a real case-study
      anchor. Reference Track 11/12 module 01 as the shape exemplar.
- [x] 1.2 Rewrite `plaintext-labs/cloud/01-cloud-fundamentals/lab.md` to the cognitive-load template,
      wrapping the real **floci** env; rails validated against actual `make up`/`demo` output.
- [x] 1.3 Interim `mkdocs build --strict` green (spot-check the reference).

## 2. Rebuild modules 02–17 (parallel fan-out)

- [x] 2.1 `02-cloud-identity-iam` — README + lab + case study (IAM policy/trust).
- [x] 2.2 `03-iam-attack-paths` — Capital One SSRF→IAM seam; attack-path diagram; authorization note.
- [x] 2.3 `04-cloud-network-security` — README + lab + case study.
- [x] 2.4 `05-posture-auditing` — README + lab + case study (public-bucket exposure).
- [x] 2.5 `06-iac-security` — README + lab + case study.
- [x] 2.6 `07-secrets-management` — README + lab + case study.
- [x] 2.7 `08-cicd-security` — README + lab + case study.
- [x] 2.8 `09-serverless-security` — README + lab + case study.
- [x] 2.9 `10-container-image-security` — README + lab + case study.
- [x] 2.10 `11-container-escape-runtime` — CVE-2019-5736 seam; namespace/escape diagram; authorization note.
- [x] 2.11 `12-kubernetes-rbac-network` — diagram-dense (subject→binding→role/scope); kind env.
- [x] 2.12 `13-kubernetes-admission-runtime` — admission flowchart; Tesla cryptojacking seam; kind env.
- [x] 2.13 `14-cloud-attack-techniques` — CISA KEV / ATT&CK cloud technique; authorization note.
- [x] 2.14 `15-cloud-logging-detection` — README + lab + case study.
- [x] 2.15 `16-cloud-incident-response` — README + lab + case study.
- [x] 2.16 `17-data-protection-kms` — README + lab + case study (envelope encryption / KMS).

## 3. Overview & verify

- [x] 3.1 Rebuild `tracks/05-cloud/README.md` with a phase Mermaid diagram, module table, phases/projects,
      capstone + rubric, AI & automation.
- [x] 3.2 Resolve every `<!-- VALIDATE -->` marker (WebFetch/WebSearch); confirm each link resolves.
- [x] 3.3 Consistency pass: front-matter shape, "Go deeper" (not "Learn"), 2–4 theme-safe diagrams,
      honor-system, lab rails match the real `plaintext-labs/cloud/<NN>` env (floci/kind honesty).
- [x] 3.4 Keep the existing per-module `cheatsheet.md`.
- [x] 3.5 `mkdocs build --strict` green; render spot-check (a floci lab, a kind lab, a diagram-heavy module).

## 4. Ship

- [ ] 4.1 Commit `plaintext-labs` (17 lab bodies) and `plaintext` (17 READMEs + overview + archived change +
      synced specs) on `track05-cloud-oss500` in both repos.
- [ ] 4.2 Push both; merge into `main` (both repos); confirm the Cloudflare deploy runs green.
- [ ] 4.3 `openspec archive add-cloud-oss500-edition` (syncs specs); commit the archive.
