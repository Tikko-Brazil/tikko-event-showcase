import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import { CheckoutPage, cleanupTestData, openEventCheckout } from './helpers/checkout';
import { TEST_EVENT, MANUAL_APPROVAL_EVENT } from './fixtures/test-events';
import { issuedSmokeEmails, smokeEmail, smokeIdentification } from './fixtures/test-users';

const couponCode = () => process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100';

const requireConfiguration = () => {
  const missing = [
    ['SMOKE_TEST_EVENT_SLUG', TEST_EVENT.slug],
    ['SMOKE_TEST_EVENT_ID', TEST_EVENT.id],
    ['SMOKE_TEST_TICKET_PRICING_ID', TEST_EVENT.ticketPricingId],
    ['SMOKE_TEST_MANUAL_APPROVAL_EVENT_SLUG', MANUAL_APPROVAL_EVENT.slug],
    ['SMOKE_TEST_MANUAL_APPROVAL_EVENT_ID', MANUAL_APPROVAL_EVENT.id],
    ['SMOKE_TEST_MANUAL_APPROVAL_TICKET_PRICING_ID', MANUAL_APPROVAL_EVENT.ticketPricingId],
  ].filter(([, value]) => !value);
  if (missing.length) throw new Error(`Missing smoke-test configuration: ${missing.map(([name]) => name).join(', ')}`);
};

async function completeFreeCheckout(
  page: Page,
  slug: string,
  ticketPricingId: number,
  email: string,
  expectedMessage: RegExp,
) {
  // A 100% coupon must settle entirely inside Tikko: no Mercado Pago call at
  // all, on either approval flow.
  let mercadoPagoRequests = 0;
  page.on('request', (request) => {
    if (/mercadopago/i.test(request.url())) mercadoPagoRequests += 1;
  });

  await openEventCheckout(page, slug, ticketPricingId);

  // The user-info step is shared with every other buyer flow, including the
  // retry loop that survives Formik reinitializing the coupled email fields.
  const checkout = new CheckoutPage(page);
  const { dialog } = checkout;
  await checkout.acceptTerms();
  await checkout.fillUserInfo({ email, identification: smokeIdentification(email) });

  await dialog.locator('#coupon').fill(couponCode());
  await dialog.getByRole('button', { name: /aplicar/i }).click();
  await expect(dialog.getByText(/cupom .* aplicado/i)).toBeVisible();
  await expect(dialog.getByText('Total').last().locator('..')).toContainText('R$ 0,00');

  await dialog.getByRole('button', { name: /^continuar$/i }).last().click();
  await expect(dialog.getByText(/m[eé]todo de pagamento/i)).not.toBeVisible();
  await expect(dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();

  const registration = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/public/user/register-and-join-event' && response.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
  const registrationResponse = await registration;
  expect(registrationResponse.ok(), `Registration failed (${registrationResponse.status()})`).toBeTruthy();
  const payload = registrationResponse.request().postDataJSON();
  expect(payload.coupon).toBe(couponCode().toUpperCase());
  expect(payload.payment.transaction_amount).toBe(0);
  expect(payload.payment.payment_method_id).toBe('free');
  expect(payload.payment.token).toBe('');
  await expect(dialog.getByText(expectedMessage).last()).toBeVisible();
  expect(mercadoPagoRequests, 'A free checkout must not touch Mercado Pago').toBe(0);
}

test.beforeEach(() => requireConfiguration());

test.afterAll(async () => {
  const request = await playwrightRequest.newContext();
  try {
    await cleanupTestData(request, [TEST_EVENT.id, MANUAL_APPROVAL_EVENT.id], issuedSmokeEmails());
  } finally {
    await request.dispose();
  }
});

test('TC-04: 100% coupon on auto-accept event skips external payment', async ({ page }, testInfo) => {
  await completeFreeCheckout(
    page,
    TEST_EVENT.slug,
    TEST_EVENT.ticketPricingId,
    smokeEmail('tc04-auto', testInfo.retry),
    /compra realizada/i,
  );
});

test('TC-04b: 100% coupon preserves manual approval flow', async ({ page }, testInfo) => {
  await completeFreeCheckout(
    page,
    MANUAL_APPROVAL_EVENT.slug,
    MANUAL_APPROVAL_EVENT.ticketPricingId,
    smokeEmail('tc04-manual', testInfo.retry),
    /solicita[cç][aã]o enviada/i,
  );
});
