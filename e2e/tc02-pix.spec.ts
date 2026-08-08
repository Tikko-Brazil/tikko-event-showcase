import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import {
  attachCheckoutDiagnostics,
  CheckoutPage,
  cleanupTestData,
  collectPageErrors,
  openEventCheckout,
} from './helpers/checkout';
import { MANUAL_APPROVAL_EVENT, TEST_EVENT } from './fixtures/test-events';
import { issuedSmokeEmails, smokeEmail } from './fixtures/test-users';

type SmokeEvent = { slug: string; id: number; ticketPricingId: number };

const requireConfiguration = () => {
  const missing = [
    ['SMOKE_TEST_EVENT_SLUG', TEST_EVENT.slug],
    ['SMOKE_TEST_EVENT_ID', TEST_EVENT.id],
    ['SMOKE_TEST_TICKET_PRICING_ID', TEST_EVENT.ticketPricingId],
    ['SMOKE_TEST_MANUAL_APPROVAL_EVENT_SLUG', MANUAL_APPROVAL_EVENT.slug],
    ['SMOKE_TEST_MANUAL_APPROVAL_EVENT_ID', MANUAL_APPROVAL_EVENT.id],
    ['SMOKE_TEST_MANUAL_APPROVAL_TICKET_PRICING_ID', MANUAL_APPROVAL_EVENT.ticketPricingId],
  ].filter(([, value]) => !value);
  if (missing.length) {
    throw new Error(`Missing smoke-test configuration: ${missing.map(([name]) => name).join(', ')}`);
  }
};

/**
 * Mercado Pago never settles a sandbox Pix charge on its own, so the only way
 * to observe the paid transition is to drive the endpoint the QR step polls
 * (`GET /public/payment/:id/status` → `{ paid }`). The stub starts unpaid so
 * the pending state is exercised against the real component, then flips.
 */
async function stubPixPolling(page: Page) {
  const state = { paid: false, polls: 0 };
  await page.route('**/public/payment/*/status', async (route) => {
    state.polls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ paid: state.paid }),
    });
  });
  return state;
}

async function checkoutWithPix(page: Page, event: SmokeEvent, email: string) {
  attachCheckoutDiagnostics(page);
  const pageErrors = collectPageErrors(page);
  const polling = await stubPixPolling(page);

  await openEventCheckout(page, event.slug, event.ticketPricingId);

  const checkout = new CheckoutPage(page);
  await checkout.acceptTerms();
  await checkout.fillUserInfo({ email });
  await checkout.skipCoupon();
  await checkout.selectPaymentMethod('pix');
  await checkout.fillPix(email);
  await expect(checkout.dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();

  const registration = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/public/user/register-and-join-event' &&
    response.request().method() === 'POST',
  );
  await checkout.dialog.getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
  const response = await registration;
  expect(response.ok(), `Registration failed (${response.status()})`).toBeTruthy();

  const payload = response.request().postDataJSON();
  expect(payload.payment.payment_method_id).toBe('pix');
  // Pix carries no card token, and the ticket is the paid R$ 1,00 one.
  expect(payload.payment.token).toBe('');
  expect(payload.payment.transaction_amount).toBeGreaterThan(0);

  const body = await response.json();
  const data = body.data ?? body;
  expect(data.qr_code, 'Mercado Pago did not return a Pix QR code').toBeTruthy();
  expect(String(data.payment_id ?? ''), 'Registration did not return a payment id').not.toBe('');

  // The QR step renders the code Mercado Pago returned, not a placeholder.
  await expect(checkout.dialog.getByText(/pagamento via pix/i).last()).toBeVisible();
  await expect(checkout.dialog.locator('div.font-mono')).toContainText(String(data.qr_code).slice(0, 32));
  await expect(checkout.dialog.getByRole('button', { name: /copiar c[oó]digo/i })).toBeVisible();
  await expect(checkout.dialog.getByText(/c[oó]digo v[aá]lido por/i)).toBeVisible();

  return { checkout, polling, pageErrors, data };
}

test.beforeEach(() => {
  // A Pix checkout is a full user-info + payment + polling round trip; the
  // 60s default is not enough for it in CI.
  test.setTimeout(180_000);
  requireConfiguration();
});

test.afterAll(async () => {
  const request = await playwrightRequest.newContext();
  try {
    await cleanupTestData(request, [TEST_EVENT.id, MANUAL_APPROVAL_EVENT.id], issuedSmokeEmails());
  } finally {
    await request.dispose();
  }
});

test.describe('TC-02: pagamento via Pix', () => {
  test('gera o QR Code e conclui a compra no evento com aprovação automática', async ({ page }, testInfo) => {
    const email = smokeEmail('tc02-pix-auto', testInfo.retry);
    const { checkout, polling, pageErrors } = await checkoutWithPix(page, TEST_EVENT, email);

    // While the charge is unpaid the QR stays on screen and nothing is issued.
    await expect.poll(() => polling.polls, { timeout: 30_000 }).toBeGreaterThanOrEqual(2);
    await expect(checkout.dialog.getByText(/pagamento via pix/i).last()).toBeVisible();
    await expect(checkout.dialog.getByText(/compra realizada/i)).toHaveCount(0);

    polling.paid = true;
    await expect(checkout.dialog.getByText(/compra realizada/i).last()).toBeVisible({ timeout: 30_000 });
    await expect(checkout.dialog.getByText(/seu ingresso foi emitido/i)).toBeVisible();
    expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
  });

  test('gera o QR Code e sinaliza aprovação necessária no evento manual', async ({ page }, testInfo) => {
    const email = smokeEmail('tc02-pix-manual', testInfo.retry);
    const { checkout, polling, pageErrors } = await checkoutWithPix(page, MANUAL_APPROVAL_EVENT, email);

    await expect.poll(() => polling.polls, { timeout: 30_000 }).toBeGreaterThanOrEqual(2);
    await expect(checkout.dialog.getByText(/pagamento via pix/i).last()).toBeVisible();
    await expect(checkout.dialog.getByText(/solicita[cç][aã]o enviada/i)).toHaveCount(0);

    polling.paid = true;
    // Manual approval never issues a ticket on payment: the confirmation the
    // user gets is that the request was sent to the organizer.
    await expect(checkout.dialog.getByText(/solicita[cç][aã]o enviada/i).last()).toBeVisible({ timeout: 30_000 });
    await expect(checkout.dialog.getByText(/assim que o organizador aceitar/i)).toBeVisible();
    await expect(checkout.dialog.getByText(/seu ingresso foi emitido/i)).toHaveCount(0);
    expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
  });
});
