# Module 08 — PowerShell as the Weapon: Detonate, Detect, Harden

*Type 5 · Detonate & Detect — safely reproduce a real PowerShell abuse technique against a shipped, intentionally-vulnerable lab target, capture the telemetry it emits, build the detection that catches it, and write the hardening that would have stopped it. (Secondary: Type 15 · Red-team-the-AI — you attack the surface `Vigil` runs on.) [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the same language you build `Vigil` in is the attacker's favourite loader; this module makes you fluent in both directions.*

!!! abstract "In 60 seconds"
    PowerShell is the defender's daily language *and* one of the most abused execution surfaces on
    Windows — encoded commands, download cradles, and string obfuscation are how a decade of malware
    families (Emotet, Cobalt Strike, countless commodity loaders) actually land. In this module you
    **detonate** a benign copy of that technique against a shipped lab target, **capture** the telemetry it
    produces (script-block logging, Event ID 4104, and process-creation, Event ID 4688), **build** a
    detection — `New-VigilDetection` — that fires on the abuse and stays quiet on benign admin PowerShell,
    and then write the **hardening** that removes the attacker's advantage: script-block logging on,
    Constrained Language Mode, and AMSI. The detonation and detection run cross-platform in the Linux
    container; the two Windows-only controls (AMSI and CLM enforcement) are taught fully and left as an
    honest, optional Windows-VM step.

## Why this matters

Every module before this one built `Vigil` to *read* Windows telemetry well. This one makes you write the
telemetry — as an attacker would — so you understand the signal you're detecting from the inside. That
matters because PowerShell abuse is not a corner case: it is the single most common way commodity and
targeted malware runs code on Windows, precisely because `pwsh`/`powershell.exe` is signed, present
everywhere, and can pull and execute a payload without ever touching disk. MITRE tracks it as
[T1059.001](https://attack.mitre.org/techniques/T1059/001/), and the obfuscation that hides it as
[T1027](https://attack.mitre.org/techniques/T1027/). If you can only recognise the clean version of a
command, you will miss the base64-`-EncodedCommand` version, the `'{1}{0}'-f`-rebuilt version, and the
char-code version — which are the versions you will actually see in a log.

The detection-engineering lesson underneath is the one that separates a real analyst from a keyword grep:
**encoding is a signal, not a verdict.** A base64 `-EncodedCommand` is suspicious *because it hides
intent*, but you cannot rule on it until you decode it and read what it actually does. A detection that
only matches the string `IEX` is trivially defeated by `&('{1}{0}'-f'X','IE')`; a detection that decodes
the payload and inspects the *behaviour* — a remote fetch wired to an execution primitive — survives the
obfuscation. That is the detection you build here, and the hardening you pair it with (script-block
logging so you *have* the decoded text, CLM and AMSI so the payload can't run in the first place) is the
other half of owning the technique.

## Objective

Detonate a benign reproduction of an encoded/obfuscated PowerShell abuse (a base64 `-EncodedCommand`, an
`IEX` download cradle, and string obfuscation) against the shipped lab target; capture the resulting
script-block-logging (4104) and process-creation (4688) telemetry; build `New-VigilDetection` so it fires
on the malicious sample, decodes the encoded payload to detect the behaviour inside it, and stays quiet on
a held-out benign sample; and write the hardening note (script-block logging, Constrained Language Mode,
AMSI) that would have stopped or exposed the attack — honest about which controls the Linux container can
enforce and which are Windows-only.

## The core idea

**Reproduce the technique benignly, then detect the behaviour — not the string.** The whole module is a
loop: fire the technique, look at what it logged, write the rule that catches it, then harden so it can't
run. The discipline that makes the detection good is refusing to detect on surface text. Attackers obfuscate
*specifically* to keep the tell-tale strings out of the log: `IEX` becomes `&('{1}{0}'-f'X','IE')` or
`[char]105+[char]101+[char]120`; the real command becomes a base64 blob behind `-EncodedCommand`. A rule
that matches literals loses to a one-line change. A rule that **decodes** the `-EncodedCommand` payload
(base64, UTF-16LE — the encoding PowerShell itself uses) and then looks for the *behaviour* — a download
primitive (`Net.WebClient.DownloadString`, `Invoke-WebRequest`) wired to an execution primitive (an `IEX`,
a `| &`, a `.Invoke()`) — sees through the obfuscation because behaviour is what obfuscation can't hide.
That decode-then-inspect move is the load-bearing judgment of the module.

**Your detection code must handle the malicious string as *data*, never as code.** This is the trap that
catches beginners and copilots alike: to detect an `Invoke-Expression` cradle, your code has to *look for*
the string `Invoke-Expression` — and the lazy way to do that is to build the command and run it, which is
exactly the vulnerability you're detecting. Scan telemetry as inert text (regex, or an AST walk), never
`Invoke-Expression` it. The reference `New-VigilDetection` even builds its `iex`/`Invoke-Expression`
indicator from a character array at runtime so the literal never appears as a call site — which also keeps
the `PSAvoidUsingInvokeExpression` analyzer rule green. The principle generalises: a detection engine that
executes the thing it detects is a detonator, not a detector.

**Hardening is the other half of the technique — and it comes in two honest tiers.** Detection tells you
the attack ran; hardening decides whether it *can*. Three controls matter here, and they are not equal.
**Script-block logging** (the policy that writes Event ID 4104) is the one that *gives you the telemetry
in the first place* — with it off, the decoded scriptblock text your detection reads simply doesn't exist,
so turning it on is prerequisite, not optional. **Constrained Language Mode (CLM)** neuters the .NET calls
(`New-Object`, `[System.Reflection]…`) that most cradles depend on, and **AMSI** hands the deobfuscated
buffer to the installed antivirus at runtime, catching the payload *after* it de-obfuscates but *before*
it runs. The honest catch: script-block logging telemetry can be *generated and consumed* cross-platform,
but **live AMSI and CLM enforcement are Windows-only** — they are not active in the Linux lab container.
This module teaches all three; it *demonstrates* the logging-and-detection loop and marks AMSI/CLM
enforcement as **assessed-not-demonstrated**, with an optional Windows-VM step to see them fire for real.

??? note "Why `-EncodedCommand` uses UTF-16LE base64 (and why that trips people up)"
    PowerShell's `-EncodedCommand` expects the command as **base64 of the UTF-16LE (little-endian
    Unicode) bytes**, not UTF-8. That's why decoded payloads in blog writeups are full of interleaved
    null bytes if you decode them as UTF-8, and why a detection that assumes UTF-8 gets garbage. When you
    decode for inspection, use `[System.Text.Encoding]::Unicode.GetString(...)` (in .NET, `Unicode` *is*
    UTF-16LE). Get this wrong and your detection silently fails to see inside every encoded command — a
    classic quiet-miss the copilot will happily ship.

## Learn (~2–3 hrs)

**The techniques (what you're reproducing — read these first)**

- [MITRE ATT&CK — T1059.001 (Command and Scripting Interpreter: PowerShell)](https://attack.mitre.org/techniques/T1059/001/) (~20 min)
  — the canonical catalogue entry: how PowerShell is abused for execution, the procedure examples from real
  intrusions, and — crucially for you — the **Detection** and **Mitigation** sections that name script-block
  logging, CLM, and AMSI. Read the detection guidance closely; it's the spec for what you build.
- [MITRE ATT&CK — T1027 (Obfuscated Files or Information)](https://attack.mitre.org/techniques/T1027/) (~15 min)
  — why the string obfuscation exists and the sub-techniques (encoded commands, char-code, format-operator).
  This is *why* a literal-matching detection loses.

**The telemetry (what you capture, and the fields that matter)**

- [Microsoft Learn — "About Logging Windows" / PowerShell script-block logging](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_logging_windows) (~20 min)
  — script-block logging, Event ID **4104**, and how the deobfuscated scriptblock text ends up in the log
  (this is *why* AMSI/logging see through obfuscation). Skim to understand what 4104 contains and how it's enabled.
- [Microsoft Learn — "Antimalware Scan Interface (AMSI) fundamentals"](https://learn.microsoft.com/en-us/windows/win32/amsi/how-amsi-helps) (~15 min)
  — how AMSI hands a script buffer to the AV *after* de-obfuscation but *before* execution; the exact reason
  obfuscation-only evasion fails against a patched host. Read "How AMSI helps."

**Hardening (the controls, and their real limits)**

- [Microsoft Learn — `about_Language_Modes` (Constrained Language Mode)](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_language_modes) (~15 min)
  — what CLM actually blocks (arbitrary .NET types, `Add-Type`, COM) and what it still allows; read enough
  to know why it breaks most cradles but is not a silver bullet. It's a *language* restriction, enforced on Windows.
- [Red Canary — "Detecting malicious PowerShell" (threat-detection guidance)](https://redcanary.com/threat-detection-report/techniques/powershell/) (~15 min)
  <!-- VALIDATE: confirm URL resolves to the current Threat Detection Report PowerShell technique page; else cite Red Canary Threat Detection Report by title/year -->
  — a defender-vendor writeup of how PowerShell abuse looks in real telemetry and which signals hold up;
  a good cross-source check on the ATT&CK detection guidance from a team that hunts it daily.

**A real malicious-PowerShell writeup (see the technique in the wild)**

- [The DFIR Report — an intrusion analysis featuring an encoded/obfuscated PowerShell stager](https://thedfirreport.com/) (~20 min)
  <!-- VALIDATE: pick one specific DFIR Report case study whose stager is an encoded/IEX-cradle PowerShell loader (e.g. an Emotet or Cobalt Strike beacon delivery) and link that exact post; confirm the URL before ship -->
  — read one full case where the initial or staging payload is an encoded PowerShell command, and trace it
  to the 4104/4688 telemetry the responders used. This is the real-world shape your benign detonation mimics.

## Key concepts
- **PowerShell abuse = T1059.001; the obfuscation that hides it = T1027** — the two techniques you detonate and detect.
- **Decode, then judge** — a base64 `-EncodedCommand` is UTF-16LE; decode it and detect the *behaviour*, not the encoding.
- **Detect behaviour, not strings** — a download primitive wired to an execution primitive survives `'{1}{0}'-f` obfuscation; a literal match doesn't.
- **Handle the malicious string as data** — scan telemetry with regex/AST; never `Invoke-Expression` the thing you're detecting.
- **Three hardening controls, unequal:** script-block logging *gives you the telemetry*; CLM and AMSI *stop the payload* — and AMSI/CLM enforcement is **Windows-only** (assessed-not-demonstrated in the container).
- **A held-out benign check is part of the deliverable** — a detection that only fires on the attack is half-tested; it must also stay quiet on real admin PowerShell.

## AI acceleration

This is a detection-engineering module, so the AI move is: have the copilot draft the detection rules from
the ATT&CK detection guidance and a handful of malicious samples — then review every line for the two
failure classes this domain breeds. **First failure class: the copilot detects the string, not the
behaviour.** Ask a model for "a PowerShell IEX-cradle detection" and you'll typically get a regex for the
literal `IEX` and `DownloadString` — which misses `&('{1}{0}'-f'X','IE')` entirely and floods you with
false positives on any admin who legitimately runs `Invoke-WebRequest`. The correction is the behaviour
pairing (download primitive **and** execution primitive) plus decoding the encoded payload before you
judge it. **Second failure class — the dangerous one: the copilot writes a detector that executes what it
detects.** Watch for any generated code that builds a command string from telemetry and runs it (an
`Invoke-Expression`, a `& ([scriptblock]::Create($fromLog))`) to "analyse" it — that turns your detector
into a detonator. Scan as inert data; never run it. Finally, make the model prove its rule on a *held-out*
benign corpus, not the malicious samples it was written against — a detection that hasn't been shown to
stay quiet on real admin PowerShell is a false-positive generator waiting to page you.

!!! question "Check yourself"
    - Why does a detection that matches the literal string `IEX` fail, and what does detecting the
      *behaviour* (a download primitive wired to an execution primitive) catch that the literal match misses?
    - `-EncodedCommand` payloads are base64 of what byte encoding — and what breaks in your detection if you
      decode them as UTF-8?
    - Which of the three hardening controls (script-block logging, CLM, AMSI) is a prerequisite for your
      detection to have anything to read at all, and which two actually stop the payload from running — and
      which of those two can the Linux container *not* enforce?
