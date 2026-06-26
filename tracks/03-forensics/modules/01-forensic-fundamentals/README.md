# Module 01 — Forensic Fundamentals & Evidence Handling

*Type 1 · Concept Autopsy — dissect why forensic integrity is the load-bearing concept of the whole track by hashing and verifying evidence, documenting a chain of custody, and producing a defensible record of how the evidence was handled. (Secondary: Misconception Reveal — kill the "hash it later, it's fine" intuition by showing how an image gets excluded.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Digital Forensics & IR** — *every conclusion you ever draw in this track stands or falls on what you do in the first five minutes.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    Every conclusion you draw in forensics is downstream of one act: fixing the evidence at a moment
    in time and proving it didn't change. That means **hashing before you work** (SHA-256 minimum,
    inline during imaging), a **chain of custody** an opposing examiner could re-verify, and a
    **forensic image** you analyse instead of the original. Write-blocking is mandatory; collection
    order follows volatility (RAM first). Get the first five minutes wrong and everything after is
    tainted.

## Why this matters
Forensic work is downstream of trust: a timeline reconstruction, a root-cause verdict, a legal hold — all of it is only as reliable as the chain of custody that precedes it. Get the fundamentals wrong and every artifact you surface later is tainted. Courts have excluded forensic evidence because the examiner couldn't prove the image matched the original; IR reports have been challenged because the hash wasn't taken before first access. This module is the foundation everything else is built on, and it pays forward to every subsequent module in the track.

