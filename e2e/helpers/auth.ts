import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test';
import { TEST_USER, requireTestUserCredentials } from '../fixtures/test-users';

export const apiBaseUrl = () =>
  process.env.SMOKE_TEST_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function loginAsSmokeUser(request: APIRequestContext) {
  const user = requireTestUserCredentials();
  const response = await request.post(`${apiBaseUrl()}/public/login`, {
    data: { email: user.email, password: user.password },
  });
  expect(response.ok(), `Smoke user login failed (${response.status()})`).toBeTruthy();
  const body = await response.json();
  if (!body.token_pair?.access_token || !body.token_pair?.refresh_token) {
    throw new Error('Login response did not contain a token pair');
  }
  return body.token_pair as { access_token: string; refresh_token: string };
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
