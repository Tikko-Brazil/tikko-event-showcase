import { expect, type Frame, type Locator, type Page } from '@playwright/test';
import type { MercadoPagoCard } from '../fixtures/mercadopago-cards';
import { TEST_USER } from '../fixtures/test-users';

// The Mercado Pago CardPayment Brick splits its form across several iframes
// (one per PCI field) plus inputs in the host document, and neither the iframe
// titles nor the field ids are a documented contract. Instead of pinning one
// layout, look the field up across every frame using its known aliases.
const FIELD_ALIASES: Record<string, string[]> = {
  cardNumber: ['cardNumber', 'card-number', 'cardNumberInput'],
  expirationDate: ['expirationDate', 'expiration-date', 'cardExpirationDate'],
  expirationMonth: ['expirationMonth', 'cardExpirationMonth'],
  expirationYear: ['expirationYear', 'cardExpirationYear'],
  securityCode: ['securityCode', 'security-code', 'cardSecurityCode'],
  cardholderName: ['cardholderName', 'cardholder-name'],
  cardholderEmail: ['cardholderEmail', 'cardholder-email', 'payerEmail'],
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
        })),
      );
      lines.push(`frame name=${JSON.stringify(frame.name())} url=${frame.url()} controls=${JSON.stringify(controls)}`);
    } catch (error) {
      lines.push(`frame name=${JSON.stringify(frame.name())} url=${frame.url()} unavailable=${String(error)}`);
    }
  }
  return lines.join('\n');
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
    await this.dialog.locator('#fullName').fill(user.fullName);
    await this.dialog.locator('#phone').fill(user.phone);
    await this.dialog.locator('#confirmPhone').fill(user.phone);
    await this.dialog.locator('#identification').fill(user.identification);
    await this.dialog.locator('#birthdate').fill(user.birthdate);
    // Instagram is a required field on this step; leaving it empty keeps the
    // step invalid and the Continue button disabled.
    await this.dialog.locator('#instagram').fill(user.instagram);

    const email = this.dialog.locator('#email');
    const confirmEmail = this.dialog.locator('#confirmEmail');
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await email.fill(user.email);
      await confirmEmail.fill(user.email);
      if (await email.inputValue() === user.email && await confirmEmail.inputValue() === user.email) break;
    }
    await this.dialog.locator('#instagram').press('Tab');
    await expect(email).toHaveValue(user.email);
    await expect(confirmEmail).toHaveValue(user.email);
    await expect(this.continueButton).toBeEnabled();
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

  private async typeBrickField(field: string, value: string, timeout: number): Promise<boolean> {
    const locator = await findBrickField(this.page, field, timeout);
    if (!locator) return false;
    await locator.click();
    await locator.fill('');
    // The Brick's PCI inputs mask and validate on keystrokes, so replay the
    // value as typing rather than setting it in one shot.
    await locator.pressSequentially(value, { delay: 40 });
    return true;
  }

  async fillCard(card: MercadoPagoCard, payerEmail = TEST_USER.email) {
    console.log(`[TC-01] checkout frames before filling the card:\n${await describeCheckoutFrames(this.page)}`);

    const missing: string[] = [];
    if (!(await this.typeBrickField('cardNumber', card.number, 30_000))) missing.push('cardNumber');

    const expiration = `${card.expirationMonth}/${card.expirationYear}`;
    if (!(await this.typeBrickField('expirationDate', expiration, 5_000))) {
      // Older Brick layouts split expiry into two inputs.
      const month = await this.typeBrickField('expirationMonth', card.expirationMonth, 5_000);
      const year = await this.typeBrickField('expirationYear', card.expirationYear, 5_000);
      if (!month || !year) missing.push('expirationDate');
    }

    if (!(await this.typeBrickField('securityCode', card.securityCode, 10_000))) missing.push('securityCode');
    if (!(await this.typeBrickField('cardholderName', `TEST ${card.paymentStatus}`, 10_000))) {
      missing.push('cardholderName');
    }
    if (!(await this.typeBrickField('identificationNumber', card.identification, 10_000))) {
      missing.push('identificationNumber');
    }
    // The payer email is only rendered when the Brick is not initialized with
    // one, so treat it as best-effort.
    await this.typeBrickField('cardholderEmail', payerEmail, 3_000);

    if (missing.length) {
      throw new Error(
        `Mercado Pago Brick fields not found: ${missing.join(', ')}\n${await describeCheckoutFrames(this.page)}`,
      );
    }

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
