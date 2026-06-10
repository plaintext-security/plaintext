# How Grading & Certificates Work

Plaintext has no paywalled exam and no proctor. Your **portfolio is the credential** — and the
grader's job is to let you (and anyone reviewing you) *check* that portfolio quickly and honestly.
This page walks the path from finishing a lab to holding a track certificate, and is straight with
you about exactly what that certificate proves.

## The flow: grade → receipt → certificate

The runnable labs live in
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs); every reference lab ships
the same one-command loop:

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/<track>/<module>
make up        # start the environment
make demo      # watch the worked example
make grade     # check YOUR work — writes receipt.json on an all-pass
make down      # stop it
```

1. **Do the lab and commit its artifact** — the writeup, exploit, detection rule, parser, or report
   that the lab's "Deliverables" asks for. *That artifact is the real evidence.*
2. **Run `make grade`.** Each lab declares its "Success criteria" as executable checks
   (`grade.yaml`). When they all pass, the grader writes a **`receipt.json`** — the lab id, a
   timestamp, which checks passed, the SHA-256 of your committed artifacts, and a **digest** over all
   of it.
3. **Commit the `receipt.json` to your own portfolio repo**, alongside the artifact. It runs as a
   green check in *your* GitHub Actions and is verifiable by anyone.
4. **Mint a track certificate** once you hold a valid receipt for every module lab *and* the
   capstone in a track:

   ```bash
   python3 scripts/track_certificate.py mint \
       --track 00-foundations --name "Your Name" \
       --receipts ~/portfolio/00-foundations --out certificate.json
   ```

   It refuses to mint if any receipt is edited or has a failing check, then re-digests the bundle.
   `track_certificate.py badge` renders an SVG badge for your portfolio README that turns green only
   when the certificate verifies.

## What the checks actually test

The grader proves the *outcome* you'd otherwise eyeball:

- **flag** — you reached something only completion exposes (compared by hash).
- **structural** — your committed artifact exists and matches (or avoids) the right patterns.
- **artifact_functional** — your "Automate & own it" script actually runs and produces the expected
  result.
- **target_state** — the live lab is in the proven end state (your fix holds, a marker is written).
- **advisory / ai_rubric** — informational only (design and reporting labs that can't be auto-graded
  surface a rubric for self/peer review); these *never* fail your grade.

## Verifying a receipt or certificate

Anyone — you, a peer, a hiring manager — can confirm a credential is unedited:

- **In the browser**, paste it into the [certificate verifier](verify.md) — it runs the same digest
  check locally, nothing is uploaded.
- **From the command line** with the open-source verifier:

  ```bash
  python3 scripts/verify_receipt.py path/to/receipt.json          # one lab
  python3 scripts/track_certificate.py verify certificate.json    # a whole track
  ```

Both recompute the digest the grader stored and report VALID or INVALID.

## The trust model — honest about what this proves

Plaintext is an **open** repository, and that is a deliberate choice with an honest consequence:

> A green **VALID** means a receipt or certificate is **tamper-evident and internally consistent** —
> the checks recorded really were the checks run, and nobody edited the file afterward to fake a pass.
> It does **not** mean grading was proctored.

Because the curriculum and its grader are open source, the answer keys (flag hashes, check
definitions) are visible to anyone willing to read the repo, so a determined person could craft
inputs that pass without doing the work. Treat a Plaintext credential as **self-verification plus
portfolio evidence** — proof you produced the committed artifacts and they pass the same checks a
reviewer can re-run — not as an anti-cheat, proctored certification. Its real value is the work it
points at: the writeups, exploits, detections, and capstones in your repo that a hiring manager can
read and a peer can reproduce. A truly proctored credential would require server-side grading behind
a private key — out of scope for a free, open curriculum, but the receipt format is built so it could
be layered on later.

See the [certificate verifier](verify.md) for the full trust-model write-up and the badge.
