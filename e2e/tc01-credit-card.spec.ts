import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import {
  attachCheckoutDiagnostics,
  cleanupTestData,
  CheckoutPage,
  describeCheckoutFrames,
  openEventCheckout,
} from './helpers/checkout';
import { MERCADO_PAGO_EVENT, MERCADO_PAGO_EVENT_VARIABLES } from './fixtures/test-events';
import { requireMercadoPagoFixtures } from './helpers/mercado-pago-suite';
import { MERCADO_PAGO_CARDS, requireCard } from './fixtures/mercadopago-cards';
import { issuedSmokeEmails, smokeEmail, smokeIdentification } from './fixtures/test-users';

// The payment is the subject here, so this case charges Mercado Pago for real.
// It runs in the non-blocking integration workflow, not in the deploy gate.
requireMercadoPagoFixtures('TC-01', [
  { event: MERCADO_PAGO_EVENT, variables: MERCADO_PAGO_EVENT_VARIABLES },
]);

const requireConfiguration = () => {
  requireCard(MERCADO_PAGO_CARDS.approved);
};

async function completeCreditCardCheckout(page: Page, email: string) {
  attachCheckoutDiagnostics(page);
  await openEventCheckout(page, MERCADO_PAGO_EVENT.slug, MERCADO_PAGO_EVENT.ticketPricingId);

  // One document per buyer: same card, same amount and the same payer a few
  // times over gets the later payments refused as duplicates, which would
  // undo the per-attempt address below on the very retry it exists for.
  const identification = smokeIdentification(email);

  const checkout = new CheckoutPage(page);
  await checkout.acceptTerms();
  await checkout.fillUserInfo({ email, identification });
  await checkout.skipCoupon();
  await checkout.selectPaymentMethod('credit');
  await checkout.fillCard({ ...requireCard(MERCADO_PAGO_CARDS.approved), identification }, email);

  try {
    await expect(checkout.dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();
  } catch (error) {
    // Tokenization failures leave the card form on screen with inline errors,
    // so dump its DOM and visible text before rethrowing — it is the only view
    // CI gives us into a production-only flow.
    console.log(`[TC-01] checkout frames after submitting the card:\n${await describeCheckoutFrames(page)}`);
    console.log(`[TC-01] dialog text after submitting the card:\n${await checkout.dialog.innerText()}`);
    throw error;
  }
}

test.beforeEach(() => requireConfiguration());

test.afterAll(async () => {
  const request = await playwrightRequest.newContext();
  try {
    await cleanupTestData(request, [MERCADO_PAGO_EVENT.id], issuedSmokeEmails());
  } finally {
    await request.dispose();
  }
});

test.describe('TC-01: compra com cartão de crédito', () => {
  test('completa a compra com cartão de teste aprovado', async ({ page }, testInfo) => {
    await completeCreditCardCheckout(page, smokeEmail('tc01-approved', testInfo.retry));

    const registration = page.waitForResponse((response) =>
      new URL(response.url()).pathname === '/public/user/register-and-join-event' && response.request().method() === 'POST',
    );
    await page.getByRole('dialog').getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
    const registrationResponse = await registration;
    expect(registrationResponse.ok(), `Registration failed (${registrationResponse.status()})`).toBeTruthy();
    await expect(page.getByRole('dialog').getByText(/compra realizada/i).last()).toBeVisible();
  });

  test('envia token e dados de pagamento no payload de registro', async ({ page }, testInfo) => {
    await completeCreditCardCheckout(page, smokeEmail('tc01-payload', testInfo.retry));

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
