# Module 06 — Secrets, Remoting & Least Privilege

*Type 7 · Build-&-Operate — ship the least-privilege path for `Vigil`: config with its secrets in a vault instead of in source, remoting that runs on a **constrained** endpoint instead of a full admin shell, and a **JEA** role that exposes only the read-only hunt verbs. [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot pastes the token straight into the script and opens an admin session to run one read-only command; your edge is the vault and the constrained endpoint that make neither necessary.*

!!! abstract "In 60 seconds"
    Two things the copilot gets reliably, dangerously wrong in PowerShell: it puts **secrets in source**
    (`$token = 'sk-...'`, `ConvertTo-SecureString -AsPlainText 'P@ss'`) and it **over-privileges
    remoting** (a full `Invoke-Command` as admin to run one hunt verb). This module fixes both. You give
    `Vigil` a **`SecretManagement`-backed config** so the token lives in a vault and is fetched by name at
    run time — never committed. Then you build `Invoke-VigilRemote` against a **JEA (Just Enough
    Administration)** endpoint, `Vigil.ReadOnly`, that exposes *only* Vigil's read-only hunt functions:
    even a fully compromised caller can run nothing else on the far end. Honest scope: `SecretManagement`
    and `SecretStore` are cross-platform and you demonstrate them **live** in the Linux lab; **JEA
    enforcement and WinRM remoting are Windows-only**, so you author and teach them here and *enforce* them
    on an optional Windows VM.

## Why this matters

A hardcoded secret is the failure that shows up in breach post-mortems and in your own git history forever.
Ask a copilot to "call the threat feed with my API key" and it will cheerfully write `$key = 'abc123'` at
the top of the script, or reach for `ConvertTo-SecureString -AsPlainText` — which is a `SecureString` in
name only, since the plaintext is right there in the source. Once that's committed it is *published*: git
keeps it, CI logs echo it, and rotating it means editing every script that copied it. The same copilot,
asked to "run the hunt on the domain controller," reaches for `Invoke-Command -ComputerName DC01
-ScriptBlock { ... }` under an admin credential — an unconstrained remote shell, when all you needed was
one read-only verb. That gap is exactly the lateral-movement surface JEA exists to close: if the endpoint
can only run `Get-VigilEvent`, a stolen session is worth almost nothing.

This is the least-privilege phase of the track, and it compounds everything before it. Module 04's
concurrent enrichment hits a *feed* that needs a *credential* — which now comes from a vault, not a
literal. Module 03's telemetry lives on *remote* Windows hosts — which you now reach through a constrained
endpoint, not an admin session. Get this module right and `Vigil` can run against a fleet without ever
holding a plaintext secret or opening a door wider than the job requires.

## Objective

Give `Vigil` a `Microsoft.PowerShell.SecretManagement` + `SecretStore`-backed configuration so no plaintext
credential ever appears in source; build `Invoke-VigilRemote` to run a read-only hunt verb on a remote
Windows host through a **constrained** PowerShell Remoting endpoint; and author a `Vigil.ReadOnly` JEA
**role capability** (`.psrc`) + **session configuration** (`.pssc`) that exposes only Vigil's read-only
verbs. Demonstrate the secret flow live in the Linux container; assess (not just assert) the JEA
constraint, enforcing it on the optional Windows VM.

## The core idea

**Config in source, secrets in a vault — and the two never mix.** The discipline is a clean split:
*non-secret* settings (which host, which feed URL, which vault) live in a committed config file; the
*secret itself* (a token, a service credential) lives in a vault and is fetched **by name** at the moment
of use. `SecretManagement` is the abstraction that makes this portable — it's a thin cmdlet layer
(`Set-Secret`, `Get-Secret`) over a registered *vault extension*, so the same script runs against a local
`SecretStore` on your laptop, Azure Key Vault in production, or a teammate's KeePass, by changing only the
`-Vault` name. `SecretStore` is the cross-platform local vault: it encrypts a file with .NET crypto and
works anywhere `pwsh` 7 does, including the Linux lab. The tell you're looking for in the copilot's output
is any secret that is *legible in the source* — a string literal, an `-AsPlainText` conversion of a
literal, a credential built from a hardcoded password. In this module's `Vigil`, the write path
(`Set-VigilSecret`) only accepts a `[SecureString]`, so a plaintext literal *cannot flow through it*, and
the read path (`Get-VigilConfig`) resolves the secret lazily — the config object holds no credential
material until you actually call for the token.

**Least privilege is a property of the *endpoint*, not a promise in the script.** "I'll only run
read-only commands" is a hope; a constrained endpoint is a control. **JEA** turns a PowerShell Remoting
endpoint into a *just-enough* surface: a **role capability file** (`.psrc`) lists exactly which functions
and cmdlets a connecting user may run — for `Vigil.ReadOnly`, only the hunt verbs and a couple of safe
read-only built-ins, with **no** state-changing cmdlets, **no** providers (so no filesystem or registry),
and **no** external programs. A **session configuration file** (`.pssc`) registers that endpoint as a
`RestrictedRemoteServer` (which drops the session into **NoLanguage** mode and a tiny default command set)
and maps a security group to the role. Crucially, it can run each session under a *temporary virtual
account*, so analysts connect with **non-admin** credentials yet the endpoint still has the access it
needs — you remove standing privilege without breaking the job. The mental model: instead of handing
someone the keys to the server and trusting them to touch only what they should, you build a control room
with exactly the four buttons their role requires. A stolen session, an injected command, a confused
deputy — none of them can push a button that isn't on the panel.

**Be honest about what the container enforces.** `SecretManagement`/`SecretStore` are genuinely
cross-platform: the lab's `make demo` stores and retrieves a secret **for real** on Linux. But **PowerShell
Remoting over WinRM and JEA *enforcement* are Windows-only** — there is no WinRM listener and no JEA
runtime on the Linux container, so it *cannot* constrain a session. What the container *can* do, and does,
is prove the `.psrc`/`.pssc` are **well-formed and read-only** (it parses them and asserts the shape: no
wildcards, no providers, virtual account, `RestrictedRemoteServer`). Running the constrained endpoint
end-to-end — registering `Vigil.ReadOnly` and watching a non-admin session be *denied* everything but the
hunt verbs — is an **optional Windows-VM step**, and it is *assessed-not-demonstrated* on Linux.
`Invoke-VigilRemote` is written to target a Windows host and fails loudly (with a pointer to the VM step)
if you call it from the container.

??? note "One honest caveat: the Secret* modules are 'feature complete'"
    Microsoft has declared `Microsoft.PowerShell.SecretManagement` and `SecretStore`
    **feature-complete** — supported for security and critical fixes, but no longer actively developed —
    because the industry is shifting to passwordless and federated identity (managed identities, workload
    identity federation, passkeys). That does **not** make them wrong to learn: they are still the standard
    way to keep secrets out of a PowerShell script today, the abstraction (`Get-Secret` by name from a
    registered vault) is exactly the pattern the newer approaches also use, and the *discipline* — never a
    literal in source — is timeless. Pin the versions (this lab does), and know the direction of travel.

## Learn (~2–3 hrs)

**Secrets out of source (do these first — this is what runs live in the lab)**

- [Microsoft Learn — "Overview of the SecretManagement and SecretStore modules"](https://learn.microsoft.com/en-us/powershell/utility-modules/secretmanagement/overview) (~15 min)
  — the anchor: what the abstraction is, why a *registered vault* is the boundary, and the honest note that
  the modules are now feature-complete. Read the "Extension Vault Ecosystem" section to see how the same
  script targets `SecretStore`, Key Vault, or KeePass by name.
- [Microsoft Learn — "Get started with the SecretStore module"](https://learn.microsoft.com/en-us/powershell/utility-modules/secretmanagement/get-started/using-secretstore) (~20 min)
  — the concrete cross-platform vault you use in the lab: `Register-SecretVault`, `Set-Secret`/`Get-Secret`,
  and the store's password/authentication model. This is the hands-on half of the anchor.
- [Microsoft Learn — "Use the SecretStore in automation"](https://learn.microsoft.com/en-us/powershell/utility-modules/secretmanagement/how-to/using-secrets-in-automation) (~15 min)
  — how a non-interactive script (CI, a scheduled hunt) unlocks the store without a prompt, and the honest
  security trade-off of a passwordless store. Read this before you wire secrets into `Invoke-VigilEnrichment`.

**Least-privilege remoting (author it here; enforce it on the VM)**

- [Microsoft Learn — "Overview of Just Enough Administration (JEA)"](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/jea/overview) (~15 min)
  — the anchor: the three things JEA buys you (fewer admins, limited commands, full transcripts) and the
  lateral-movement threat model it answers. The DNS-admin example is the mental model for `Vigil.ReadOnly`.
- [Microsoft Learn — "JEA Role Capabilities"](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/jea/role-capabilities) (~25 min)
  — the `.psrc`: `VisibleCmdlets`/`VisibleFunctions`, why **no wildcards**, the list of dangerous cmdlets to
  never expose, and how custom functions escape the language constraint (so keep them read-only). Read the
  "dangerous commands" list — it's the review checklist for your own role.
- [Microsoft Learn — "JEA Session Configurations"](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/jea/session-configurations) (~20 min)
  — the `.pssc`: `SessionType RestrictedRemoteServer` (NoLanguage), `RunAsVirtualAccount`,
  `RoleDefinitions`, transcripts, and `Test-PSSessionConfigurationFile`. This is the file the lab validates
  and the VM registers.

**Grounding (skim for the "why it matters" — vary your sources)**

- [PowerShell docs — "Running Remote Commands"](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/running-remote-commands) (~10 min)
  — the base you're constraining: `New-PSSession`/`Invoke-Command`/`-ConfigurationName`, and why `pwsh`
  remoting is WinRM-based and Windows-oriented. Read the `-ConfigurationName` part — that's how you target JEA.

## Key concepts
- **Config in source, secrets in a vault** — non-secret settings committed; the token fetched **by name** at run time via `Get-Secret`. A literal in source is the failure.
- **`SecureString`-only write path** — a secret-setter that refuses a plaintext `[string]` makes the copilot's `-AsPlainText 'literal'` impossible to slip through.
- **`SecretManagement` is portable** — same script, different `-Vault` name, from local `SecretStore` to Key Vault. `SecretStore` is the cross-platform local vault (works on Linux).
- **JEA = least privilege on the *endpoint*** — a `.psrc` lists the only allowed verbs (no wildcards, no providers, no external commands); a `.pssc` registers it as `RestrictedRemoteServer` under a virtual account.
- **Constrained remoting, not admin shell** — connect with `-ConfigurationName Vigil.ReadOnly`, not a full `Invoke-Command` as admin; a stolen session can run only the hunt verbs.
- **Honesty:** secrets run **live** on Linux; **JEA/WinRM enforcement is Windows-only** — authored and taught here, *enforced* on the optional VM, *assessed-not-demonstrated* in the container.

## AI acceleration

Point the copilot at this module's two jobs and it will hand you both failure classes to catch. Ask it to
"load the feed token and call the API" and it will write the literal or the `-AsPlainText` conversion —
your review move is to demand the secret come from `Get-Secret -Vault … -Name …` and that *nothing* in the
diff is a legible credential (grep your own PR for `token`, `password`, `-AsPlainText`, `Secret =`). Ask it
to "build the JEA role" and the tell is over-exposure: it will reach for `VisibleCmdlets = '*'` or expose a
providers/external-commands surface, or add a state-changing cmdlet "for convenience." Review the `.psrc`
against the Microsoft "dangerous commands" list — is every visible command read-only? are there wildcards?
any provider? Then have it generate the `Pester` tests, but confirm they actually *run the secret
round-trip* and *parse the `.psrc`/`.pssc`* rather than trivially passing. The whole move is the track's
posture: the model drafts the vault call and the role file; you own whether the secret is truly out of
source and the endpoint is truly least-privilege.

!!! question "Check yourself"
    - Why is `ConvertTo-SecureString -AsPlainText 'P@ssw0rd'` *not* a real fix for a hardcoded secret, and
      what does `Get-Secret -Vault … -Name …` give you that it can't?
    - What can a caller do on a `Vigil.ReadOnly` JEA endpoint that they *cannot* do on a normal
      `Invoke-Command -ComputerName … -ScriptBlock { … }` admin session — and why does that shrink the
      blast radius of a stolen credential?
    - The Linux container stores and retrieves a secret for real but cannot *enforce* JEA. In your own
      words, what did the lab actually prove about the `.psrc`/`.pssc`, and what is left to the Windows VM?
