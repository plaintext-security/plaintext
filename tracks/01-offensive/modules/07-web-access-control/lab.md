# Lab 07 — Break Access Control (IDOR + Privilege Escalation)

## Setup

```bash
git clone https://github.com/plaintext-security/plaintext-labs.git
cd plaintext-labs/offensive/07-web-access-control
make up
```

The container runs a minimal Flask app (`app/app.py`) — Meridian Financial's
internal order portal — with two deliberate access-control bugs. No live
network required; the audit script uses Flask's test client.

## Scenario

Meridian's dev team shipped the internal portal quickly and tested it
"visually" — the UI hides the admin button from normal users, so it looks
right. But the server-side checks are broken in two ways. Find them, exploit
them, and state the fix.

> **Authorization note:** Only attack Juice Shop, DVWA, PortSwigger labs,
> or other intentionally vulnerable targets. Never test systems you don't own
> or have explicit written authorisation to test.

## Do

1. [ ] Run the demo to see both vulnerabilities:
   ```bash
   make demo
   ```
   Note which HTTP status codes confirm the exploit.

2. [ ] Read `app/app.py`. Find the two vulnerable functions. For each:
   - Which line is the bug?
   - What trust assumption is wrong?
   - What does the server need to check instead?

3. [ ] Trace the IDOR (Bug 1):
   - `jsmith` is authenticated (owns orders 101, 103). He requests `/api/orders/102`.
   - What should the server check before returning the order?
   - The exploit is just changing `101` → `102` in the URL. Why does it work?

4. [ ] Trace the vertical escalation (Bug 2):
   - `jsmith` hits `/api/admin/users` — gets HTTP 403.
   - Same request, adds `X-Role: admin` header — gets HTTP 200.
   - Why does a client-supplied header have any effect on server-side authorization?

5. [ ] Read the access-control matrix in Step 5. Note: bmartin (user role)
   can also read jsmith's high-value order (id=103, $880k). Why does that cell
   appear in the matrix, and what does it tell you about how to scope an audit?

6. [ ] Fix Bug 1: edit `app/app.py` and add the ownership check. Re-run
   `make demo` and confirm the IDOR returns HTTP 403 now.

7. [ ] Fix Bug 2: remove the `X-Role` header trust. Re-run and confirm the
   escalation returns HTTP 403 with the spoof header.

## Success criteria — you're done when

- [ ] You identified both vulnerable lines in `app/app.py` and can explain the root cause.
- [ ] You exploited IDOR to read another user's financial data (HTTP 200 on order 102).
- [ ] You bypassed the admin check via `X-Role: admin` (HTTP 200 on `/api/admin/users`).
- [ ] You applied both fixes and re-ran `make demo` to confirm both return 403.
- [ ] You can state the two-part principle: server-side enforcement + deny-by-default.

## Deliverables

`access-control.md`: for each bug — the vulnerable code snippet, the exploit
request, the HTTP response that proved it, and the fixed code. Include a
one-line risk statement per bug.

## Automate & own it

**Required.** Write `enumerate.py` that:
- Logs in as each user in a configurable list
- Tests every `GET /api/orders/<id>` from 100–110
- Outputs a table: which IDs each user can access vs. should be allowed to
- AI drafts the script; you review the authorization logic; commit it

## AI acceleration

Ask a model to generate a list of IDOR test IDs and role-escalation headers
to try for this app type. Then check each hypothesis in the running lab — the
model brainstorms, you confirm with real requests. Use a model to annotate
the `app.py` diff between vulnerable and fixed so you can explain each change.

## Connects forward

IDOR and privilege escalation are the top findings in web app pentests and
bug-bounty reports. Module 08 adds server-side request forgery (SSRF) and XXE
— a different attack surface on the same trust-the-server principle.

## Marketable proof

> "I find and exploit broken access control — IDOR and vertical privilege
> escalation — and explain the server-side ownership and deny-by-default fixes
> that close them."

## Stretch

- Build a full role × action matrix for the app: test every endpoint as
  every role (unauthenticated / user / admin). Record expected vs. actual
  status codes — this is how a real access-control audit is done.
- Add a JWT-based authentication variant to `app.py` where the role is encoded
  in the token claim. Demonstrate that tampering with an unsigned JWT bypasses
  the check the same way `X-Role` does.
