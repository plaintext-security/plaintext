---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Configuration Management (Ansible)

*Companion to [Module 04 — Configuration Management & Drift](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Run a playbook

```bash
ansible-playbook site.yml                       # apply against the inventory
ansible-playbook site.yml -i inventory.ini      # explicit inventory
ansible-playbook site.yml --check --diff        # DRY RUN: report changes, don't make them (the detector)
ansible-playbook site.yml --diff                # apply AND show line-level changes (the reconcile)
ansible-playbook site.yml --limit web01         # target one host / group
ansible-playbook site.yml --tags hardening      # run only tagged tasks (also --skip-tags)
ansible-playbook site.yml --syntax-check        # parse only, no connection
```

**The drift loop is one playbook, two modes:** `--check --diff` detects drift (reports what's wrong),
then a plain run reconciles it (converges the host back to baseline). A well-written role reports
`changed=0` on an already-compliant host — that's idempotency.

## Ad-hoc + connectivity

```bash
ansible all -m ping                             # reachability over SSH
ansible all -m setup                            # dump host facts (ansible_facts)
ansible web -m command -a 'uptime'              # one-off command on a group
ansible-inventory --list -i inventory.ini       # resolve inventory/groups
```

## Ansible Vault — encrypt secrets at rest

```bash
ansible-vault create secrets.yml                # new encrypted file
ansible-vault edit secrets.yml                  # edit in place
ansible-vault encrypt vars/prod.yml             # encrypt an existing plaintext file
ansible-vault view secrets.yml                  # read without decrypting to disk
ansible-playbook site.yml --ask-vault-pass      # prompt for the vault password
ansible-playbook site.yml --vault-password-file .vault-pass   # or read it from a file (gitignore it)
```

## Roles — reusable, idempotent units

```bash
ansible-galaxy init roles/hardening             # scaffold tasks/ handlers/ defaults/ templates/
ansible-galaxy install -r requirements.yml      # pull external roles/collections
```

```yaml
# an idempotent task — declares desired STATE, not a command to run every time
- name: Disable root SSH login
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PermitRootLogin'
    line: 'PermitRootLogin no'
  notify: restart sshd            # handler fires ONLY if this task changed something
```

## Gotchas worth remembering

- **Idempotency is the whole point — declare state, don't run commands.** `lineinfile`/`copy`/`template`
  converge to a target and report `changed` only when they act. Reaching for the `command`/`shell`
  module makes a task run every time and report `changed` every time — that's a script, not config
  management, and it hides real drift in the noise.
- **`--check --diff` is a dry run, not a guarantee.** `command`/`shell` tasks are skipped in check mode
  (Ansible can't know their effect), so a playbook that leans on them will under-report drift. Use
  `changed_when`/`check_mode` to make them honest, or prefer declarative modules.
- **Vault-encrypt secrets; never commit a plaintext var file.** And keep the `--vault-password-file`
  out of git — encrypting the data but committing the key defeats the purpose.
- **Handlers run once, at the end, only if notified.** Restarting sshd on every run causes needless
  churn; `notify` + a handler restarts it *only* when the config actually changed.
- **Drift, not attack, is the usual way controls fail.** The deliverable is the loop —
  t=0 clean → t=30 drifted → reconcile → clean again — not a playbook that ran green once.
- **Pin roles and collections** in `requirements.yml` with explicit versions — an unpinned Galaxy
  role can change behaviour under you on the next install.
