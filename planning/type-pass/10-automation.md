# Type pass — Track 10 (Security Automation)

Spine: **Build-&-Operate + Judgment-as-Code/Gate**, bookended by judgment (01) and review (10).
Types reference: `planning/MODULE-TYPE-LIBRARY.md` (16 numbered types, six families).

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 The Automation Mindset | 1 Concept Autopsy | 11 Decision/ADR | ⚠ | Anchored on the toil/ROI framework (SRE "toil", repeatability×determinism), not on a named engineering disaster. Deliverable is a roadmap — but no Knight Capital / AWS S3-typo autopsy to make "faster = faster at being wrong" land via predict-then-reveal. |
| 02 Infrastructure as Code | 7 Build-&-Operate | 1 Concept Autopsy | ✓ | Toil killed: click-ops infra with no version history/review. plan→apply→destroy + local provider. Could anchor the `terraform apply` that deletes prod (mentioned in prose, not staged as a reveal). |
| 03 IaC Security Scanning | 8 Judgment-as-Code/Gate | — | ✓ | The gate that fails-bad/passes-good in CI; checkov/tfsec exit codes block `tofu apply`. Suppression-with-justification is the judgment. Clean fit. |
| 04 Configuration Management | 7 Build-&-Operate | 16 Drift/Steady-State | ⚠ | Idempotency + drift is *named in the prose* ("second run with CHANGED = drift") but the lab proves idempotency, it does not stage a t=0-fine / t=30-wrong drift-and-reconcile loop. Drift is latent, not built. |
| 05 CI/CD Pipelines & Gates | 7 Build-&-Operate | 8 Judgment-as-Code/Gate | ⚠ | Objective is "read/analyze/fix three workflow files for vulns" — closer to **14 Adversarial Review** of insecure CI than to building/operating a pipeline. Strong content (pull_request_target, permissions, secret injection) but framed as static review, not a running gate the learner operates. |
| 06 Containerising Tooling | 9 Tool-Build | 7 Build-&-Operate | ✓ | Packaged, reusable tool (trufflehog image) others run — UX/ENTRYPOINT/non-root/minimal-base. Tool-Build is the right primary. |
| 07 Enrichment & Data Pipelines | 7 Build-&-Operate | 9 Tool-Build | ✓ | Two-container collector/processor pipeline; directory-as-queue durability, observability. Reuses module 04's enrichment fn. Solid Build-&-Operate. |
| 08 SOAR Fundamentals | 7 Build-&-Operate | 8 Judgment-as-Code/Gate | ✓ | Working n8n playbook trigger→enrich→decide→respond with the human-in-the-loop gate as the central design call. Four-scenario testing. Good fit. |
| 09 Detection-as-Code Pipelines | 8 Judgment-as-Code/Gate | 13 Eval Harness | ✓ | Has the eval-harness bones the library flagged: pytest test-table `(rule,event,expected)`, mandatory false-positive "should-not-match" cases, CI gate on regression. This is the one detection module that *does* carry #13 — keep it, lean harder into "scorecard/regression gate" language to make #13 explicit. |
| 10 Reviewing AI-Generated Automation | 14 Adversarial Review | 8 Judgment-as-Code/Gate | ✓ | Flagship of type 14: catch the AI's structurally-sound/semantically-dangerous misconfigs, codify a reusable review checklist + suppression-trust policy. On point. (Minor: the "AI code review patterns (~1 hr)" Learn subsection is an empty header — no links.) |

## Coverage gaps

- **Eval Harness (#13) is present only in 09, and only implicitly.** The library predicted #13 would be under-used; here it exists (pytest FP table) but isn't *named* as eval-as-code (held-out set, scorecard, regression gate). It's also absent from 08 (a SOAR playbook with no labelled test set is a vibe — the four-scenario test is a start, not a scored harness) and from 10 (reviewing AI output cries out for a measured trust threshold, not just a checklist).
- **Drift/Steady-State (#16) is latent in 04, never built.** Drift is the *stated* anchor of config management but the lab stops at proving idempotency. No module stages detect-drift → reconcile as the deliverable. This is the clearest "should-add #16" in the track.
- **Migration/Brownfield (#12) is entirely absent.** Click-ops→IaC (import an existing clicked-together resource into Terraform state, strangler-fig, prove nothing broke) is the single most real-world automation task and the library explicitly calls for it here. No module touches `terraform import` / brownfield adoption.
- **Decision/ADR (#11) is thin.** 01 is the natural home (which tasks to automate, and *defend the cut line* — automate vs assist vs leave-manual) but it ships a roadmap, not an ADR. Naming 01's deliverable an ADR would seed the construct early, as the library suggests.
- **Concept-Autopsy anchor is soft on 01.** The library wants a named engineering disaster (Knight Capital 2012, AWS S3 2017) with a predict-then-reveal; the current 01 is a framework page. Retrofit the autopsy to give the track its judgment bookend real teeth.

## Suggested additions

1. **Click-ops → IaC Migration (type 12 Migration/Brownfield).** Import a hand-created resource (e.g. a security group or an S3 bucket spun up by `docker`/local provider stand-in) into Terraform state via `terraform import`, refactor to HCL incrementally, and prove `plan` shows zero drift afterward — the strangler-fig adoption every team actually does. Fills the track's biggest gap and pairs naturally after 02/03.
2. **Drift Detection & Reconciliation (type 16 Drift/Steady-State).** Build on 04: introduce out-of-band change to a hardened host, detect it (Ansible `--check`/`--diff` or a scheduled scan), and reconcile — deliverable is the drift detector + the reconciliation run, not just an idempotent playbook. Could be folded into 04 as an expanded second half rather than a new slot.
3. **(Optional) Make 09's eval harness explicit (type 13).** Rather than a new module, reframe 09 to ship a named scorecard + regression gate over a held-out event corpus, so the curriculum has one canonical Eval-Harness exemplar the AI track (12) can point back to.
