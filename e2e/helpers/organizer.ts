import { expect, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { watchApiOrigin } from './auth';

/**
 * The organizer side of the smoke suite. Buyer and organizer must never share
 * a session — a buyer is an ephemeral, password-less user created by the
 * checkout, while the organizer is the dedicated admin account that owns the
 * `is_test` organization. Every spec that touches `/event-management` builds
 * its two contexts from here.
 */
export const ORGANIZER = {
  email: process.env.SMOKE_TEST_ORGANIZER_EMAIL || process.env.SMOKE_TEST_ADMIN_EMAIL || '',
  password: process.env.SMOKE_TEST_ORGANIZER_PASSWORD || process.env.SMOKE_TEST_ADMIN_PASSWORD || '',
};

export const requireOrganizerCredentials = () => {
  if (!ORGANIZER.email || !ORGANIZER.password) {
    throw new Error(
      'Organizer credentials are not configured (SMOKE_TEST_ADMIN_EMAIL / SMOKE_TEST_ADMIN_PASSWORD)',
    );
  }
  return ORGANIZER;
};

export const smokeBaseUrl = () => process.env.SMOKE_TEST_BASE_URL || 'http://127.0.0.1:4173';

// `browser.newContext()` does not inherit the `use` block from the config, so
// every context this module hands out has to restate it.
const CONTEXT_OPTIONS = {
  baseURL: smokeBaseUrl(),
  locale: 'pt-BR',
  timezoneId: 'America/Sao_Paulo',
};

/** A clean, unauthenticated context — the buyer's browser. */
export const newBuyerContext = (browser: Browser) => browser.newContext(CONTEXT_OPTIONS);

/**
 * Logs in through the real login screen instead of injecting a token: the
 * organizer session is itself part of the flow under test, and a smoke run
 * that cannot log in should fail here rather than three steps later with a
 * confusing 401.
 */
export async function loginAsOrganizer(page: Page) {
  const { email, password } = requireOrganizerCredentials();
  watchApiOrigin(page);

  await page.goto('/login');
  // The entry card offers "Criar Conta" / "Entrar" / "Continuar com Google";
  // only after choosing "Entrar" does the e-mail form render.
  await page.getByRole('button', { name: /^entrar$/i }).click();
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  const login = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/public/login' && response.request().method() === 'POST',
  );
  await page.locator('form button[type="submit"]').click();
  const response = await login;
  expect(response.ok(), `Organizer login failed (${response.status()})`).toBeTruthy();

  // EmailLogin stores the token pair and hard-navigates to /explore.
  await page.waitForURL(/\/explore/, { timeout: 30_000 });
  const token = await readAccessToken(page);
  expect(token, 'Organizer login did not persist an access token').toBeTruthy();
  return token as string;
}

export const readAccessToken = (page: Page) =>
  page.evaluate(() => localStorage.getItem('accessToken'));

// One login per worker: the storage state is replayed into every later
// organizer context, so a spec with three organizer sessions still costs a
// single round trip against production.
let cachedStorageState: Promise<Awaited<ReturnType<BrowserContext['storageState']>>> | null = null;

export async function organizerStorageState(browser: Browser) {
  if (!cachedStorageState) {
    cachedStorageState = (async () => {
      const context = await browser.newContext(CONTEXT_OPTIONS);
      try {
        await loginAsOrganizer(await context.newPage());
        return await context.storageState();
      } finally {
        await context.close();
      }
    })();
  }
  return cachedStorageState;
}

export async function newOrganizerContext(browser: Browser) {
  return browser.newContext({ ...CONTEXT_OPTIONS, storageState: await organizerStorageState(browser) });
}

export async function organizerPage(browser: Browser) {
  const context = await newOrganizerContext(browser);
  const page = await context.newPage();
  watchApiOrigin(page);
  return { context, page };
}

export const managementUrl = (eventId: number, section: string) =>
  `/event-management/${eventId}/${section}`;

const isInviteListResponse = (url: string) =>
  new URL(url).pathname.startsWith('/private/invite/event/');

/**
 * Both management lists debounce their search box by 500ms and then re-query,
 * so typing and asserting immediately races the stale result set. Wait for the
 * request that carries the search term. React Query can also answer a repeated
 * term straight from its cache, in which case no request is made at all and
 * the caller's own assertion is what decides the outcome.
 */
async function searchAndWait(page: Page, input: Locator, term: string) {
  const query = page
    .waitForResponse(
      (response) => isInviteListResponse(response.url()) && new URL(response.url()).searchParams.get('search') === term,
      { timeout: 20_000 },
    )
    .catch(() => null);
  await input.fill(term);
  await query;
}

/**
 * Navigates to a management list and waits for its first query to settle —
 * including a 403, which is the point of the permission cases.
 */
async function openManagementList(page: Page, eventId: number, section: string) {
  const listed = page.waitForResponse((response) => isInviteListResponse(response.url()), { timeout: 30_000 });
  await page.goto(managementUrl(eventId, section));
  return listed.catch(() => null);
}

export async function openJoinRequests(page: Page, eventId: number, search?: string) {
  const response = await openManagementList(page, eventId, 'requests');
  if (search) {
    await expect(page.getByPlaceholder(/buscar solicita[cç][õo]es/i)).toBeVisible();
    await searchAndWait(page, page.getByPlaceholder(/buscar solicita[cç][õo]es/i), search);
  }
  return response;
}

export async function openParticipants(
  page: Page,
  eventId: number,
  options: { search?: string; filter?: 'approved' | 'rejected' } = {},
) {
  const response = await openManagementList(page, eventId, 'participants');

  if (options.filter && options.filter !== 'approved') {
    // "Aprovados" is the component's default; only a change needs a click.
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /rejeitados/i }).click();
  }
  if (options.search) {
    await expect(page.getByPlaceholder(/buscar participantes/i)).toBeVisible();
    await searchAndWait(page, page.getByPlaceholder(/buscar participantes/i), options.search);
  }
  return response;
}

export const joinRequestCard = (page: Page, email: string) =>
  page.locator(`[data-testid="join-request-card"][data-user-email="${email}"]`);

export const participantCard = (page: Page, email: string) =>
  page.locator(`[data-testid="participant-card"][data-user-email="${email}"]`);

/** Clicks a card action and confirms the AlertDialog it opens. */
export async function confirmCardAction(page: Page, card: Locator, action: string, confirm: string) {
  await card.getByTestId(action).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await dialog.getByTestId(confirm).click();
}
