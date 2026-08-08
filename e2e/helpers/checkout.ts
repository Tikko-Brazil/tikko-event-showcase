import { expect, type Frame, type Locator, type Page } from '@playwright/test';
import type { MercadoPagoCard } from '../fixtures/mercadopago-cards';
import { TEST_USER, smokeIdentification } from '../fixtures/test-users';

// The checkout renders its own card form and tokenizes through the Mercado
// Pago REST API, so the fields live in the host document:
//   #cardNumber  #expiry  #securityCode  #cardholderName
//   #email  select#identificationType  #identificationNumber
// The lookup still scans every frame by alias so the helper keeps working if
// the form is ever swapped back for an SDK widget that renders in iframes.
const FIELD_ALIASES: Record<string, string[]> = {
  cardNumber: ['cardNumber', 'card-number', 'cardNumberInput'],
  expirationDate: ['expiry', 'expirationDate', 'expiration-date', 'cardExpirationDate'],
  expirationMonth: ['expirationMonth', 'cardExpirationMonth'],
  expirationYear: ['expirationYear', 'cardExpirationYear'],
  securityCode: ['securityCode', 'security-code', 'cardSecurityCode'],
  cardholderName: ['cardholderName', 'cardholder-name'],
  cardholderEmail: ['cardholderEmail', 'cardholder-email', 'payerEmail', 'email'],
  identificationNumber: ['identificationNumber', 'identification-number', 'docNumber'],
};

const selectorsFor = (field: string): string[] => {
  const aliases = FIELD_ALIASES[field] || [field];
  return [
    ...aliases.map((alias) => `input[name="${alias}"]`),
    ...aliases.map((alias) => `input[id="${alias}"]`),
    ...aliases.map((alias) => `input[data-checkout="${alias}"]`),
    ...aliases.map((alias) => `input[name*="${alias}" i]`),
    ...aliases.map((alias) => `input[id*="${alias}" i]`),
  ];
};

async function firstVisible(frame: Frame, selector: string): Promise<Locator | null> {
  try {
    const locator = frame.locator(selector).first();
    if ((await locator.count()) > 0 && (await locator.isVisible())) return locator;
  } catch {
    // A frame can detach while the page is still settling; that is expected
    // here and simply means "not this one".
  }
  return null;
}

async function findCardField(page: Page, field: string, timeout: number): Promise<Locator | null> {
  const deadline = Date.now() + timeout;
  do {
    // Selector priority is global: an exact `name` match anywhere beats a
    // fuzzy match in the frame that happened to be scanned first.
    for (const selector of selectorsFor(field)) {
      for (const frame of page.frames()) {
        const locator = await firstVisible(frame, selector);
        if (locator) return locator;
      }
    }
    await page.waitForTimeout(250);
  } while (Date.now() < deadline);
  return null;
}

/**
 * Inventory of every frame and form control currently on the page. The payment
 * step is only reachable in CI (the smoke config lives in repository secrets),
 * so this is logged there to keep the selectors above verifiable from the
 * workflow log.
 */
export async function describeCheckoutFrames(page: Page): Promise<string> {
  const lines: string[] = [];
  for (const frame of page.frames()) {
    try {
      const controls = await frame.evaluate(() =>
        Array.from(document.querySelectorAll('input, select')).map((element) => ({
          tag: element.tagName.toLowerCase(),
          type: element.getAttribute('type'),
          name: element.getAttribute('name'),
          id: element.id || null,
          placeholder: element.getAttribute('placeholder'),
          dataCheckout: element.getAttribute('data-checkout'),
          // Digits and letters are redacted: the pattern is enough to tell
          // whether a field was filled and how its mask formatted the value,
          // without putting card or payer data in a public workflow log.
          valuePattern: ((element as HTMLInputElement).value || '')
            .replace(/\d/g, '#')
            .replace(/[A-Za-z]/g, 'a'),
        })),
      );
      lines.push(`frame name=${JSON.stringify(frame.name())} url=${frame.url()} controls=${JSON.stringify(controls)}`);
    } catch (error) {
      lines.push(`frame name=${JSON.stringify(frame.name())} url=${frame.url()} unavailable=${String(error)}`);
    }
  }
  return lines.join('\n');
}

