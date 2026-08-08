import { expect, request as playwrightRequest, test } from '@playwright/test';
import { cleanupTestData, purchaseWithCard } from './helpers/checkout';
import {
  confirmCardAction,
  joinRequestCard,
  newBuyerContext,
  organizerPage,
  participantCard,
  openJoinRequests,
  openParticipants,
  readAccessToken,
  requireOrganizerCredentials,
} from './helpers/organizer';
import { apiBaseUrl } from './helpers/auth';
import { MANUAL_APPROVAL_EVENT } from './fixtures/test-events';
import { MERCADO_PAGO_CARDS, requireCard } from './fixtures/mercadopago-cards';
import { issuedSmokeEmails, smokeEmail } from './fixtures/test-users';

const requireConfiguration = () => {
  const missing = [
    ['SMOKE_TEST_MANUAL_APPROVAL_EVENT_SLUG', MANUAL_APPROVAL_EVENT.slug],
    ['SMOKE_TEST_MANUAL_APPROVAL_EVENT_ID', MANUAL_APPROVAL_EVENT.id],
    ['SMOKE_TEST_MANUAL_APPROVAL_TICKET_PRICING_ID', MANUAL_APPROVAL_EVENT.ticketPricingId],
  ].filter(([, value]) => !value);
  if (missing.length) {
    throw new Error(`Missing smoke-test configuration: ${missing.map(([name]) => name).join(', ')}`);
  }
  requireCard(MERCADO_PAGO_CARDS.approved);
  requireOrganizerCredentials();
};

test.beforeEach(() => {
  // Two sessions, a full card checkout and two management round trips: the
  // 60s default covers none of it.
  test.setTimeout(300_000);
  requireConfiguration();
});

test.afterAll(async () => {
  const request = await playwrightRequest.newContext();
  try {
    await cleanupTestData(request, [MANUAL_APPROVAL_EVENT.id], issuedSmokeEmails());
  } finally {
    await request.dispose();
  }
});

test.describe('TC-06: aceitar solicitação de participação', () => {
  test('aceita a solicitação e move o comprador para a lista de aprovados', async ({ browser }, testInfo) => {
    const email = smokeEmail('tc06-accept', testInfo.retry);

    // --- Buyer session -----------------------------------------------------
    const buyer = await newBuyerContext(browser);
    const buyerPage = await buyer.newPage();
    const { checkout, data } = await purchaseWithCard(
      buyerPage,
      MANUAL_APPROVAL_EVENT,
      email,
      requireCard(MERCADO_PAGO_CARDS.approved),
    );
    // A manual-approval event never issues a ticket on payment; the buyer is
    // told the request went to the organizer.
    await expect(checkout.dialog.getByText(/solicita[cç][aã]o enviada/i).last()).toBeVisible();

    // --- Organizer session (separate context, never the buyer's) -----------
    const { context: organizer, page: organizerView } = await organizerPage(browser);

    await openJoinRequests(organizerView, MANUAL_APPROVAL_EVENT.id, email);
    const request = joinRequestCard(organizerView, email);
    await expect(request, 'The purchase did not surface as a pending join request').toBeVisible();

    const responseJoin = organizerView.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/private/invite/response-join' &&
        response.request().method() === 'POST',
    );
    await confirmCardAction(organizerView, request, 'join-request-accept', 'join-request-accept-confirm');

    const accepted = await responseJoin;
    expect(accepted.request().postDataJSON().approved, 'Accept must send approved: true').toBe(true);
    expect(accepted.status(), `response-join failed (${accepted.status()})`).toBe(200);

    await expect(organizerView.getByText(/solicita[cç][aã]o aceita com sucesso/i)).toBeVisible();
    // The accepted request leaves the pending queue.
    await expect(request).toHaveCount(0);

    // --- The participant is now approved ----------------------------------
    await openParticipants(organizerView, MANUAL_APPROVAL_EVENT.id, { search: email, filter: 'approved' });
    await expect(participantCard(organizerView, email)).toBeVisible();

    // --- Buyer-side state --------------------------------------------------
    // The buyer cannot be logged in: `register-and-join-event` creates the
    // user with no password (`auth_method: ""`), so their own screens are
    // unreachable from a smoke run. The invite the buyer owns is queried
    // directly instead, which is the same state those screens render.
    const token = await readAccessToken(organizerView);
    const api = await playwrightRequest.newContext();
    try {
      const invites = await api.get(`${apiBaseUrl()}/private/invite/user/${data.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(invites.ok(), `Buyer invite lookup failed (${invites.status()})`).toBeTruthy();
      const body = await invites.json();
      const list = (Array.isArray(body) ? body : (body.invites ?? [])) as Array<Record<string, unknown>>;
      const invite = list.find((item) => Number(item.event_id) === MANUAL_APPROVAL_EVENT.id);
      expect(invite, `No invite for event ${MANUAL_APPROVAL_EVENT.id} in ${JSON.stringify(body)}`).toBeTruthy();
      expect(invite!.status).toBe('Accepted');
    } finally {
      await api.dispose();
    }

    await organizer.close();
    await buyer.close();
  });
});
