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
import { requireApiBaseUrl } from './helpers/auth';
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

test.describe('TC-07: rejeitar solicitação de participação', () => {
  test('rejeita a solicitação e move o comprador para a lista de rejeitados', async ({ browser }, testInfo) => {
    const email = smokeEmail('tc07-reject', testInfo.retry);

    const buyer = await newBuyerContext(browser);
    const buyerPage = await buyer.newPage();
    const { checkout, data } = await purchaseWithCard(
      buyerPage,
      MANUAL_APPROVAL_EVENT,
      email,
      requireCard(MERCADO_PAGO_CARDS.approved),
    );
    await expect(checkout.dialog.getByText(/solicita[cç][aã]o enviada/i).last()).toBeVisible();

    const { context: organizer, page: organizerView } = await organizerPage(browser);

    await openJoinRequests(organizerView, MANUAL_APPROVAL_EVENT.id, email);
    const request = joinRequestCard(organizerView, email);
    await expect(request, 'The purchase did not surface as a pending join request').toBeVisible();
    // The pending card shows what the buyer was charged, which is what makes
    // the rejection contract below worth asserting at all.
    await expect(request).toContainText(/R\$/);

    const responseJoin = organizerView.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/private/invite/response-join' &&
        response.request().method() === 'POST',
    );
    await confirmCardAction(organizerView, request, 'join-request-reject', 'join-request-reject-confirm');

    const rejected = await responseJoin;
    expect(rejected.request().postDataJSON().approved, 'Reject must send approved: false').toBe(false);
    expect(rejected.status(), `response-join failed (${rejected.status()})`).toBe(200);

    await expect(organizerView.getByText(/solicita[cç][aã]o rejeitada com sucesso/i)).toBeVisible();
    await expect(request).toHaveCount(0);

    // Rejected participants are reachable only under the "Rejeitados" filter.
    await openParticipants(organizerView, MANUAL_APPROVAL_EVENT.id, { search: email, filter: 'rejected' });
    await expect(participantCard(organizerView, email)).toBeVisible();

    await openParticipants(organizerView, MANUAL_APPROVAL_EVENT.id, { search: email, filter: 'approved' });
    await expect(participantCard(organizerView, email)).toHaveCount(0);

    // What the backend actually does with the money on rejection of a *paid*
    // card ticket: nothing is refunded, because nothing was ever captured. A
    // manual-approval card checkout creates the Mercado Pago payment with
    // `capture: false`, so rejection runs `CancelPaymentIntent` on the
    // authorization (`cancelPaymentIfExists`) and the hold is simply released.
    // A refund only exists for Pix — that path is already settled at MP, so
    // rejection calls `RefundPixPayment` instead. Either way the invite lands
    // on `Rejected`, which is the only state observable from the outside.
    const token = await readAccessToken(organizerView);
    const api = await playwrightRequest.newContext();
    try {
      const invites = await api.get(`${requireApiBaseUrl()}/private/invite/user/${data.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(invites.ok(), `Buyer invite lookup failed (${invites.status()})`).toBeTruthy();
      const body = await invites.json();
      const list = (Array.isArray(body) ? body : (body.invites ?? [])) as Array<Record<string, unknown>>;
      const invite = list.find((item) => Number(item.event_id) === MANUAL_APPROVAL_EVENT.id);
      expect(invite, `No invite for event ${MANUAL_APPROVAL_EVENT.id} in ${JSON.stringify(body)}`).toBeTruthy();
      expect(invite!.status).toBe('Rejected');
      // `purchased_at` is not asserted here even though the row carries it:
      // `GetInvitesByUserID` selects id, uuid, event_id, user_id, inviter_id,
      // accepted, status, type and approved_by only, so the column never
      // reaches this response and `omitempty` drops it.
    } finally {
      await api.dispose();
    }

    await organizer.close();
    await buyer.close();
  });
});
