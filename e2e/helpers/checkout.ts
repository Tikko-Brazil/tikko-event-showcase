import { expect, type Frame, type Locator, type Page } from '@playwright/test';
import type { MercadoPagoCard } from '../fixtures/mercadopago-cards';
import { TEST_USER } from '../fixtures/test-users';

// Field ids/names inside the Mercado Pago CardPayment Brick are not a
// documented contract, and depending on the SDK version the Brick renders its
// PCI inputs either in the host document or in one iframe per field. Rather
// than pin one layout, look each field up across every frame by alias.
//
// Observed in production (SDK currently in use, single frame, no iframes):
//   #cardNumber  #expiry  #securityCode  #cardholderName
//   #email  select#identificationType  #identificationNumber
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
    // The Brick re-creates its frames while it boots; a detached frame is
    // expected here and simply means "not this one".
  }
  return null;
}

async function findBrickField(page: Page, field: string, timeout: number): Promise<Locator | null> {
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
 * Inventory of every frame and form control currently on the page. The Brick's
 * real DOM is only observable in CI (the smoke config lives in repository
 * secrets), so this is logged on the payment step to keep the selectors above
 * verifiable from the workflow log.
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
 * The credit card step swallows its failures: `createPayment` only
 * `console.error`s when the Brick's `getFormData()` rejects, so without this
 * a tokenization failure is invisible from the outside. Mirror the browser
 * console and failing Mercado Pago calls into the test output.
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
    await this.dialog.locator('input[type="email"]').fill(email);
    await this.continueButton.click();
  }

  private async typeBrickField(field: string, value: string, timeout: number): Promise<Locator | null> {
    const locator = await findBrickField(this.page, field, timeout);
    if (!locator) return null;
    // Changing the document type re-renders the fields below it, so a value
    // can be dropped right after it is typed. Retry until it sticks.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await locator.click();
      await locator.fill('');
      // The Brick's inputs mask and validate on keystrokes, so replay the
      // value as typing rather than setting it in one shot.
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
        // Not every Brick version renders a document-type select.
      }
    }
  }

  private async fillExpiration(card: MercadoPagoCard): Promise<boolean> {
    // The field is masked as MM/YY, so type the digits and let the mask insert
    // the separator; fall back to the explicit form if it did not.
    const locator = await this.typeBrickField(
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
    // Older Brick layouts split expiry into two inputs.
    const month = await this.typeBrickField('expirationMonth', card.expirationMonth, 5_000);
    const year = await this.typeBrickField('expirationYear', card.expirationYear, 5_000);
    return Boolean(month && year);
  }

  async fillCard(card: MercadoPagoCard, payerEmail = TEST_USER.email) {
    console.log(`[TC-01] checkout frames before filling the card:\n${await describeCheckoutFrames(this.page)}`);

    const unfilled: string[] = [];
    if (!(await this.typeBrickField('cardNumber', card.number, 30_000))) unfilled.push('cardNumber');
    if (!(await this.fillExpiration(card))) unfilled.push('expirationDate');

    if (!(await this.typeBrickField('securityCode', card.securityCode, 10_000))) unfilled.push('securityCode');
    // Mercado Pago drives the sandbox payment outcome from the cardholder
    // name, so the status code has to lead; the checkout also requires a
    // surname.
    if (!(await this.typeBrickField('cardholderName', `${card.paymentStatus} Teste`, 10_000))) {
      unfilled.push('cardholderName');
    }
    if (!(await this.typeBrickField('cardholderEmail', payerEmail, 10_000))) unfilled.push('cardholderEmail');

    await this.selectDocumentType();
    if (!(await this.typeBrickField('identificationNumber', card.identification, 10_000))) {
      unfilled.push('identificationNumber');
    }

    if (unfilled.length) {
      throw new Error(
        `Mercado Pago Brick fields missing or empty: ${unfilled.join(', ')}\n${await describeCheckoutFrames(this.page)}`,
      );
    }

    console.log(`[TC-01] checkout frames after filling the card:\n${await describeCheckoutFrames(this.page)}`);
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

export async function cleanupTestData(
  request: import('@playwright/test').APIRequestContext,
  eventIds: number[],
  userEmail = TEST_USER.email,
) {
  const endpoint = process.env.SMOKE_TEST_CLEANUP_URL;
  if (!endpoint) return;
  const response = await request.post(endpoint, { data: { event_ids: eventIds, user_email: userEmail } });
  expect(response.ok(), `Smoke test cleanup failed (${response.status()})`).toBeTruthy();
}
