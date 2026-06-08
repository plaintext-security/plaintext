# Lab 07 — Break Access Control (IDOR)

## Setup
Docker-first — OWASP Juice Shop (or DVWA):
```bash
docker run --rm -d -p 3000:3000 bkimminich/juice-shop
```
(Or the PortSwigger access-control labs in the browser.)

## Scenario
Find a place where the app trusts a client-supplied identifier or role, and access something
that isn't yours.

> Only attack Juice Shop / DVWA / PortSwigger labs / targets you own.

## Do
1. [ ] Log in as a normal user and find a request that references an object by ID (an order, a
   profile, a document).
2. [ ] Change the ID to one belonging to another user — does the server check *who's asking*?
   (That's IDOR.)
3. [ ] Find an action or page that should require higher privilege and try to reach it
   directly.
4. [ ] State the root cause and the server-side fix.

## Success criteria — you're done when
- [ ] You accessed another user's data or a privileged function you shouldn't reach.
- [ ] You can explain why the server allowed it (missing server-side authorization).
- [ ] You can state the fix: enforce access control server-side, deny by default.

## Deliverables
`access-control.md`: the vulnerable request, the change that worked, what you accessed
(redacted), and the fix.

## AI acceleration
Have a model help enumerate which roles/objects to test — but you walk every action as every
role; that discipline is the actual skill.

## Connects forward
With injection (06) and these access-control flaws, you've covered the bulk of real-world web
findings; module 08 adds the server-side classes.

## Marketable proof
> "I find and exploit broken access control and IDOR — the OWASP #1 risk — and explain the
> server-side authorization fix."

## Automate & own it
**Required.** Script the role × object enumeration to test IDOR systematically across IDs; AI
drafts it, you review; commit the script and the access-control matrix.

## Stretch
- Build a role × action matrix for the app and test every cell — the way a real access-control
  audit is done.
