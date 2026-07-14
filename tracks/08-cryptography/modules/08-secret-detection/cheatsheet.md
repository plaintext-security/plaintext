---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Secret detection with gitleaks, trufflehog & pre-commit

*Companion to [Module 08 — Secret Detection & Leakage](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## gitleaks — scan history and the working tree

```bash
gitleaks detect --source .                 # scan full git history of the repo (regex + entropy)
gitleaks detect --source . --no-git        # scan files on disk, ignoring git history
gitleaks git --log-opts="-n 50"            # limit history scanned (pass any git-log options)
gitleaks detect --source . -v              # verbose — show each finding as it fires
gitleaks detect --source . --redact        # mask the secret value in output (safe for logs/CI)
```

## gitleaks — reports, config, and CI gating

```bash
gitleaks detect --source . -f json -r report.json   # JSON report (-f csv / sarif also valid)
gitleaks detect --source . -c data/gitleaks.toml    # use a custom ruleset (add Corp key patterns)
gitleaks detect --source . --baseline-path known.json   # ignore already-triaged findings
gitleaks protect --staged                           # scan staged changes only — the pre-commit gate
# gitleaks exits NON-ZERO when it finds a secret — that non-zero is the CI gate
jq 'group_by(.RuleID) | map({rule: .[0].RuleID, count: length})' report.json   # count by rule type
```

Custom rule (TOML) — a Corp-format key, tested against the planted secret *and* benign strings:

```toml
[[rules]]
id = "corp-api-key"
regex = '''MRDNSK-[A-Z0-9]{20}'''
```

## trufflehog — scan with live verification

```bash
trufflehog git file://.                     # scan a local repo's full history
trufflehog git https://github.com/org/repo  # scan a remote without cloning first
trufflehog github --org=corp                # scan every repo in an org
trufflehog filesystem ./dir                 # scan files on disk (no git)
trufflehog git file://. --only-verified      # only credentials confirmed live (Verified: true)
trufflehog git file://. --json               # machine-readable output
```

`Verified: true` = trufflehog called the credential's API and it *works* — critical, rotate now.
`Verified: false` = candidate/false positive, triage but not necessarily live.

## pre-commit — enforce a local gate

```bash
pip install pre-commit                       # install the framework
pre-commit install                           # wire the hook into .git/hooks
pre-commit run --all-files                   # run every hook against the whole tree once
git commit --no-verify                       # BYPASSES hooks — why CI must be the backstop
```

`.pre-commit-config.yaml` — pin gitleaks to a release, never a floating branch:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
```

## Prove a "deleted" secret survives (the lab's core reveal)

```bash
git log --oneline -- config.yml            # find the introduce commit and the "remove" commit
git show <introduce-commit>:config.yml     # the secret is still fully recoverable from history
gitleaks detect --source .                 # confirms it — a deletion commit does not un-leak it
```

## Gotchas worth remembering

- **A committed secret is disclosed the instant it's pushed.** Deleting the file in a later commit only
  hides it in the working tree — it stays reachable in history and in every clone. **Rotate first**, always.
- **Scan history, not just the current tree.** Toyota's key was public for ~5 years and never even
  "deleted." `gitleaks detect` / `trufflehog git` walk the full commit log — a working-tree-only scan misses it.
- **Run both tools — they fail in opposite directions.** gitleaks (regex + entropy) is fast and great at
  the commit gate but flags anything *shaped* like a secret; trufflehog's live verification tells you
  *which* findings to rotate first.
- **Pre-commit is necessary, not sufficient.** `git commit --no-verify` bypasses it and it only sees the
  local machine. CI scanning is the non-bypassable backstop; periodic history scans catch what predates the control.
- **A history rewrite doesn't reach the clones.** `git filter-repo` cleans your copy, but forks, mirrors,
  and CI caches made before the rewrite still hold the old history. There is no un-leak; there is only rotate.
- **Test custom regex both ways.** A rule bug either under-matches (misses the real key) or over-matches
  (buries the signal in false positives). Validate against the planted credential *and* the benign strings before trusting it.