/**
 * The credit card step swallows its failures: `handleCreditSubmit` only
 * `console.error`s when tokenization rejects, so without this a failure is
 * invisible from the outside. Mirror the browser console and failing Mercado
 * Pago calls into the test output.
 */
export function attachCheckoutDiagnostics(page: Page) {
  const redact = (text: string) => text.replace(/\d{6,}/g, (match) => `<${match.length} digits>`);

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      console.log(`[browser:${message.type()}] ${redact(message.text())}`);
    }
  });
  page.on('pageerror', (error) => console.log(`[browser:pageerror] ${redact(String(error))}`));
  page.on('response', async (response) => {
    if (response.status() < 400 || !/mercadopago/i.test(response.url())) return;
    let body = '';
    try {
      body = (await response.text()).slice(0, 500);
    } catch {
      body = '<unavailable>';
    }
    const path = new URL(response.url()).pathname;
    console.log(`[mercadopago] ${response.status()} ${path} ${redact(body)}`);
  });
}

/**
 * Uncaught exceptions raised by the app while a test runs. A rejected payment
 * must surface as a message, never as a broken page, so the failure cases
 * assert this list stayed empty.
 */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  return errors;
}

export type SmokeEvent = { slug: string; id: number; ticketPricingId: number };

/**
 * A full card checkout, from the event page to the registration response. The
 * organizer specs need a real paid participant before they have anything to
 * accept, reject or refund, so the buyer half of those flows lives here rather
 * than being copied into each one.
 */
export async function purchaseWithCard(
  page: Page,
  event: SmokeEvent,
  email: string,
  card: MercadoPagoCard,
) {
  attachCheckoutDiagnostics(page);
  await openEventCheckout(page, event.slug, event.ticketPricingId);

  // One document per buyer: a run pays a dozen times with the same card, and
  // repeating the payer on top of that gets the later payments refused as
  // duplicates.
  const identification = smokeIdentification(email);

  const checkout = new CheckoutPage(page);
  await checkout.acceptTerms();
  await checkout.fillUserInfo({ email, identification });
  await checkout.skipCoupon();
  await checkout.selectPaymentMethod('credit');
  await checkout.fillCard({ ...card, identification }, email);

  try {
    await expect(checkout.dialog.getByText(/confirma[cç][aã]o da compra/i)).toBeVisible();
  } catch (error) {
    // Tokenization failures leave the card form on screen with inline errors,
    // and this step only ever runs in CI — dump the DOM before rethrowing.
    console.log(`[checkout] frames after submitting the card:\n${await describeCheckoutFrames(page)}`);
    console.log(`[checkout] dialog text after submitting the card:\n${await checkout.dialog.innerText()}`);
    throw error;
  }

  const registration = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/public/user/register-and-join-event' &&
      response.request().method() === 'POST',
  );
  await checkout.dialog.getByRole('button', { name: /confirmar e finalizar compra/i }).last().click();
  const response = await registration;
  expect(response.ok(), `Registration failed (${response.status()})`).toBeTruthy();

  const body = await response.json();
  const data = (body.data ?? body) as { user_id: number; event_id: number; payment_id?: string };
  expect(data.user_id, 'Registration did not return the buyer user id').toBeTruthy();

  return { checkout, response, data };
}

