---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Linux Hardening to CIS

*Companion to [Module 03 — Linux Hardening to CIS](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Lynis — fast, readable audit

```bash
sudo lynis audit system                 # full audit; scores a 0-100 hardening index
sudo lynis audit system --quick         # skip the "press enter" pauses
sudo lynis show groups                  # list test groups you can target
sudo lynis audit system --tests-from-group "kernel,ssh"   # scope to groups
sudo lynis show details TEST-ID         # explain one finding (e.g. SSH-7408)
cat /var/log/lynis.log                  # full run log
cat /var/log/lynis-report.dat           # machine-readable results (grep this)
grep 'warning\[\]' /var/log/lynis-report.dat   # just the warnings
```

- Lynis **only reads and reports — it changes nothing**. Its "hardening index" tracks drift over time; it is **not** a CIS percentage.

## OpenSCAP — benchmark-mapped audit + remediation

```bash
# Discover what's installed and which profiles a datastream offers
oscap info /usr/share/xml/scap/ssg/content/ssg-ubuntu2204-ds.xml
# Scan against a CIS profile — ARF results + HTML report
sudo oscap xccdf eval \
  --profile xccdf_org.ssgproject.content_profile_cis_level1_server \
  --results scan-results.xml --report scan-report.html \
  /usr/share/xml/scap/ssg/content/ssg-ubuntu2204-ds.xml
# Generate a remediation SHELL script from the SAME profile (review before running!)
sudo oscap xccdf generate fix \
  --profile xccdf_org.ssgproject.content_profile_cis_level1_server \
  --fix-type bash /usr/share/.../ssg-ubuntu2204-ds.xml > remediate.sh
# Or generate fix from a prior results file (only the rules that failed)
sudo oscap xccdf generate fix --result-id "" --fix-type bash scan-results.xml
```

- SSG content lives in `/usr/share/xml/scap/ssg/content/` (install `scap-security-guide`).
- OpenSCAP's score **is** a CIS percentage — it runs the official XCCDF content. Use it for auditor-facing reports.

## Read a rule / profile

```bash
oscap info --profiles ssg-ubuntu2204-ds.xml    # list profile IDs
oscap xccdf eval --rule <rule_id> ...          # scan just one rule while iterating
# Rule IDs look like: xccdf_org.ssgproject.content_rule_sysctl_kernel_randomize_va_space
```

## Apply the high-value sysctl controls

```bash
sysctl kernel.randomize_va_space               # 2 = full ASLR (CIS + STIG)
sysctl net.ipv4.conf.all.accept_redirects      # want 0 — block ICMP redirect reroute
# Persist in /etc/sysctl.d/99-hardening.conf, then load:
echo 'kernel.randomize_va_space = 2' | sudo tee -a /etc/sysctl.d/99-hardening.conf
sudo sysctl --system                           # reload all sysctl.d files
```

## Package & permission hygiene (CIS categories)

```bash
dpkg -l | grep -Ei 'telnet|rsh|talk'   # legacy cleartext services CIS flags to remove
find / -xdev -type f -perm -0002 2>/dev/null   # world-writable files (a common finding)
find / -xdev -nouser -o -nogroup 2>/dev/null   # unowned files
systemctl list-unit-files --state=enabled      # enabled services = attack surface
```

## Gotchas worth remembering

- **Don't compare the two scores.** Lynis's hardening index and OpenSCAP's CIS percentage test *different control sets* — they are not comparable. Track each against itself over time.
- **Test the benchmark in *audit* before you remediate.** OpenSCAP's `generate fix` produces a real shell script that will change sysctl, disable services, tighten perms — read it, run it in a VM, confirm nothing breaks, *then* apply to prod.
- **Every open finding needs an outcome.** Either remediate it or *accept with a documented justification*. An undocumented open finding is an audit liability; the same finding with a recorded business reason is a managed risk.
- **Defaults score poorly by design.** A fresh Ubuntu/RHEL image optimises for compatibility, not security — a bad first score is expected, not alarming. The signal is the *delta* after remediation.
- **AI translates the jargon; SSG is the authority.** A model reads dense XCCDF/OVAL rule IDs into plain English well, but confirm its explanation against the SCAP Security Guide rationale before you trust it.
- **Match content to the OS.** `ssg-ubuntu2204` ≠ `ssg-rhel9`. Scanning with the wrong datastream produces meaningless results.
