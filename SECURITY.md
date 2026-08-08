# Security

The `Security` workflow (`.github/workflows/security.yml`) runs on every pull
request and push to `main` / `release`, and weekly on a schedule so that new
advisories are caught against code that has not changed.

**This repository is public.** Anything merged here is world-readable the moment
it lands, and it stays readable through forks and clones after any cleanup. A
secret that reaches `main` is compromised, not "about to be" compromised.

## What blocks a pull request

| Check | Tool | Threshold |
| --- | --- | --- |
| Secrets in tracked files | Gitleaks | any finding |
| Secrets added by the pull request | Gitleaks (`base..head`) | any finding |
| SAST | CodeQL (`security-extended`) | security-severity >= 7.0 |
| Runtime dependencies | `npm audit --omit=dev` | high / critical |

## What is reported but does not block

These are deliberately non-blocking. Each one is either unfixable by the author
of a pull request or does not reach a user, and a required check that nobody can
turn green is a check people learn to ignore.

- **Secrets in git history.** A committed secret is fixed by rotating the
  credential, not by editing a past commit. See *Credential rotation* below.
- **Build-tooling advisories** (`vite`, `rollup`, `esbuild`, `eslint`,
  `playwright`, …). They never reach a browser, and several have no fixed
  release, so gating on them would produce a permanently red required check.
  They are still printed in the run summary so the debt stays visible.

## Which keys are secret here

The frontend legitimately embeds public keys in the bundle, so the scanner is
configured to tell them apart rather than flag every key-shaped string:

- `phc_…` — PostHog **project** key. Designed to ship to browsers. Not a secret,
  and deliberately not matched by `.gitleaks.toml`.
- `phx_…` — PostHog **personal** API key. Full API access. Secret; blocks.
- Mercado Pago **public key** — used by the Brick SDK in the browser. Fine.
- Mercado Pago **access token** (`APP_USR-…` / `TEST-…`) — a server credential.
  It must never appear in this repository; checkout obtains what it needs from
  the backend at runtime. Blocks.

Test fixtures are not an exception. The Mercado Pago sandbox card numbers used
by the smoke tests are public documentation values; real credentials for the
smoke-test accounts live in GitHub Actions secrets and are referenced as
`${{ secrets.* }}`, never inlined.

## Handling a false positive

Never delete a check to make it pass, and never widen a threshold repository-wide
to silence one finding.

**Gitleaks.** Add a narrowly scoped entry to the `[allowlist]` in
`.gitleaks.toml` — prefer a `paths` regex for a specific file, or a `regexes`
entry matching the specific placeholder. Say in a comment why the value is not a
credential. If the value *is* a credential, it is not a false positive: rotate it.

**CodeQL.** Add an entry to `.github/security/codeql-suppressions.json`:

```json
{
  "rule": "js/xss",
  "path": "src/components/Foo.tsx",
  "reason": "Value is a literal from our own i18n bundle, never user input. Verified <date>.",
  "expires": "2026-11-30"
}
```

`expires` is mandatory and is enforced: once the date passes, the gate fails
until someone re-confirms or fixes the finding. Keep the window short (a quarter
at most) — the point is to unblock a release, not to bury a finding.

**`npm audit`.** Prefer `npm audit fix`, which resolves within the semver ranges
already in `package.json` and touches only `package-lock.json`. If a fix needs a
major upgrade, do it as its own pull request so the smoke tests gate it.

## Credential rotation

A secret that reached a commit must be treated as compromised — doubly so here,
since the repository is public.

1. **Rotate at the provider first.** Issue a new credential and deploy it before
   revoking the old one, so the revocation is not an outage.
2. **Update the consumer.** Production values live in Vercel's environment
   configuration; CI values live in GitHub Actions secrets. Never commit either.
   Remember that any `VITE_`-prefixed variable is inlined into the bundle and is
   therefore public by construction — it must never hold a secret.
3. **Revoke the old credential** and confirm at the provider that it is dead.
4. **Check for abuse** in the provider's audit log for the window between the
   commit date (in the history report artifact) and revocation.
5. **Record it** in the security issue tracker with the affected credential,
   exposure window, and rotation date.

Never paste the secret — old or new — into an issue, a pull request, or a
comment. The scanners run with `--redact=100` for the same reason.

## Lockfiles

`package-lock.json` is the source of truth: both the smoke tests and the
dependency audit install with `npm ci`. `bun.lockb` is present but no pipeline
reads it, so it can drift — do not rely on it for the versions that ship.
