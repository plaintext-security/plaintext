# Lab 06 — Secrets in a Vault, Remoting on a Constrained Endpoint

*[← Back to the module concept](README.md)*

## Setup

This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo at
`plaintext-labs/powershell-for-security/06-secrets-remoting-jea/`: a PowerShell 7 container
(`mcr.microsoft.com/powershell`) with `PSScriptAnalyzer`, `Pester`,
`Microsoft.PowerShell.SecretManagement`, and `Microsoft.PowerShell.SecretStore` preinstalled (all
pinned), plus the cumulative `Vigil` module with this module's additions and the `Vigil.ReadOnly` JEA
files.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/powershell-for-security/06-secrets-remoting-jea
make up      # build the pwsh + secrets + toolchain container
make shell   # drop into pwsh with Vigil loaded
make demo    # gate: PSScriptAnalyzer + Pester (LIVE secret round-trip + JEA .psrc/.pssc shape)
make down    # stop when done
```

The lab **builds on a shipped `SecretStore` vault** (cross-platform, runs live in the container) and
**ships authored JEA files** you validate in the container and enforce on an optional Windows VM.

> **Honest platform scope.** `SecretManagement` + `SecretStore` are cross-platform — you demonstrate the
> secret flow **live on Linux**. **JEA enforcement and PowerShell Remoting over WinRM are Windows-only** —
> the container validates that your `.psrc`/`.pssc` are well-formed and read-only, but it cannot *enforce*
> them. Registering the endpoint and proving a non-admin session is *denied* everything but the hunt verbs
> is the **optional Windows-VM step** below; it is *assessed-not-demonstrated* on Linux.

## Scenario

`Vigil` now enriches indicators against a threat feed (Module 04) and reads telemetry from Windows hosts
(Module 03) — which means it needs a **credential** for the feed and a way to **reach remote hosts**. The
copilot's instinct is to paste the token into the script and open an admin `Invoke-Command`. You're going
to do neither: put the secret in a vault and fetch it by name, and reach the remote host through a
**constrained** `Vigil.ReadOnly` JEA endpoint that can run only the read-only hunt verbs.

> Only test systems you own or have explicit written permission to test. The secret flow runs entirely in
> the local lab container against a throwaway vault; the optional remoting step targets a Windows VM **you**
> own. Never register a JEA endpoint or store real secrets on a machine you aren't authorized to change.

## Do

1. [ ] **Find the plaintext secret and kill it.** In a scratch script, write the copilot's version first —
   `$token = 'abc123'` (or `ConvertTo-SecureString -AsPlainText 'abc123'`) feeding the feed call. This is
   the anti-pattern you're removing; keep it only long enough to see why it's committed-and-published the
   moment it lands in git.
2. [ ] **Stand up the vault, store the secret.** Register a `SecretStore` vault
   (`Register-SecretVault … -ModuleName Microsoft.PowerShell.SecretStore`), then store the token as a
   **`SecureString`** with `Set-Secret` (or `Vigil`'s `Set-VigilSecret`, which *only* accepts a
   `SecureString` so a literal can't slip through). Retrieve it with `Get-Secret -Name … -Vault …`. The
   secret now lives in the vault, not the file.
3. [ ] **Split config from secret.** Give `Vigil` a committed `vigil.config.json` holding only *non-secret*
   settings (vault name, secret name, feed URL, remote host). Wire `Get-VigilConfig` to load that file and
   resolve the token **lazily** via `Get-Secret` — so the config object carries no credential material
   until you actually call for it. Grep your own working tree: no `token`, `password`, or `-AsPlainText`
   literal should appear anywhere.
4. [ ] **Make the store non-interactive (honestly).** For the container's automated `make demo`, configure
   the store so the first `Set-Secret` doesn't prompt (`Reset-SecretStore -Authentication None -Interaction
   None` for a throwaway test store, **or** the password-via-`Import-CliXml` pattern from the automation
   docs for a real one). Write down which you chose and why the passwordless option is *only* acceptable for
   a disposable test vault.
5. [ ] **Author the JEA role capability (`.psrc`).** Create `Vigil.ReadOnly.psrc` that exposes **only** the
   read-only hunt verbs (`VisibleFunctions = @('Get-VigilEvent')`) plus a tiny safe read-only cmdlet set —
   **no** wildcards, **no** `VisibleProviders`, **no** `VisibleExternalCommands`, **no** state-changing
   cmdlets. Check it against Microsoft's "dangerous commands" list: nothing on the panel should be able to
   elevate, write, or run arbitrary code.
6. [ ] **Author the session configuration (`.pssc`).** Create `Vigil.ReadOnly.pssc` as
   `SessionType = 'RestrictedRemoteServer'` (NoLanguage), `RunAsVirtualAccount = $true`, and a
   `RoleDefinitions` map that grants a group the `Vigil.ReadOnly` role. On Linux, validate the file's shape
   with `Import-PowerShellDataFile` and the lab's `Pester` assertions; on Windows, add
   `Test-PSSessionConfigurationFile` (it must return `True`).
7. [ ] **Build `Invoke-VigilRemote` against the constrained endpoint.** It connects with
   `New-PSSession -ConfigurationName 'Vigil.ReadOnly'`, invokes a **whitelisted** verb (not an arbitrary
   command string — no `Invoke-Expression`), and pulls its credential from the vault. Have it fail loudly on
   a non-Windows host with a pointer to the VM step, so nobody thinks the Linux container enforced JEA.
8. [ ] **Run the gate.** `make demo` must pass on Linux: `PSScriptAnalyzer` clean, the **live** secret
   round-trip green, and the `.psrc`/`.pssc` parsed and asserted read-only. The only thing it *can't* do is
   enforce JEA — which is the next step.
9. [ ] **(Optional Windows VM) Enforce it.** On a Windows host you own, register the endpoint
   (`Register-PSSessionConfiguration -Name 'Vigil.ReadOnly' -Path .\Vigil.ReadOnly.pssc`), connect with a
   **non-admin** account, and prove the constraint: `Get-VigilEvent` works; `Get-Content`, `Set-Service`,
   or an arbitrary scriptblock is **denied**. This is the *assessed-not-demonstrated* piece made real.
10. [ ] **Automate & own it.** Commit the SecretStore-backed config, `Invoke-VigilRemote`, the
    `Vigil.ReadOnly.psrc`/`.pssc`, and the `Pester` tests. In the PR, note what the copilot generated, what
    you corrected (the plaintext secret? the wildcard `VisibleCmdlets`? the admin `Invoke-Command`?), and
    the one default you had to fix.

## Success criteria — you're done when
- [ ] No plaintext secret exists anywhere in the tree — the token is stored in and fetched from the vault by name; `Get-VigilConfig` resolves it lazily and the write path refuses a plaintext string.
- [ ] `make demo` is green on Linux: `PSScriptAnalyzer` clean, the **live** `Set`/`Get` secret round-trip passes, and the `.psrc`/`.pssc` parse and assert read-only (no wildcards, no providers, virtual account, `RestrictedRemoteServer`).
- [ ] `Vigil.ReadOnly.psrc` exposes only read-only hunt verbs; `Vigil.ReadOnly.pssc` is a `RestrictedRemoteServer` running under a virtual account, mapping a group to the role.
- [ ] `Invoke-VigilRemote` targets the `Vigil.ReadOnly` endpoint (not a full admin session), whitelists the verb, and fails clearly off-Windows.
- [ ] *(If you did the VM step)* a non-admin session on the registered endpoint runs `Get-VigilEvent` and is **denied** a state-changing or arbitrary command — you saw the constraint enforced.

## Deliverables
The cumulative `Vigil` with this module's additions: `Get-VigilConfig` + `Set-VigilSecret`, the committed
`vigil.config.json` (non-secret only), `Invoke-VigilRemote`, `Vigil.ReadOnly.psrc`, `Vigil.ReadOnly.pssc`,
and the `Pester` tests (live secret round-trip + JEA file shape). Commit all of it. Do **not** commit any
real secret, any vault file, any `.env`, or the `SecretStore` data — only the *non-secret* config and the
capability files.

## AI acceleration
Have the copilot draft the vault call and the JEA files, then review for the two failure classes this
module exists to catch. Secrets: the tell is a legible credential — a literal, an `-AsPlainText 'literal'`,
a `PSCredential` built from a hardcoded password; hold the diff to "the secret comes from `Get-Secret` by
name, nothing legible in source." JEA: the tell is over-exposure — `VisibleCmdlets = '*'`, an exposed
provider or external command, a state-changing cmdlet "for convenience"; hold the `.psrc` to the read-only
verbs and check it against the Microsoft dangerous-commands list. The model will also cheerfully write
`Invoke-Command -ComputerName … -ScriptBlock { … }` as admin — insist on `-ConfigurationName Vigil.ReadOnly`.

## Connects forward
The vault-backed config feeds every later module that needs a credential (Module 07's MCP surface, Module
09's supply-chain gate). The constrained-endpoint discipline is the Windows-native cousin of Track 11
(ZTNA): least privilege enforced at the boundary, not promised in the code. Module 08 will *attack*
PowerShell itself — and a `Vigil.ReadOnly` endpoint is one of the controls that blunts the attack.

## Marketable proof
> "I keep credentials out of PowerShell source with `SecretManagement`/`SecretStore` and expose tooling
> over a constrained **JEA** endpoint that runs only read-only verbs — least privilege enforced at the
> remoting boundary, not hoped for in the script."

## Stretch (optional)
- Swap the `SecretStore` vault for **Azure Key Vault** (register the `Az.KeyVault` extension) and prove the
  same `Vigil` code works by changing only the `-Vault` name — the portability the abstraction promises.
- On the VM, turn on **session transcripts** in the `.pssc` (`TranscriptDirectory`) and show that every
  command a connecting analyst ran is recorded — the audit half of JEA that pairs with the constraint.