/** Select the smoke ticket on an event page and open the checkout overlay. */
export async function openEventCheckout(page: Page, slug: string, ticketPricingId: number) {
  await page.goto(`/event/${slug}`);
  // Ticket pricing IDs are numeric, so use an attribute selector instead of
  // a CSS id selector (CSS selectors cannot start with a digit).
  const ticket = page.locator(`[id="${ticketPricingId}"]`);
  await expect(ticket).toBeVisible();
  await ticket.check();
  await page.getByRole('button', { name: /continuar para pagamento/i }).click();
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get dialog() { return this.page.getByRole('dialog'); }
  get continueButton() { return this.dialog.getByRole('button', { name: /continuar/i }); }

  async openEvent(slug: string) {
    await this.page.goto(`/event/${slug}`);
    await expect(this.page).toHaveURL(new RegExp(`/event/${slug}`));
  }

  async acceptTerms() {
    await this.dialog.getByRole('checkbox').check();
    await this.continueButton.click();
  }

  async fillUserInfo(overrides: Partial<typeof TEST_USER> = {}) {
    const user = { ...TEST_USER, ...overrides };
    // The coupled email fields can be reinitialized by their Formik parent
    // while focus moves between inputs, which silently drops a value and
    // leaves the step invalid. Filling is idempotent, so retry the whole form
    // until Formik actually enables the next step.
    await expect(async () => {
      await this.dialog.locator('#fullName').fill(user.fullName);
      await this.dialog.locator('#phone').fill(user.phone);
      await this.dialog.locator('#confirmPhone').fill(user.phone);
      await this.dialog.locator('#identification').fill(user.identification);
      await this.dialog.locator('#birthdate').fill(user.birthdate);
      // Instagram is required on this step; leaving it empty keeps the step
      // invalid and the Continue button disabled.
      await this.dialog.locator('#instagram').fill(user.instagram);
      await this.dialog.locator('#email').fill(user.email);
      await this.dialog.locator('#confirmEmail').fill(user.email);
      // The form validates on blur; leave the last field before asserting.
      await this.dialog.locator('#instagram').press('Tab');

      await expect(this.dialog.locator('#email')).toHaveValue(user.email, { timeout: 2_000 });
      await expect(this.dialog.locator('#confirmEmail')).toHaveValue(user.email, { timeout: 2_000 });
      await expect(this.continueButton).toBeEnabled({ timeout: 2_000 });
    }).toPass({ timeout: 45_000 });

    await this.continueButton.click();
  }

  async applyCoupon(code: string) {
    await this.dialog.locator('#coupon').fill(code);
    await this.dialog.getByRole('button', { name: /aplicar/i }).click();
    await expect(this.dialog.getByText(new RegExp(`cupom ${code}`, 'i'))).toBeVisible();
    await this.continueButton.click();
  }

  async choosePaymentMethod(method: 'credit' | 'pix') {
    await this.dialog.getByRole('radio', { name: method === 'credit' ? /cartão/i : /pix/i }).check();
    await this.continueButton.click();
  }

  async skipCoupon() {
    await this.continueButton.click();
  }

  async fillPix(email = TEST_USER.email) {
    await this.dialog.locator('#payerEmail').fill(email);
    // Two buttons are labelled "Continuar para Confirmação" on this step — the
    // one in the price summary and the Pix form's own submit. Only the form's
    // is scoped to a <form>, so target that one and avoid a strict-mode clash.
    await this.dialog.locator('form button[type="submit"]').click();
  }

  private async typeCardField(field: string, value: string, timeout: number): Promise<Locator | null> {
    const locator = await findCardField(this.page, field, timeout);
    if (!locator) return null;
    // Changing the document type re-renders the fields below it, so a value
    // can be dropped right after it is typed. Retry until it sticks.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await locator.click();
      await locator.fill('');
      // The inputs mask and validate on keystrokes, so replay the value as
      // typing rather than setting it in one shot.
      await locator.pressSequentially(value, { delay: 40 });
      if ((await locator.inputValue()).trim() !== '') return locator;
    }
    return null;
  }

  private async selectDocumentType() {
    // Must happen before the document number is typed: switching the type
    // clears the number field.
    for (const frame of this.page.frames()) {
      const select = frame.locator('select#identificationType, select[name="identificationType"]').first();
      try {
        if ((await select.count()) > 0 && (await select.isVisible())) {
          await select.selectOption('CPF');
          return;
        }
      } catch {
        // Not every layout renders a document-type select.
      }
    }
  }

  private async fillExpiration(card: MercadoPagoCard): Promise<boolean> {
    // The field is masked as MM/YY, so type the digits and let the mask insert
    // the separator; fall back to the explicit form if it did not.
    const locator = await this.typeCardField(
      'expirationDate',
      `${card.expirationMonth}${card.expirationYear}`,
      10_000,
    );
    if (locator) {
      if (!/\d{2}\D?\d{2}/.test(await locator.inputValue())) {
        await locator.fill('');
        await locator.pressSequentially(`${card.expirationMonth}/${card.expirationYear}`, { delay: 40 });
      }
      return true;
    }
    // Some layouts split expiry into two inputs.
    const month = await this.typeCardField('expirationMonth', card.expirationMonth, 5_000);
    const year = await this.typeCardField('expirationYear', card.expirationYear, 5_000);
    return Boolean(month && year);
  }

  async fillCard(card: MercadoPagoCard, payerEmail = TEST_USER.email) {
    console.log(`[checkout] frames before filling the card:\n${await describeCheckoutFrames(this.page)}`);

    const unfilled: string[] = [];
    if (!(await this.typeCardField('cardNumber', card.number, 30_000))) unfilled.push('cardNumber');
    if (!(await this.fillExpiration(card))) unfilled.push('expirationDate');

    if (!(await this.typeCardField('securityCode', card.securityCode, 10_000))) unfilled.push('securityCode');
    // Mercado Pago drives the sandbox payment outcome from the cardholder
    // name, so the status code has to lead; the checkout also requires a
    // surname.
    if (!(await this.typeCardField('cardholderName', `${card.paymentStatus} Teste`, 10_000))) {
      unfilled.push('cardholderName');
    }
    if (!(await this.typeCardField('cardholderEmail', payerEmail, 10_000))) unfilled.push('cardholderEmail');

    await this.selectDocumentType();
    if (!(await this.typeCardField('identificationNumber', card.identification, 10_000))) {
      unfilled.push('identificationNumber');
    }

    if (unfilled.length) {
      throw new Error(
        `Card form fields missing or empty: ${unfilled.join(', ')}\n${await describeCheckoutFrames(this.page)}`,
      );
    }

    console.log(`[checkout] frames after filling the card:\n${await describeCheckoutFrames(this.page)}`);
    await this.continueButton.click();
  }

  selectPaymentMethod(method: 'credit' | 'pix') {
    return this.choosePaymentMethod(method);
  }

  fillCreditCard(card: MercadoPagoCard) {
    return this.fillCard(card);
  }

  async confirm() {
    await this.dialog.getByRole('button', { name: /finalizar|confirmar|pagar/i }).click();
  }

  async expectSuccess() {
    await expect(this.dialog.getByText(/sucesso|inscri[çc][ãa]o realizada|ingresso/i).last()).toBeVisible();
  }
}

