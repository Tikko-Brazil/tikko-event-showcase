import { expect, test, type Page } from '@playwright/test';
import { collectPageErrors } from './helpers/checkout';
import {
  managementUrl,
  newBuyerContext,
  organizerPage,
  participantCard,
  requireOrganizerCredentials,
} from './helpers/organizer';
import { TEST_EVENT } from './fixtures/test-events';

/**
 * TC-09 covers the two ways the organizer screens can go wrong: a refund the
 * backend refuses, and someone reaching the destructive screens without the
 * role to use them.
 *
 * The refund failures are driven by stubbing `POST /private/payment/refund`
 * rather than by burning real payments — the *real* "already refunded" contract
 * (Mercado Pago rejects the second call, the handler answers 500) is asserted
 * against production in TC-08. What is left to prove here is that the frontend
 * turns each of those statuses into the message `PaymentGateway.handleError`
 * promises, and never into a broken page.
 */

const PARTICIPANT_EMAIL = 'tc09-participant@example.com';

const stubbedParticipant = {
  invite_id: 999_001,
  user: {
    id: 999_002,
    username: 'TC09 Participante',
    email: PARTICIPANT_EMAIL,
    gender: 'other',
    phone_number: '+55 (11) 99999-9999',
    instagram_profile: 'tc09',
  },
  ticket_pricing: { id: 1, ticket_type: 'Pista', gender: 'unisex', lot: 1, price: 100 },
  payment_details: { authorized_amount: 100, coupon: '' },
  is_validated: false,
};

/** Serves the participants list from a fixture so the refund cases are deterministic. */
async function stubParticipantsList(page: Page) {
  await page.route('**/private/invite/event/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ invites: [stubbedParticipant], total: 1, page: 1, limit: 6, total_pages: 1 }),
    }),
  );
}

const REFUND_FAILURES = [
  {
    status: 403,
    label: 'sem permissão de estorno',
    message: /permiss[õo]es insuficientes para processar estorno/i,
  },
  { status: 404, label: 'pagamento inexistente', message: /pagamento n[ãa]o encontrado/i },
  {
    // What an already-refunded payment really returns: the service error is
    // flattened into a 500 by `RefundPayment`'s handler.
    status: 500,
    label: 'pagamento já estornado',
    message: /falha ao processar estorno/i,
  },
];

test.beforeEach(() => {
  test.setTimeout(120_000);
  if (!TEST_EVENT.id) throw new Error('Missing smoke-test configuration: SMOKE_TEST_EVENT_ID');
  requireOrganizerCredentials();
});

test.describe('TC-09: erros de estorno', () => {
  for (const failure of REFUND_FAILURES) {
    test(`mostra mensagem amigável quando o estorno falha com ${failure.status} (${failure.label})`, async ({
      browser,
    }) => {
      const { context, page } = await organizerPage(browser);
      const pageErrors = collectPageErrors(page);
      await stubParticipantsList(page);
      await page.route('**/private/payment/refund', (route) =>
        route.fulfill({
          status: failure.status,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'refund rejected' }),
        }),
      );

      await page.goto(managementUrl(TEST_EVENT.id, 'participants'));
      const participant = participantCard(page, PARTICIPANT_EMAIL);
      await expect(participant).toBeVisible({ timeout: 30_000 });

      await participant.getByTestId('participant-refund').click();
      const dialog = page.getByRole('alertdialog');
      await expect(dialog).toBeVisible();
      await dialog.getByTestId('participant-refund-confirm').click();

      await expect(page.getByText(failure.message)).toBeVisible();
      // The raw status must never reach the organizer, and the screen must
      // still be usable — the participant stays listed, ready for a retry.
      await expect(page.getByText(String(failure.status), { exact: true })).toHaveCount(0);
      await expect(participant).toBeVisible({ timeout: 30_000 });
      expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);

      await context.close();
    });
  }
});

test.describe('TC-09: permissões', () => {
  test('visitante sem sessão é mandado para o login em vez das telas de gerenciamento', async ({ browser }) => {
    const context = await newBuyerContext(browser);
    const page = await context.newPage();

    for (const section of ['requests', 'participants']) {
      await page.goto(managementUrl(TEST_EVENT.id, section));
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId('participant-refund')).toHaveCount(0);
      await expect(page.getByTestId('join-request-accept')).toHaveCount(0);
    }

    await context.close();
  });

  test('sessão inválida cai no login e nunca renderiza as ações destrutivas', async ({ browser }) => {
    const context = await newBuyerContext(browser);
    // A token that exists is enough for PrivateRoute; the API is what rejects
    // it, and `fetchWithAuth` then fails the refresh and bounces to /login.
    await context.addInitScript(() => {
      localStorage.setItem('accessToken', 'invalid.smoke.token');
      localStorage.setItem('refreshToken', 'invalid.smoke.refresh');
    });
    const page = await context.newPage();

    await page.goto(managementUrl(TEST_EVENT.id, 'requests'));
    await page.waitForURL(/\/login/, { timeout: 60_000 });
    await expect(page.getByTestId('join-request-accept')).toHaveCount(0);
    await expect(page.getByTestId('join-request-reject')).toHaveCount(0);

    await context.close();
  });

  test('403 do backend deixa as telas em estado de erro, sem expor aceitar, rejeitar ou estornar', async ({
    browser,
  }) => {
    // The role check lives entirely in the API (`HasMinimumRole`): the route
    // itself only requires *a* session, so a logged-in non-organizer reaches
    // the screen and gets a 403 from the list endpoint. There is no second
    // password-backed account in the smoke fixture to play that user — the
    // buyers the checkout creates have no password at all — so the 403 is
    // served to a real organizer session instead. What is under test is the
    // frontend's reaction, which is identical either way.
    const { context, page } = await organizerPage(browser);
    const pageErrors = collectPageErrors(page);
    await page.route('**/private/invite/event/**', (route) =>
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'insufficient permissions' }),
      }),
    );

    await page.goto(managementUrl(TEST_EVENT.id, 'requests'));
    // React Query retries a failed query three times with backoff before it
    // surfaces as an error, so the error state takes several seconds to paint.
    await expect(page.getByTestId('join-requests-error')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('join-request-accept')).toHaveCount(0);
    await expect(page.getByTestId('join-request-reject')).toHaveCount(0);

    await page.goto(managementUrl(TEST_EVENT.id, 'participants'));
    await expect(page.getByTestId('participants-error')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('participant-refund')).toHaveCount(0);

    expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
    await context.close();
  });
});
