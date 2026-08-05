## 1. Spike & de-risk (gate the rest of the change)

- [x] 1.1 Confirm a stable, pinnable floci image tag and record its license; verify it is compatible with CC BY 4.0 redistribution. → `floci/floci:1.5.34`, **MIT** (compatible).
- [x] 1.2 Stand up floci locally on `localhost:4566` and confirm the AWS CLI/boto3 reach it via `AWS_ENDPOINT_URL`. → starts ~0.02s, `/_localstack/health` identical to LocalStack.
- [x] 1.3 Validate the riskiest APIs and record pass/fail + fallback per lab: KMS `generate-data-key`/encrypt/decrypt (17)✅, IAM `simulate-principal-policy` (02)✅ real eval, Docker-backed Lambda (09)⚠️ invoke needs docker.sock mount, prowler STS (05)✅ (patch is prowler-side).
- [x] 1.4 Write a short spike findings note (which labs are floci-primary, which become real-AWS-first) and confirm the per-lab taxonomy from design D5. → `spike-findings.md`.

## 2. Establish the dual-route template (on 17-data-protection-kms)

- [x] 2.1 Replace `localstack/localstack` with the pinned floci image in `17`'s `docker-compose.yml`, keeping port `4566` and fixing the health check for floci. → `floci/floci:1.5.34`; health path `/_localstack/health` unchanged (floci ships curl).
- [x] 2.2 Add `AWS_ENDPOINT_URL=http://localhost:4566` as the floci default; replace `awslocal` with an `aws --endpoint-url`/`AWS_ENDPOINT_URL`-based invocation in `setup.sh` and the demo. → `awslocal`→`aws` in setup.sh/envelope.sh/lab.md; `awscli-local` dropped from Dockerfile.
- [x] 2.3 Add a `make up-aws` target that runs the same lab with `AWS_ENDPOINT_URL` unset against real credentials; keep `make up` = floci. → compose profiles `local`/`aws`; Makefile `AWS=1` toggle + `up-aws` with cred guard.
- [x] 2.4 Verify `make up && make demo && make down` is green on floci, and the `make up-aws` route is documented with authorization + cost + teardown notes. → demo green: envelope roundtrip + policy FAIL→PASS; symlink resolves.
- [x] 2.5 Refresh the KMS honesty note to point at the real-AWS route for true key-policy/IAM enforcement.

## 3. Roll the uniform floci-only pattern across the emulator labs

> **Scope revised:** floci-only swap (no `make up-aws` route this pass; see design D1). Uniform pattern:
> `localstack`→`floci/floci:1.5.34`, `LOCALSTACK_HOST`→`AWS_ENDPOINT_URL=http://floci:4566`, drop
> `SERVICES=`, drop `awscli-local`, `awslocal`→`aws`, keep the `/_localstack/health` check.

- [x] 3.0 Simplify `17-data-protection-kms` and `01-cloud-fundamentals` back from the dual-route build to the uniform floci-only pattern (drop `up-aws`/`seed-aws`/profiles); re-verify demo green.
- [x] 3.1 Apply the pattern to `01-cloud-fundamentals`, verify demo green on floci. → demo green (IAM/S3/EC2 enumeration walkthrough); awscli v2 also honors AWS_ENDPOINT_URL.
- [x] 3.2 Apply to `02-cloud-identity-iam`; keep the logical policy-evaluation path (floci `simulate-principal-policy` verified working in the spike); verify demo green. → demo green on floci (seed + enumeration + escalation FAIL→PASS); cloudfox endpoint→floci, profile→local; also made awscli arch-aware (fixed latent arm64 x86_64-only bug).
- [x] 3.3 Apply to `03-iam-attack-paths` (cloudfox/pmapper enumeration against floci IAM); verify demo green. → demo green on floci (seed + analyze.py finds 2-hop privesc path; fixed graph clean); awscli made arch-aware.
- [x] 3.4 Apply to `07-secrets-management` (Secrets Manager variant only; leave Vault/Postgres services untouched); verify demo green. → `make aws-secrets` green on floci (secret store/read + least-privilege policy); vault+db+floci all healthy; awscli v1 (arch-independent).
- [x] 3.5 Apply to `09-serverless-security`; keep the `/var/run/docker.sock` mount so floci Docker-backed Lambda `invoke` works; verify demo green. → VERIFIED on floci: normal invoke executes the function (200), the **event-injection exploit runs** (`ls /var/task` → real output), env-var leak exposed. floci genuinely runs Lambda via the socket mount.

## 4. Resolve the remaining emulator labs (floci-only)