/**
 * Removes the participations, invites, tickets and users a smoke run created,
 * and gives back the coupon uses it consumed. A run can touch several e-mails
 * (a checkout that succeeds and one that is refused must not share a
 * participation), so every address is cleaned in turn.
 *
 * The endpoint is destructive and lives in production, so it is guarded by a
 * shared secret: `SMOKE_TEST_CLEANUP_TOKEN` has to match the backend's, or the
 * call comes back 401 and the `afterAll` fails.
 *
 * Without `SMOKE_TEST_CLEANUP_URL` this is a no-op and each run leaves its
 * records behind — which is why the e-mails are unique per run.
 */
export async function cleanupTestData(
  request: import('@playwright/test').APIRequestContext,
  eventIds: number[],
  userEmails: string | string[] = TEST_USER.email,
) {
  const endpoint = process.env.SMOKE_TEST_CLEANUP_URL;
  if (!endpoint) {
    console.log('[cleanup] SMOKE_TEST_CLEANUP_URL is not configured; smoke records were left in place');
    return;
  }

  const token = process.env.SMOKE_TEST_CLEANUP_TOKEN;
  expect(
    token,
    'SMOKE_TEST_CLEANUP_URL is configured but SMOKE_TEST_CLEANUP_TOKEN is not; the endpoint would answer 401',
  ).toBeTruthy();

  for (const userEmail of [...new Set([userEmails].flat())]) {
    const response = await request.post(endpoint, {
      headers: { 'X-Smoke-Cleanup-Token': token as string },
      data: { event_ids: eventIds, user_email: userEmail },
    });
    expect(response.ok(), `Smoke test cleanup failed for ${userEmail} (${response.status()})`).toBeTruthy();
    console.log(`[cleanup] ${userEmail}: ${await response.text()}`);
  }
}
