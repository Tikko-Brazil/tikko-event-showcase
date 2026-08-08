import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import {
  attachCheckoutDiagnostics,
  CheckoutPage,
  cleanupTestData,
  collectPageErrors,
  openEventCheckout,
} from './helpers/checkout';
import { TEST_EVENT } from './fixtures/test-events';
import {
  MERCADO_PAGO_BRANDS,
  MERCADO_PAGO_CARDS,
  requireCard,
  type MercadoPagoCard,
} from './fixtures/mercadopago-cards';
import { issuedSmokeEmails, smokeEmail } from './fixtures/test-users';

// A refused payment leaves the invite in `payment_failed`, which the backend
// explicitly allows to be retried — so every declined result can reuse one
// e-mail, and the run creates a single user instead of six. The contingency
// case does NOT leave that state (it is accepted as pending), so it gets its
// own address, and the brand matrix never submits, so it needs no records.
const DECLINED_EMAIL = smokeEmail('tc05-declined');

const DECLINED_RESULTS: Array<{ card: MercadoPagoCard; reason: string }> = [
  { card: MERCADO_PAGO_CARDS.otherError, reason: 'recusa genérica' },
  { card: MERCADO_PAGO_CARDS.callForAuthorization, reason: 'autorização por telefone' },
  { card: MERCADO_PAGO_CARDS.insufficientFunds, reason: 'saldo insuficiente' },
  { card: MERCADO_PAGO_CARDS.securityCodeError, reason: 'código de segurança inválido' },
  { card: MERCADO_PAGO_CARDS.expired, reason: 'cartão vencido' },
  { card: MERCADO_PAGO_CARDS.formError, reason: 'dados do cartão inválidos' },
];

const requireConfiguration = () => {
  const missing = [
    ['SMOKE_TEST_EVENT_SLUG', TEST_EVENT.slug],
    ['SMOKE_TEST_EVENT_ID', TEST_EVENT.id],
    ['SMOKE_TEST_TICKET_PRICING_ID', TEST_EVENT.ticketPricingId],
  ].filter(([, value]) => !value);
  if (missing.length) {
    throw new Error(`Missing smoke-test configuration: ${missing.map(([name]) => name).join(', ')}`);
  }
};

const registrationResponse = (page: Page) =>
  page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/public/user/register-and-join-event' &&
    response.request().method() === 'POST',
  );

async function fillCheckoutUpToConfirmation(page: Page, card: MercadoPagoCard, email: string) {
  attachCheckoutDiagnostics(page);
  const pageErrors = collectPageErrors(page);

  await openEventCheckout(page, TEST_EVENT.slug, TEST_EVENT.ticketPricingId);

  const checkout = new CheckoutPage(page);
  await checkout.acceptTerms();
  await checkout.fillUserInfo({ email });
  await checkout.skipCoupon();
  await checkout.selectPaymentMethod('credit');
  return { checkout, pageErrors };
}

test.beforeEach(() => {
  // A full checkout plus tokenization plus the payment round trip does not fit
  // in the 60s default when CI is slow.
  test.setTimeout(180_000);
  requireConfiguration();
});

test.afterAll(async () => {
  const request = await playwrightRequest.newContext();
  try {
    await cleanupTestData(request, [TEST_EVENT.id], issuedSmokeEmails());
  } finally {
    await request.dispose();
  }
});

