import { expect, request as playwrightRequest, test } from '@playwright/test';
import { cleanupTestData, collectPageErrors, purchaseWithCard } from './helpers/checkout';
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

/**
 * The refund runs on the manual-approval event, not on the auto-accept one the
 * issue named, because an auto-accept event cannot produce an approved card
 * participant at all:
 *
 * - `updateInviteStatusAfterPayment` sets every non-Pix invite to `Pending`,
 *   ignoring `event.AutoAccept`, so a card buyer lands in the requests queue
 *   even when the event accepts automatically.
 * - Accepting them from there fails too: `captureImmediately = event.AutoAccept`
 *   means the payment was already captured, and `capturePaidTicket` refuses
 *   anything that is not still `authorized`.
 *
 * On the manual-approval event the payment is authorized, the organizer's
 * accept captures it, and the participant becomes refundable — which is the
 * real "paid ticket, then refunded" path this case is about.
 */

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

test.describe('TC-08: reembolsar ingresso pago', () => {
  test('estorna o ingresso do participante e o remove das listas do organizador', async ({ browser }, testInfo) => {
    const email = smokeEmail('tc08-refund', testInfo.retry);

    // --- Buyer session: a real paid ticket ---------------------------------
    const buyer = await newBuyerContext(browser);
    const buyerPage = await buyer.newPage();
    const { checkout, data } = await purchaseWithCard(
      buyerPage,
      MANUAL_APPROVAL_EVENT,
      email,
      requireCard(MERCADO_PAGO_CARDS.approved),
    );
    await expect(checkout.dialog.getByText(/solicita[cç][aã]o enviada/i).last()).toBeVisible();

    // --- Organizer accepts, which captures the authorized payment ----------
    const { context: organizer, page: organizerView } = await organizerPage(browser);
    const pageErrors = collectPageErrors(organizerView);

    await openJoinRequests(organizerView, MANUAL_APPROVAL_EVENT.id, email);
    const request = joinRequestCard(organizerView, email);
    await expect(request, 'The purchase did not surface as a pending join request').toBeVisible();

    const accept = organizerView.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/private/invite/response-join' &&
        response.request().method() === 'POST',
    );
    await confirmCardAction(organizerView, request, 'join-request-accept', 'join-request-accept-confirm');
    const accepted = await accept;
    expect(accepted.status(), `Capture on accept failed (${accepted.status()})`).toBe(200);

    // --- Refund ------------------------------------------------------------
    await openParticipants(organizerView, MANUAL_APPROVAL_EVENT.id, { search: email, filter: 'approved' });
    const participant = participantCard(organizerView, email);
    await expect(participant, 'The accepted buyer is not listed as an approved participant').toBeVisible();

    const refund = organizerView.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/private/payment/refund' &&
        response.request().method() === 'POST',
    );
    await confirmCardAction(organizerView, participant, 'participant-refund', 'participant-refund-confirm');

    const refunded = await refund;
    const payload = refunded.request().postDataJSON();
    expect(payload.user_id, 'Refund must carry the participant user id').toBe(data.user_id);
    expect(payload.event_id, 'Refund must carry the event id').toBe(MANUAL_APPROVAL_EVENT.id);
    expect(refunded.status(), `Refund failed (${refunded.status()})`).toBe(200);

    await expect(organizerView.getByText(/estorno processado com sucesso/i)).toBeVisible();
    expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);

    // The confirm button's `refundMutation.isPending` label is unobservable by
    // design: Radix's AlertDialogAction dismisses the dialog on click, so the
    // "..." state unmounts before it can paint. The snackbar above is the only
    // feedback the organizer actually gets.

    // A refund flips the invite to `Refunded`, and the participants screen only
    // offers `Accepted` and `Rejected` — so the participant disappears from
    // every list the organizer can reach.
    await openParticipants(organizerView, MANUAL_APPROVAL_EVENT.id, { search: email, filter: 'approved' });
    await expect(participantCard(organizerView, email)).toHaveCount(0);
    await openParticipants(organizerView, MANUAL_APPROVAL_EVENT.id, { search: email, filter: 'rejected' });
    await expect(participantCard(organizerView, email)).toHaveCount(0);

    const token = await readAccessToken(organizerView);
    const api = await playwrightRequest.newContext();
    try {
      const apiBase = requireApiBaseUrl();

      const invites = await api.get(`${apiBase}/private/invite/user/${data.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(invites.ok(), `Buyer invite lookup failed (${invites.status()})`).toBeTruthy();
      const body = await invites.json();
      const list = (Array.isArray(body) ? body : (body.invites ?? [])) as Array<Record<string, unknown>>;
      const invite = list.find((item) => Number(item.event_id) === MANUAL_APPROVAL_EVENT.id);
      expect(invite, `No invite for event ${MANUAL_APPROVAL_EVENT.id} in ${JSON.stringify(body)}`).toBeTruthy();
      expect(invite!.status).toBe('Refunded');

      if (data.payment_id) {
        // `GET /public/payment/:id/status` does NOT reflect Mercado Pago: it
        // returns `user_events.payed` straight from our own database, and the
        // refund path never clears that column. So it is asserted as a health
        // check only, and the observed value is logged rather than pinned —
        // pinning it here would freeze the current behaviour in place.
        const status = await api.get(`${apiBase}/public/payment/${data.payment_id}/status`);
        expect(status.ok(), `Payment status failed (${status.status()})`).toBeTruthy();
        console.log(`[TC-08] payment ${data.payment_id} status after refund: ${await status.text()}`);
      } else {
        console.log('[TC-08] registration returned no payment_id; skipped the payment status probe');
      }

      // Refunding the same payment twice is the "already refunded" contract
      // TC-09 exercises through the UI. Mercado Pago rejects the second call,
      // and the handler turns any service error into a 500.
      const again = await api.post(`${apiBase}/private/payment/refund`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { user_id: data.user_id, event_id: MANUAL_APPROVAL_EVENT.id },
      });
      expect(
        again.status(),
        `A second refund of the same payment must not succeed (got ${again.status()})`,
      ).not.toBe(200);
      console.log(`[TC-08] second refund of the same payment returned ${again.status()}`);
    } finally {
      await api.dispose();
    }

    await organizer.close();
    await buyer.close();
  });
});
