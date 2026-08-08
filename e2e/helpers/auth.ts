import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test';
import { TEST_USER, requireTestUserCredentials } from '../fixtures/test-users';

// The API origin is not published as a secret: the smoke run only gets the
// frontend URL, and the bundle carries its own `VITE_API_BASE_URL`. Rather
// than duplicate that value in CI, watch the traffic the app itself makes and
// learn the origin from the first `/public/*` or `/private/*` call.
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

export const apiBaseUrl = () =>
  process.env.SMOKE_TEST_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  observedApiOrigin ||
  'http://localhost:3000';

/** Fails loudly instead of silently querying `localhost` from a CI runner. */
export const requireApiBaseUrl = () => {
  const baseUrl = apiBaseUrl();
  if (/localhost|127\.0\.0\.1/.test(baseUrl) && process.env.CI) {
    throw new Error(
      'API base URL is unknown: no /public or /private request was observed and SMOKE_TEST_API_BASE_URL is unset',
    );
  }
  return baseUrl;
};

export type TokenPair = { access_token: string; refresh_token: string };

/**
 * The one API login path in the suite. `loginAsOrganizer` drives the real
 * login screen because that flow is itself under test; this is for the callers
 * that only need a bearer token (the cleanup in `afterAll`, which has no page).
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