test.describe('TC-05: cartões recusados', () => {
  for (const { card, reason } of DECLINED_RESULTS) {
    test(`${card.paymentStatus} (${reason}) falha com mensagem amigável e mantém o checkout`, async ({ page }) => {
      const { checkout, pageErrors } = await fillCheckoutUpToConfirmation(
        page,
        requireCard(card),
        DECLINED_EMAIL,
      );
      // Tokenization succeeds for every status code — Mercado Pago only decides
      // the outcome when the payment itself is created, from the cardholder
      // name. So the checkout must reach the confirmation step first.
      await checkout.fillCard(card, DECLINED_EMAIL);
      await expect(checkout.dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();

      const registration = registrationResponse(page);
      await checkout.dialog.getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
      const response = await registration;

      expect(response.status(), `${card.paymentStatus} should be refused`).toBe(500);
      const body = await response.json();
      expect(body.error?.code).toBe('PAYMENT_FAILED');

      // The user sees the translated message, never a raw code or a stack.
      await expect(page.getByText(/falha no processamento do pagamento/i).last()).toBeVisible();
      await expect(page.getByText(/PAYMENT_FAILED|UNKNOWN_ERROR/)).toHaveCount(0);

      // The overlay stays on the confirmation step so the purchase can be
      // retried, and nothing claims the ticket was issued.
      await expect(
        checkout.dialog.getByRole('button', { name: /confirmar e finalizar compra/i }).last(),
      ).toBeVisible();
      await expect(checkout.dialog.getByText(/compra realizada|solicita[cç][aã]o enviada/i)).toHaveCount(0);
      expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
    });
  }

  test('CONT (contingência) é aceito como pendente sem quebrar o checkout', async ({ page }, testInfo) => {
    // A pending payment is accepted, so the invite it leaves behind blocks a
    // second attempt with the same address.
    const email = smokeEmail('tc05-pending', testInfo.retry);
    const { checkout, pageErrors } = await fillCheckoutUpToConfirmation(
      page,
      requireCard(MERCADO_PAGO_CARDS.pending),
      email,
    );
    await checkout.fillCard(MERCADO_PAGO_CARDS.pending, email);
    await expect(checkout.dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();

    const registration = registrationResponse(page);
    await checkout.dialog.getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
    const response = await registration;

    // `CONT` settles as `pending` at Mercado Pago, which the backend accepts
    // (approved / authorized / pending all move the invite forward). This is
    // the one non-approved result that must NOT surface as a failure.
    expect(response.status(), 'CONT should be accepted as pending').toBe(200);
    await expect(checkout.dialog.getByText(/compra realizada/i).last()).toBeVisible();
    await expect(page.getByText(/falha no processamento do pagamento/i)).toHaveCount(0);
    expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
  });
});

test.describe('TC-05: bandeiras aceitas', () => {
  for (const brand of MERCADO_PAGO_BRANDS) {
    test(`${brand.label} é reconhecida e tokenizada`, async ({ page }) => {
      // The brand fixture is private, so it lives only in repository secrets.
      // Skipping is loud on purpose: the run reports the brand as uncovered
      // instead of passing silently.
      test.skip(
        !brand.isConfigured,
        `SMOKE_TEST_MP_${brand.envPrefix}_NUMBER / _SECURITY_CODE are not configured, so ${brand.label} was not exercised`,
      );

      // The brand cases never submit the purchase, so they create no records
      // and can share one address.
      const brandEmail = smokeEmail('tc05-brand');
      const { checkout, pageErrors } = await fillCheckoutUpToConfirmation(page, brand.card, brandEmail);

      // Both calls happen when the card form is submitted: the checkout
      // resolves the issuer from the BIN and only then asks for a token.
      const issuerLookup = page.waitForResponse((response) =>
        response.url().includes('/v1/payment_methods/search'),
      );
      const tokenization = page.waitForResponse((response) =>
        response.url().includes('/v1/card_tokens') && response.request().method() === 'POST',
      );

      await checkout.fillCard(brand.card, brandEmail);

      const issuerResponse = await issuerLookup;
      expect(issuerResponse.ok(), `Issuer lookup failed (${issuerResponse.status()})`).toBeTruthy();
      const paymentMethodId = (await issuerResponse.json()).results?.[0]?.id;
      expect(paymentMethodId, `No Mercado Pago payment method resolved for ${brand.label}`).toBeTruthy();
      expect(String(paymentMethodId)).toMatch(brand.expectedPaymentMethodId);

      const tokenResponse = await tokenization;
      expect(tokenResponse.ok(), `Tokenization failed (${tokenResponse.status()})`).toBeTruthy();

      // Reaching confirmation is what proves the token was accepted by the app.
      // The purchase is deliberately not finished: brand coverage is about the
      // card being usable, and TC-01 already covers a completed purchase.
      await expect(checkout.dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();
      expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
    });
  }
});