- [x] 4.1 `05-posture-auditing`: port/replace the `patch-prowler-localstack.py` STS patch for floci (STS verified working), run the prowler scan on floci, keep the `.ci-skip` if still over CI budget, and add an honesty note that real posture depth wants a real account. → VERIFIED: prowler scan green on floci — 18 HIGH/CRITICAL findings incl. Critical `s3_bucket_public_access` on the seeded bucket. Patch renamed `patch-prowler-endpoint.py` (endpoint-generic). Fixed a health-wait bug (floci's compact JSON `"s3":"running"` vs LocalStack's spaced form). `.ci-skip` reworded (kept: real posture depth = real-AWS route).
- [x] 4.2 `14-cloud-attack-techniques`: point Stratus detonation at floci; keep the detection half on shipped sample CloudTrail (GuardDuty/CloudTrail delivery not emulated) with an honesty note. → VERIFIED: all 3 ATT&CK techniques detonate on floci (AssumeRole/GetObject/exfil) + emit synthetic CloudTrail; added the "where the emulator stops" note; awscli made arch-aware.
- [x] 4.3 Capstone: confirm the attack→detect→respond loop still stands on floci + shipped sample events; align with the migrated labs; note where real-AWS fidelity would be needed. → No change needed: capstone uses real CloudGoat/flaws.cloud + free-tier (no emulator); already the real-AWS fidelity route.
- [x] 4.4 Add honesty notes wherever floci can't carry a lesson (posture depth, GuardDuty/CloudTrail detection), pointing at real AWS as the future fidelity route. → Done: 05 (.ci-skip + prose on posture depth), 14 (synthetic CloudTrail / GuardDuty note); others already state the emulator's IAM-enforcement limit.

## 5. Remove LocalStack & confirm parity

- [x] 5.1 Grep all 8 lab dirs for `localstack`/`awslocal`; confirm no `localstack/localstack` image, LocalStack health path, or `awslocal` command remains (or record a justified exception). → All 8 pinned to `floci/floci:1.5.34`; no `awslocal`/`awscli-local`/`LOCALSTACK_HOST` left; only intentional keeps are the `/_localstack/health` path (floci's real endpoint) and prose sunset notes.
- [x] 5.2 Confirm each migrated lab's default `make up` is fully offline/zero-cost and each `make up-aws` never bakes in or commits real credentials. → Only dummy creds (`test`/`AKIAIOSFODNN7EXAMPLE`) present; no real secrets; floci route is offline/zero-cost. (No `up-aws` built this pass — deferred per D1.)

## 6. Prose & sync

- [x] 6.1 De-LocalStack the 3 module READMEs that name it (`02`, `14`, `17`); reflect floci + the real-AWS route. → Done: `02` (emulator), `14` (local-endpoint), `17` (floci emulator).
- [x] 6.2 Add the LocalStack-sunset teachable note and the floci-default / real-AWS-option framing to `tracks/05-cloud/README.md`. → Added a "Local AWS emulator — floci, not LocalStack" blockquote (sunset lesson + `AWS_ENDPOINT_URL` real-AWS path + enforcement caveat).
- [x] 6.3 Confirm the symlinked `lab.md` files reflect the `plaintext-labs` edits and that `tracks/` and `plaintext-labs` copies are in sync. → Confirmed: `tracks/05-cloud/.../17/lab.md` (symlink) shows the floci edits.
- [x] 6.4 Run `mkdocs build --strict` and confirm it passes (no broken links / orphan pages). → Green (built in 8.7s; only the generic Material 2.0 notice, unrelated).

## 7. CI & validation

- [x] 7.1 For each lab verified green on a Linux runner (`make up && make demo && make down`), set/refresh `.ci-demo`; leave real-AWS-first or slow labs `.ci-skip` with a recorded reason. → Markers intact: 7 labs `.ci-demo` (01,02,03,07,09,14,17 — all validated green on floci locally, arm64), `05` `.ci-skip` (reworded). NOTE: local validation was on arm64; the Linux/amd64 CI re-runs `make demo` on next push to confirm.
- [x] 7.2 Final pass: every migrated lab either runs green on floci by default or is explicitly real-AWS-first with an honesty note; coverage fallbacks are all documented. → All 8 migrated: 01/02/03/07/09/14/17 verified green on floci; 05 verified green (prowler, `.ci-skip` for budget); honesty notes added where the emulator can't enforce/deliver. Also fixed latent arm64 x86_64-only awscli bugs in 02/03/14 and a health-wait bug in 05.
