import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test';
import { TEST_USER, requireTestUserCredentials } from '../fixtures/test-users';

// Observing the app's own traffic is the last resort for learning the API
// origin, and it only ever works inside a test that already drove a page — the
// `afterAll` cleanup runs with none. It stays as a fallback, but nothing is
// allowed to depend on it.
let observedApiOrigin: string | undefined;

export function watchApiOrigin(page: Page) {
  page.on('request', (request) => {
    if (observedApiOrigin) return;
    try {
      const url = new URL(request.url());
      if (/^\/(public|private)\//.test(url.pathname)) observedApiOrigin = url.origin;
    } catch {
      // Non-HTTP requests (data:, blob:) are not API calls.
    }
  });
}

const LOCAL_API_BASE_URL = 'http://localhost:3000';

const originOf = (url: string | undefined) => {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
};

const pointsAtLocalhost = (url: string) =>
  /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(url);

/**
 * Where the API lives, in decreasing order of how much the value can be
 * trusted. `SMOKE_TEST_CLEANUP_URL` is an absolute URL on the same backend, so
 * its origin answers the question in exactly the state an `afterAll` runs in —
 * and it is checked before the observed origin, because configuration outranks
 * inference.
 */
const resolveApiBaseUrl = () =>
  process.env.SMOKE_TEST_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  originOf(process.env.SMOKE_TEST_CLEANUP_URL) ||
  observedApiOrigin;

/**
 * The API origin, or a thrown configuration error — never a quiet fall back to
 * `localhost` while the suite runs against a deployed frontend. That fallback
 * turned a missing environment variable into `ECONNREFUSED ::1:3000` inside
 * `afterAll`, which reads like a broken test rather than a broken config.
 */
export const apiBaseUrl = () => {
  const resolved = resolveApiBaseUrl();
  if (resolved) return resolved;

  // No local backend is reachable from a CI runner, and a run against a
  // deployed frontend has no business talking to one anywhere.
  const frontendUrl = process.env.SMOKE_TEST_BASE_URL;
  if (process.env.CI || (frontendUrl && !pointsAtLocalhost(frontendUrl))) {
    throw new Error(
      'Cannot resolve the API base URL: set SMOKE_TEST_API_BASE_URL (or SMOKE_TEST_CLEANUP_URL, whose origin is used) ' +
        `— refusing to fall back to ${LOCAL_API_BASE_URL}${frontendUrl ? ` while testing ${frontendUrl}` : ''}`,
    );
  }
  return LOCAL_API_BASE_URL;
};

export type TokenPair = { access_token: string; refresh_token: string };

/**
 * The one API login path in the suite. `loginAsOrganizer` drives the real login
 * screen because that flow is itself under test; this is for the callers that
 * only need a bearer token — the cleanup in `afterAll`, which has no page, and
 * so no observed origin either.
 */
export async function loginViaApi(
  request: APIRequestContext,
  credentials: { email: string; password: string },
  label = 'Smoke user',
) {
  const response = await request.post(`${apiBaseUrl()}/public/login`, {
    data: { email: credentials.email, password: credentials.password },
  });
  expect(response.ok(), `${label} login failed (${response.status()})`).toBeTruthy();
  const body = await response.json();
  if (!body.token_pair?.access_token || !body.token_pair?.refresh_token) {
    throw new Error('Login response did not contain a token pair');
  }
  return body.token_pair as TokenPair;
}

/** The standard test user — `SMOKE_TEST_USER_EMAIL`, not a per-run buyer alias. */
export function loginAsSmokeUser(request: APIRequestContext) {
  return loginViaApi(request, requireTestUserCredentials(), 'Smoke test user');
}

export async function authenticateContext(context: BrowserContext, request: APIRequestContext) {
  const tokens = await loginAsSmokeUser(request);
  await context.addInitScript(({ access_token, refresh_token }) => {
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
  }, tokens);
  return tokens;
}

export async function loginFromPage(page: Page, request: APIRequestContext) {
  await authenticateContext(page.context(), request);
  await page.reload();
}

export { TEST_USER };
