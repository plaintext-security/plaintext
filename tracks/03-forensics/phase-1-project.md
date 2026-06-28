# Phase 1 Project — Forensically Sound Acquisition Kit

*Forensics · Phase 1 (modules 01–03) · ~4–6 hrs · Prereqs: finish modules 01, 02, 03 first.*

> You learned to hash, to image, and to carve as three separate drills. The project is the **integration**:
> one acquisition kit that images a disk *and* captures memory, proves nothing changed with hashes, and
> recovers deleted files back out — all behind a chain-of-custody log that would survive a challenge.

## Why this is a project, not another module

Each Phase-1 module left one preservation artifact. Alone they're three procedure notes; integrated they're
the kit you'd actually run on first contact with evidence:

- **01 · Fundamentals** → `chain-of-custody.md` — the defensible start: who touched what, when, and the
  acquisition hashes that anchor integrity.
- **02 · Acquisition & imaging** → `acquisition-notes.md` — the `dc3dd` image with its verification hash,
  order of volatility respected.
- **03 · File systems & carving** → `findings.md` — the deleted files recovered with `foremost`/Sleuth Kit
  and tied back to the file system that held them.

## Build it

1. **Unify acquisition behind one entrypoint.** Wrap your imaging step (02) and a memory-capture step
   behind **one runner** — `acquire <target>` — that images the disk, captures RAM, and **hashes each on
   acquisition**, respecting order of volatility. The single kit that does both and records the hashes *is*
   the new work.
2. **Verify, then carve from the copy.** Before any analysis, re-hash and confirm the image matches its
   acquisition hash; then carve deleted files (03) from the **verified copy**, never the original — and note
   which file system structure each recovery came from.
3. **One custody record.** Produce a combined `custody-log.md`: the disk and memory acquisitions, every hash
   at every handoff, and the carve results — each section leading with a two-sentence *what was acquired, how
   integrity was proven, what was recovered.*

## Success criteria

- [ ] **One** kit acquires **both** a disk image and a memory capture, hashing each on acquisition.
- [ ] The image is re-hashed and verified **before** analysis, and all carving runs on the copy.
- [ ] The custody log records a hash at every handoff and ties each recovered file to its source.

## Deliverable

An `acquisition-kit/` folder in your repo: the **unified runner**, the **combined `custody-log.md`**, and
your committed module notes (`chain-of-custody.md`, `acquisition-notes.md`, `findings.md`). Reference the
evidence — **do not** commit the disk image, the memory capture, `dc3dd.log`, carved output, or any modified
copy of the evidence (see `.gitignore`).

## Self-check rubric

Grade your own `acquisition-kit/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Acquisition coverage** | Disk or memory, or two separate scripts | One runner acquires both disk and memory, hashing each | Order of volatility respected and documented; write-blocking/read-only demonstrated |
| **Integrity** | No hashing, or hashes don't match | Image hashed on acquisition and verified before analysis; working on a copy | Hashes recorded at every handoff; mismatch handling shown |
| **Recovery** | Nothing carved, or carved without context | Deleted files recovered and tied to their file-system source | Pivoted from carve to file-system metadata to confirm the recovery |
| **Hygiene** | Images/logs committed | No images/captures/logs/secrets in history; `.gitignore` present | Commits tell the build story; custody log is challenge-ready |

→ Next: **[Module 04 — Windows Artifacts](modules/04-windows-artifacts/README.md)** opens Phase 2, which ends in the **[Phase 2 Project](phase-2-project.md)**.
