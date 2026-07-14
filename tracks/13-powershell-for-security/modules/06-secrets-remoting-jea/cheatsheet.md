---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Secrets, Remoting & Least Privilege

*Companion to [Module 06 — Secrets, Remoting & Least Privilege](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## SecretManagement + SecretStore — register a vault, store & fetch by name

```powershell
Install-PSResource Microsoft.PowerShell.SecretManagement -Version 1.1.2 -TrustRepository   # once
Install-PSResource Microsoft.PowerShell.SecretStore      -Version 1.0.6 -TrustRepository   # once

Register-SecretVault -Name 'VigilStore' `                 # a friendly name; -DefaultVault optional
    -ModuleName Microsoft.PowerShell.SecretStore -DefaultVault
Get-SecretVault                                            # list registered vaults
```

Store a secret as a **SecureString** (never a plaintext literal), then read it back:

```powershell
$s = Read-Host -AsSecureString 'Feed API token'           # prompt - not a hardcoded string
Set-Secret -Name 'vigil-feed-token' -SecureStringSecret $s -Vault 'VigilStore'

Get-Secret     -Name 'vigil-feed-token' -Vault 'VigilStore'              # -> SecureString
Get-Secret     -Name 'vigil-feed-token' -Vault 'VigilStore' -AsPlainText # plaintext ONLY at use
Get-SecretInfo -Vault 'VigilStore'                                       # names/types, no values
```

**The anti-pattern (what the copilot writes — never commit this):**

```powershell
$token = 'sk-abc123'                                        # plaintext in source == published
$sec = ConvertTo-SecureString -AsPlainText 'P@ssw0rd' -Force # SecureString in name only
```

## SecretStore config — interactive vs automation

```powershell
Get-SecretStoreConfiguration
# Interactive default: prompts for a vault password on first use.

# Automation, REAL secrets (password from an encrypted file / CI secret, no prompt):
$pw = Import-CliXml -Path ./passwd.xml                      # SecureString exported earlier
Set-SecretStoreConfiguration -Authentication Password -Interaction None -Password $pw -Confirm:$false
Unlock-SecretStore -Password $pw                            # unlock for this session (honors -PasswordTimeout)

# Throwaway TEST store only (never for real secrets): no password, no prompt.
Reset-SecretStore -Authentication None -Interaction None -Force -Confirm:$false
```

## Config in source, secret in the vault (the split)

```json
// vigil.config.json  -- committed; NON-SECRET only
{ "Vault": "VigilStore", "SecretName": "vigil-feed-token",
  "FeedUrl": "https://urlhaus.abuse.ch/downloads/json_recent/", "RemoteHost": "DC01" }
```

```powershell
$cfg = Get-VigilConfig -Path ./data/vigil.config.json      # loads non-secret settings
$cfg.GetToken()                                            # resolves the secret LAZILY, at use
Invoke-RestMethod -Uri $cfg.FeedUrl -Headers @{ Authorization = $cfg.GetToken() }
```

## JEA role capability — `.psrc` (what a connecting user may run)

```powershell
New-PSRoleCapabilityFile -Path ./Vigil.ReadOnly.psrc        # generate a blank template, then edit
```

```powershell
@{
    GUID             = 'a7f3c2d1-4b8e-4c6a-9d2f-1e0b3a5c7d90'
    Description      = 'Read-only Vigil hunt role.'
    VisibleFunctions = @('Get-VigilEvent')                 # the ONLY hunt verbs exposed
    VisibleCmdlets   = @('Get-Command', 'Get-Help',        # tiny safe read-only set - NO wildcards
                         @{ Name = 'Select-Object' }, @{ Name = 'Where-Object' })
    VisibleProviders        = @()                          # no filesystem / registry
    VisibleExternalCommands = @()                          # no executables
    ModulesToImport  = @('Vigil')                          # so the proxied verb resolves
}
```

Restrict a cmdlet's parameters/values when the whole cmdlet is too broad:

```powershell
VisibleCmdlets = @{ Name = 'Restart-Service'; Parameters = @{ Name = 'Name'; ValidateSet = @('Dns') } }
```

**Never expose:** wildcards (`'*'`), providers, external commands, or state-changers
(`Invoke-Expression`, `Start-Process`, `Add-LocalGroupMember`, `New-Service`, `Invoke-Command`).

## JEA session configuration — `.pssc` (who connects, as what)

```powershell
New-PSSessionConfigurationFile -SessionType RestrictedRemoteServer -Path ./Vigil.ReadOnly.pssc
```

```powershell
@{
    SchemaVersion       = '2.0.0.0'
    GUID                = 'f0e1d2c3-b4a5-4968-8776-5a4b3c2d1e0f'
    SessionType         = 'RestrictedRemoteServer'          # NoLanguage + tiny default command set
    RunAsVirtualAccount = $true                             # non-admin connect, temp privileged run-as
    TranscriptDirectory = 'C:\ProgramData\Vigil\Transcripts'
    RoleDefinitions     = @{ 'BUILTIN\Remote Management Users' = @{ RoleCapabilities = 'Vigil.ReadOnly' } }
}
```

```powershell
Test-PSSessionConfigurationFile -Path ./Vigil.ReadOnly.pssc # validate syntax (Windows) -> True
Import-PowerShellDataFile        -Path ./Vigil.ReadOnly.psrc # cross-platform shape check (Linux ok)
```

## Register & use the endpoint (Windows-only — WinRM/JEA)

```powershell
# Register (admin, on the Windows host):
Register-PSSessionConfiguration -Name 'Vigil.ReadOnly' -Path ./Vigil.ReadOnly.pssc -Force
Get-PSSessionConfiguration -Name 'Vigil.ReadOnly'

# Connect through the CONSTRAINED endpoint - not a full admin session:
$cred = Get-Secret -Name 'vigil-remote-cred' -Vault 'VigilStore'          # credential from the vault
$s = New-PSSession -ComputerName 'DC01' -ConfigurationName 'Vigil.ReadOnly' -Credential $cred
Invoke-Command -Session $s -ScriptBlock { Get-VigilEvent }                # works
Invoke-Command -Session $s -ScriptBlock { Set-Service … }                 # DENIED by the role
Remove-PSSession $s
```

**The anti-pattern:** `Invoke-Command -ComputerName DC01 -Credential $admin -ScriptBlock { … }` — a full,
unconstrained admin shell to run one read-only command.

## Platform honesty

```text
SecretManagement / SecretStore  -> cross-platform; runs LIVE on Linux (make demo)
WinRM remoting + JEA ENFORCEMENT -> Windows-only; author + validate shape on Linux,
                                    ENFORCE on the optional Windows VM (assessed-not-demonstrated)
Secret* modules                  -> feature-complete/archived; still the standard, PIN the versions
```
