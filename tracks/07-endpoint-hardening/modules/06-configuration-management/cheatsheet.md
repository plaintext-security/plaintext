# Cheat sheet — Configuration Management with Ansible

*Companion to [Module 06 — Configuration Management](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Running playbooks

```bash
ansible-playbook site.yml -i inventory        # apply a playbook against an inventory
ansible-playbook site.yml -i inventory --check --diff   # dry-run + show line-level changes — do this first
ansible-playbook site.yml -i inventory --syntax-check   # parse only, no execution
ansible-playbook site.yml -i inventory --list-tasks     # what would run, in order
ansible-playbook site.yml -i inventory --limit web01     # only this host/group
ansible-playbook site.yml -i inventory --tags harden     # only tasks tagged 'harden'
ansible-playbook site.yml -i inventory --skip-tags slow
ansible-playbook site.yml -i inventory -e "ssh_port=2222"  # override a variable
ansible-playbook site.yml -i inventory -v                 # verbose (-vvv for connection debug)
```

- `--check --diff` is the whole game: it tells you *what* would change before anything does.

## Ad-hoc commands (one-off, no playbook)

```bash
ansible all -i inventory -m ping              # connectivity + Python check
ansible all -i inventory -m setup             # dump host facts (ansible_* variables)
ansible web -i inventory -m shell -a "uptime" # run a command on the 'web' group
ansible all -i inventory -m service -a "name=auditd state=started" --become
ansible all -i inventory -m command -a "id" --become  # command = no shell parsing
```

## Inventory & connectivity

```ini
# inventory (INI form)
[web]
web01 ansible_host=10.0.0.11

[web:vars]
ansible_user=deploy
ansible_become=true
```

```bash
ansible-inventory -i inventory --list         # resolve and print the full inventory
ansible all -i inventory -m ping --limit web  # verify SSH + become before you run for real
```

## A minimal playbook

```yaml
- name: Harden SSH
  hosts: web
  become: true                     # escalate to root for the whole play
  tasks:
    - name: Disable root SSH login
      ansible.builtin.lineinfile:
        path: /etc/ssh/sshd_config
        regexp: '^#?PermitRootLogin'
        line: 'PermitRootLogin no'
      notify: Restart sshd         # fire the handler only if this task changes

  handlers:
    - name: Restart sshd
      ansible.builtin.service:
        name: sshd
        state: restarted
```

## Roles — the unit of reuse

```bash
ansible-galaxy init roles/security      # scaffold a role directory tree
ansible-galaxy role install geerlingguy.security  # pull a community role
```

```text
roles/security/
├── tasks/main.yml        # task list (entry point)   ├── handlers/main.yml  # restart/reload
├── defaults/main.yml     # default vars (override me)  ├── templates/  # Jinja2 (.j2)
└── vars/main.yml         # high-priority vars          └── files/      # static copies
```

## ansible-vault — encrypt secrets in-repo

```bash
ansible-vault create secrets.yml              # new encrypted file
ansible-vault edit secrets.yml                # decrypt-edit-reencrypt in place
ansible-vault view secrets.yml                # read without editing
ansible-vault encrypt existing.yml            # encrypt a plaintext file
ansible-vault decrypt secrets.yml             # back to plaintext (careful!)
ansible-vault rekey secrets.yml               # change the vault password
ansible-vault encrypt_string 's3cr3t' --name db_pass  # one encrypted var to paste inline

ansible-playbook site.yml --ask-vault-pass                    # prompt for password
ansible-playbook site.yml --vault-password-file ~/.vault_pass # non-interactive (CI)
```

## Idempotency & check mode

```bash
ansible-playbook site.yml -i inventory              # first run: some tasks 'changed'
ansible-playbook site.yml -i inventory              # second run: MUST be all 'ok' (idempotent)
ansible-playbook site.yml -i inventory --check      # drift detector: 'changed' here = someone drifted
```

- A `shell`/`command` task needs `creates:`, `removes:`, or `changed_when:` or it reports `changed` every run.

## Gotchas worth remembering

- **`--check --diff` is your safety net** — always dry-run against prod before applying. The diff shows the exact lines that would move; read it, don't just watch for green.
- **Check mode lies when tasks chain.** A task that reads a `register`ed variable from an earlier task gets nothing in `--check` if that earlier task was skipped — so a clean `--check` isn't proof the real run succeeds.
- **Idempotency is a property you must prove.** Run the playbook twice — the second run must report **zero** changes. `shell`/`command` are *not* idempotent unless you add `creates:` or `changed_when:`; a task that reports `changed` every run makes your `--check` drift detector cry wolf.
- **Never commit an unencrypted vault or the vault password file.** Add `--vault-password-file` targets and any decrypted secret to `.gitignore`; the whole point of `ansible-vault` is that the *encrypted* blob is safe in git and the key is not.
- **Handlers only fire on change and run at the *end* of the play** — batched, once, in notify order. If a later task depends on the restart, force it early with `- meta: flush_handlers`.
- **`become` escalates privilege** — set it at the play or group level rather than per-task so it's visible and consistent, and only where root is actually needed.
