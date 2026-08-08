import { expect, type Page } from '@playwright/test';
import type { MercadoPagoCard } from '../fixtures/mercadopago-cards';
import { TEST_USER } from '../fixtures/test-users';

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
    await this.dialog.locator('#instagram').fill('');

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

  async fillCard(card: MercadoPagoCard) {
    // Mercado Pago CardPayment Brick currently renders these fields in its
    // last iframe. The iframe itself has no stable public title; the field
    // names are the stable SDK contract used by the Playwright smoke test.
    const frame = this.page.frameLocator('iframe').last();
    await expect(this.page.locator('iframe').last()).toBeVisible();
    await frame.locator('input[name="cardNumber"]').fill(card.number);
    await frame.locator('input[name="expirationDate"]').fill(`${card.expirationMonth}/${card.expirationYear}`);
    await frame.locator('input[name="securityCode"]').fill(card.securityCode);
    await frame.locator('input[name="cardholderName"]').fill(`TEST ${card.paymentStatus}`);
    await frame.locator('input[name="identificationNumber"]').fill(card.identification);
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