The reference point for what clean evidence handling looks like is the **[M57-Patents scenario](https://digitalcorpora.org/corpora/scenarios/m57-patents-scenario/)** — a public Digital Corpora dataset that imaged every hard drive and RAM stick of a small company *daily* across four weeks of a (simulated, but realistically run) insider-data-exfiltration investigation, capturing and publishing the MD5/SHA1/SHA256 of each image alongside it. It is the dataset academic and law-enforcement forensics courses actually use, and it is the canonical example of the discipline this module teaches: hash-on-acquisition, day-over-day integrity, and a documented chain of custody that an opposing examiner could re-verify. You will work from M57 images directly in later modules; here, study how its hashes and acquisition logs are structured.

## Objective
Explain why forensic integrity matters, compute and verify hashes with `sha256sum` and `dc3dd`, document a chain of custody for collected evidence, and articulate the difference between a forensic image and a live snapshot.

## The core idea
The foundational move in digital forensics is the same one accountants call "closing the books": you fix a moment in time, prove that your record of it is accurate, and then never touch the original again. In practice that means **hashing before you work**. A cryptographic hash (SHA-256 is the minimum today; MD5 alone is no longer sufficient) is a fingerprint for a file or disk. If the hash you take at collection matches the hash you recompute before analysis, nothing changed in between — not your hand, not a bad cable, not a malware dropper that woke up mid-collection. If the hashes diverge, you have a broken chain and your findings are uncorroborated.

!!! note "The mental model"
    Forensic integrity is "closing the books": fix a moment in time, prove your record of it is
    accurate, then never touch the original again. A hash is the tamper-evident seal; a matching
    hash at analysis time means *nothing* changed between collection and now.

**Chain of custody** is the paper trail that proves who had possession of the evidence and when. In a court context that means a physical form (or its digital equivalent) that travels with the evidence: received from, transferred to, stored at, each signed and timestamped. In an enterprise IR context it means the same thing in your ticketing system or evidence management tool — an audit trail that shows no unauthorized hand touched the evidence. The chain isn't bureaucracy; it is the mechanism by which anyone — including an adversary's attorney — can verify that you didn't plant, alter, or misinterpret what you found.

**Forensic imaging** is the discipline of capturing evidence *before* analysis, not during. You never analyze the original — you work on a verified copy of a verified image. This matters most for storage media: a forensic duplicate is a sector-by-sector copy that includes deleted space, slack space, and unallocated areas, not just the files the OS presents. Tools like `dc3dd` (a forensic-purpose fork of GNU `dd`) compute and log the hash *during* the imaging pass, which proves the image was accurate at the moment of capture — not "I hashed it later and it happened to match." The hash happens inline, not as an afterthought.

!!! warning "The gotcha"
    The cardinal sin is touching the original without a write blocker. Mounting evidence media —
    even read-only, even just to "run an AV scan to check" — updates access timestamps, modifies
    journal entries, and alters metadata you needed. Now explain to opposing counsel why dozens of
    fields changed. Write-block *before* any contact with source media; "I hashed it later and it
    matched" is not the same proof as an inline hash.

??? note "Go deeper: dead-box vs. live, and the volatility order"
    Volatility determines collection order: RAM disappears the moment power is cut, and it holds
    process state, decrypted keys, live connections, and injected code that never touched disk — so
    collect highest-volatility first. But a live system *is* live: running malware, active
    connections, processes writing to disk. Whether to pull the power (dead-box) or work live is one
    of the first judgment calls in a real IR, and there is no universally right answer — it depends
    on what the investigation needs most.

    Collect in that order — most volatile first:

    ```mermaid
    flowchart TB
        A["CPU registers / cache<br/>— gone in nanoseconds"]
        B["RAM<br/>— process state, keys, live connections"]
        C["Disk<br/>— files, slack, unallocated"]
        D["Archives / offline backups<br/>— durable"]
        A -->|"more volatile"| B --> C -->|"less volatile"| D
    ```

!!! tip "AI caveat"
    Let a model draft the chain-of-custody log and the report scaffold — never let it stand in for
    running the hash. Computing the hash is the tool's job, not the model's; the dead-box-vs-live
    call is your judgment, not a model's.

## Learn (~3 hrs)

**Foundations (~1 hr)**
- [NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response](https://csrc.nist.gov/pubs/sp/800/86/final) — the authoritative U.S. government framework; read sections 2–3 for evidence handling and collection principles. Free PDF, no login.
- [RFC 3227 — Guidelines for Evidence Collection and Archiving](https://www.rfc-editor.org/rfc/rfc3227) — two pages of distilled guidance on collection order and handling; short enough to read twice.

**Hashing and imaging (~1 hr)**
- [dc3dd man page and usage guide (DCFL)](https://sourceforge.net/projects/dc3dd/files/dc3dd/7.2/) — the forensic `dd`; skim the flag listing (`hash`, `log`, `hof`) to understand what it gives you that plain `dd` doesn't.

**Chain of custody (~1 hr)**
- [Digital Corpora — M57-Patents scenario](https://digitalcorpora.org/corpora/scenarios/m57-patents-scenario/) — open the scenario page and study how a real teaching dataset publishes its evidence: per-image hashes (MD5/SHA1/SHA256), daily acquisitions, and the supporting documents (warrants, detective reports). ~20 min; this is the shape your own chain-of-custody log should take.
- [FBI — Digital Evidence Collection & Handling Guide](https://www.fbi.gov/services/information-management) — federal standard for evidence chain of custody and documentation. See Law Enforcement guidance sections.
- [RFC 3227 — Guidelines for Evidence Collection and Archiving (also above)](https://www.rfc-editor.org/rfc/rfc3227) — includes explicit chain-of-custody requirements, handling procedures, and template forms.

## Key concepts
- A cryptographic hash is a tamper-evident seal; SHA-256 is the current minimum.
- `dc3dd` computes the hash *inline* during imaging, which is stronger than hashing after.
- Chain of custody proves who had possession, when, and that nothing changed between hands.
- Forensic imaging captures unallocated space and deleted data — it is not a file copy.
- Write-blocking is mandatory before any contact with source media.
- Collect in order of volatility: RAM → running processes → disk → offline storage.
- Dead-box vs. live acquisition is a judgment call driven by the investigation's needs, not habit.
- Real teaching datasets (Digital Corpora's M57-Patents) publish per-image hashes and daily acquisitions — model your own evidence log on them.

## AI acceleration
AI is most useful here as a chain-of-custody drafter and report scaffolder: describe what you collected and when, and a model will produce a formatted evidence log you then verify and sign. Where AI is *not* useful: computing hashes (trust the tool, not the model), and deciding whether to pull power (that judgment is yours, not a model's). Use AI to draft; never use it to substitute for running the actual hash command and comparing the output yourself.

!!! question "Check yourself"
    - Why is a hash computed *inline* during imaging (e.g. by `dc3dd`) stronger evidence than one you compute after the fact?
    - You mounted the original drive read-only "just to look." What did you potentially destroy, and what should you have done instead?
    - In what order do you collect RAM, disk, and offline backups — and what single property drives that order?
