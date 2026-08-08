import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import { cleanupTestData, CheckoutPage } from './helpers/checkout';
import { TEST_EVENT } from './fixtures/test-events';
import { MERCADO_PAGO_CARDS, requireCard } from './fixtures/mercadopago-cards';

const requireConfiguration = () => {
  const missing = [
    ['SMOKE_TEST_EVENT_SLUG', TEST_EVENT.slug],
    ['SMOKE_TEST_EVENT_ID', TEST_EVENT.id],
    ['SMOKE_TEST_TICKET_PRICING_ID', TEST_EVENT.ticketPricingId],
  ].filter(([, value]) => !value);
  if (missing.length) {
    throw new Error(`Missing smoke-test configuration: ${missing.map(([name]) => name).join(', ')}`);
  }
  requireCard(MERCADO_PAGO_CARDS.approved);
};

async function selectTicketAndOpenCheckout(page: Page) {
  await page.goto(`/event/${TEST_EVENT.slug}`);
  const ticket = page.locator(`[id="${TEST_EVENT.ticketPricingId}"]`);
  await expect(ticket).toBeVisible();
  await ticket.check();
  await page.getByRole('button', { name: /continuar para pagamento/i }).click();
}

async function completeCreditCardCheckout(page: Page) {
  await selectTicketAndOpenCheckout(page);

  const checkout = new CheckoutPage(page);
  await checkout.acceptTerms();
  await checkout.fillUserInfo();
  await checkout.skipCoupon();
  await checkout.selectPaymentMethod('credit');
  await checkout.fillCreditCard(requireCard(MERCADO_PAGO_CARDS.approved));
  await expect(checkout.dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();
}

test.beforeEach(() => requireConfiguration());

test.afterAll(async () => {
  const request = await playwrightRequest.newContext();
  try {
    await cleanupTestData(request, [TEST_EVENT.id]);
  } finally {
    await request.dispose();
  }
});

test.describe('TC-01: compra com cartão de crédito', () => {
  test('completa a compra com cartão de teste aprovado', async ({ page }) => {
    await completeCreditCardCheckout(page);

    const registration = page.waitForResponse((response) =>
      new URL(response.url()).pathname === '/public/user/register-and-join-event' && response.request().method() === 'POST',
    );
    await page.getByRole('dialog').getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
    const registrationResponse = await registration;
    expect(registrationResponse.ok(), `Registration failed (${registrationResponse.status()})`).toBeTruthy();
    await expect(page.getByRole('dialog').getByText(/compra realizada/i).last()).toBeVisible();
  });

  test('envia token e dados de pagamento no payload de registro', async ({ page }) => {
    await completeCreditCardCheckout(page);

    const registration = page.waitForResponse((response) =>
      new URL(response.url()).pathname === '/public/user/register-and-join-event' && response.request().method() === 'POST',
    );
    await page.getByRole('dialog').getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
    const registrationResponse = await registration;
    expect(registrationResponse.ok(), `Registration failed (${registrationResponse.status()})`).toBeTruthy();

    const payload = registrationResponse.request().postDataJSON();
    expect(payload.payment.payment_method_id).not.toBe('free');
    expect(payload.payment.token).toBeTruthy();
    expect(payload.payment.transaction_amount).toBeGreaterThan(0);
  });
});
