# Step 31 — Authentication and cloud state

Step 31 hardens the optional account path while preserving anonymous, browser-local Core behavior. The local D1 integration suite now exercises Better Auth sessions and the account APIs against Miniflare D1. The Sites review configuration still has no D1 binding or live GitHub OAuth credentials, so hosted sign-in and cloud availability remain conditional and Beta.

## Findings and fixes

### P0 — An unsigned bearer value could select an account

**Evidence:** A request with `Authorization: Bearer test-user-attacker` was treated as authenticated by the prior development shortcut. The new regression calls `/api/me` with that value and verifies an anonymous response. Test-only identities now require a per-run 256-bit `TEST_AUTH_SECRET` and a valid HMAC signature; runtime configuration does not set that binding.

**Root cause:** `getSessionFromRequest` trusted the bearer string prefix instead of verifying a session.

**Fix:** Removed the public test-user shortcut. Added signed, expiring test fixtures behind an explicit test binding.

### P0 — A stale cloud save could overwrite a newer project

**Evidence:** The D1 suite sends two writes with the same expected revision. Exactly one returns 200; the other returns 409, and the latest manifest plus revision history preserve the winner. A write without `expectedRevision` returns 428. Cross-account reads, writes and deletes return 403; a guest request returns 401.

**Root cause:** Project updates previously had no client revision precondition.

**Fix:** Cloud `PUT` requires `expectedRevision`, compares it atomically, and reports the latest revision on conflict.

### P1 — A failed history write could leave a partial cloud save

**Evidence:** Before the fix, an injected D1 trigger rejected the revision insert after the project row had already advanced to revision 2. The follow-up read returned the changed project with no corresponding checkpoint. The regression now verifies a failed save returns 503 and leaves the project at its original name and revision.

**Root cause:** The manifest update and revision insert were separate D1 operations.

**Fix:** The compare-and-swap update and revision snapshot now run in one atomic D1 batch. Database failures return a safe 503 without logging bound project data.

### P1 — Auth could appear available with missing runtime configuration

**Evidence:** Auth endpoints without D1, a sufficiently long secret, a valid secure base URL, and GitHub credentials now return 503. Anonymous `GET /api/me` remains a 200 response with `authenticated: false`, so guest Core use remains available.

**Root cause:** The old auth factory supplied development fallback credentials and allowed account routes to behave as if authentication were configured.

**Fix:** Removed fallback secrets and dummy OAuth credentials. Added explicit configuration validation and disabled password auth and implicit OAuth account linking.

### P1 — Profile responses could expose the session token

**Evidence:** The D1 session test checks that `/api/me` contains neither the session token nor a `token` field. It also verifies expiry, refresh, sign-out revocation, and safe GitHub callback handling.

**Root cause:** The full Better Auth session object crossed the API boundary.

**Fix:** `AuthSession` contains only the session ID, user ID, and expiration time.

## Coverage

The tests exercise guest profile state, unauthenticated mutation rejection, signed test sessions, real Better Auth cookie verification against D1, session expiry and cleanup, refresh, logout, GitHub sign-in start and callback denial, a successful mocked GitHub callback, duplicate-email account-link rejection, profile persistence, project ownership, concurrent revision conflicts, checkpoint failure rollback, favourites, private/public collections, project publication, public reads, and guest/account remixes.

Commands completed during this step:

- `pnpm exec vitest run apps/api/src/__tests__/cloud-sync-d1.test.ts apps/api/src/__tests__/auth-hardening.test.ts apps/api/src/__tests__/auth-and-cloud.test.ts` — 32 tests passed.
- `pnpm test` — all 69 files and 1002 tests passed on the isolated rerun. One earlier run overlapped workspace typecheck and hit a Vitest worker RPC timeout after all test assertions had passed; the isolated rerun completed without worker errors.
- `pnpm --filter @tessellate/api typecheck` — passed.
- `pnpm typecheck` — all workspace packages passed.
- `pnpm lint` — passed with 33 existing warnings and zero errors.
- `pnpm exec prettier --check` on the changed API TypeScript files — passed; repository Markdown files retain their existing table formatting.
- `pnpm audit:all` — passed, including the 16/16 behavioural release gate, catalogue build, 717-page Astro build, Sites Worker build, bundle budgets, licence/provenance audit and security/secrets audit.

The mocked GitHub exchange validates Better Auth’s callback/session behavior without sending credentials or requests to GitHub. Real OAuth credentials and the deployed D1 binding were not available in this local step. D1/R2 were not provisioned by this work.

Machine-readable case details are in `quality/evidence/step-31/verification.json`.
