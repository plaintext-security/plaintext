# Cheat sheet — Anti-Forensics & Detecting It

*Companion to [Module 11 — Anti-Forensics & Detecting It](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## istat — dump both timestamp sets for one file

```bash
istat -o 2048 evidence.dd 34             # inode/MFT 34: all $SI and $FN timestamps + data runs
fls -o 2048 -r evidence.dd | grep -i suspect.exe    # find the inode/MFT number first
```

- On NTFS, `istat` prints **`$STANDARD_INFORMATION`** (SI — user-settable) and **`$FILE_NAME`** (FN —
  kernel-set) blocks. Comparing the two is the whole detection.

## $SI vs $FN — reading the divergence

```
$STANDARD_INFORMATION   Created / Modified / Accessed / Changed   ← Windows Explorer "Date modified"
                                                                    ← easy to set via Win32 API
$FILE_NAME              Created / Modified / Accessed / Changed   ← directory-entry level
                                                                    ← kernel-maintained, harder to touch

Red flags:
  SI created  ≪  FN created            (file "created" before its own directory entry)
  SI modified  <  SI created            (impossible under normal operation)
  SI times land on suspiciously ROUND values (exact :00 seconds, midnight)
  SI matches a known toolkit's compile date, FN does not
```

## Detection workflow (script it)

```
1. fls -r -d      → enumerate files, incl. deleted
2. istat each     → pull $SI + $FN four-tuples
3. compare        → flag SI-before-FN, sub-second-zero SI, SI/FN mismatch
4. corroborate    → does the SI time fit the surrounding timeline, prefetch, event log?
```

```python
# Skeleton: flag $SI-created earlier than $FN-created (via pytsk3 / parsed istat output)
if si_created < fn_created:
    flag(inode, "possible timestomp: $SI predates $FN")
```

## Log-tampering tells

```
Event ID 1102 (Security) / 104 (System)   → log was cleared through the API (legit clearing logs itself)
No 1102 but records missing               → raw deletion/corruption → GAP in record sequence numbers
Security log absent from the image        → document it: "expected log not present on imaged volume"
```

## Wiping vs. deletion — what still survives

```
Deleted (HDD)   often recoverable from slack / unallocated (fls -d + icat -r, carving)
Deleted (SSD)   TRIM may have zeroed the cells immediately — may NOT recover
Wiped/overwritten  content rarely carves back — BUT the ACT of wiping shows in:
                   • wiper binary's Prefetch record
                   • $LogFile / $UsnJrnl MFT-update entries
                   • shell history, process-execution (4688) traces
```

## Gotchas worth remembering

- **Timestomping usually touches only `$SI`.** `$FN` is kernel-maintained and left intact — a muddy
  boot print under a clean alibi. `istat` both, compare, done.
- **Absence is evidence.** A clean disk is not a clean host. A missing-but-expected Security log, a
  wiper in prefetch, a `$LogFile` entry, or a sequence-number gap all testify to what was hidden.
- **A round or "impossibly old" timestamp is a lead, not proof.** Corroborate against the timeline —
  a 2019 file sitting among files from this morning, with no explanation, earns a second look.
- **Log clearing records itself** (1102/104). Its *absence* alongside missing records means raw
  deletion — check the record sequence numbers for the gap.
- **AI can flag statistically anomalous timestamps, but can't replace `istat`.** You still need the
  raw attribute data — and the craft is knowing *why* a flag is anomalous, or it's not a defensible
  finding.
