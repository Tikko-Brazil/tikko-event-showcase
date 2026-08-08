import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import { cleanupTestData } from './helpers/checkout';
import { TEST_EVENT, MANUAL_APPROVAL_EVENT } from './fixtures/test-events';
import { TEST_USER } from './fixtures/test-users';

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

async function completeFreeCheckout(page: Page, slug: string, ticketPricingId: number, expectedMessage: RegExp) {
  await page.goto(`/event/${slug}`);
  // Ticket pricing IDs are numeric, so use an attribute selector instead of
  // a CSS id selector (CSS selectors cannot start with a digit).
  const ticket = page.locator(`[id="${ticketPricingId}"]`);
  await expect(ticket).toBeVisible();
  await ticket.check();
  await page.getByRole('button', { name: /continuar para pagamento/i }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: /^continuar$/i }).click();

  await dialog.locator('#fullName').fill(TEST_USER.fullName);
  await dialog.locator('#email').fill(TEST_USER.email);
  await dialog.locator('#confirmEmail').fill(TEST_USER.email);
  await dialog.locator('#phone').fill(TEST_USER.phone);
  await dialog.locator('#confirmPhone').fill(TEST_USER.phone);
  await dialog.locator('#identification').fill(TEST_USER.identification);
  await dialog.locator('#birthdate').fill(TEST_USER.birthdate);
  await dialog.locator('#instagram').fill('smoke_test');
  await dialog.getByRole('button', { name: /^continuar$/i }).click();

  await dialog.locator('#coupon').fill(process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100');
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
  expect(payload.coupon).toBe((process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100').toUpperCase());
  expect(payload.payment.transaction_amount).toBe(0);
  expect(payload.payment.payment_method_id).toBe('free');
  expect(payload.payment.token).toBe('');
  await expect(dialog.getByText(expectedMessage)).toBeVisible();
}

test.beforeEach(() => requireConfiguration());

test.afterAll(async () => {
  const request = await playwrightRequest.newContext();
  try {
    await cleanupTestData(request, [TEST_EVENT.id, MANUAL_APPROVAL_EVENT.id]);
  } finally {
    await request.dispose();
  }
});

test('TC-04: 100% coupon on auto-accept event skips external payment', async ({ page }) => {
  let mercadoPagoRequests = 0;
  page.on('request', (request) => {
    if (/mercadopago/i.test(request.url())) mercadoPagoRequests += 1;
  });
  await completeFreeCheckout(page, TEST_EVENT.slug, TEST_EVENT.ticketPricingId, /compra realizada/i);
  expect(mercadoPagoRequests).toBe(0);
});

test('TC-04b: 100% coupon preserves manual approval flow', async ({ page }) => {
  await completeFreeCheckout(page, MANUAL_APPROVAL_EVENT.slug, MANUAL_APPROVAL_EVENT.ticketPricingId, /solicita[cç][aã]o enviada/i);
});
