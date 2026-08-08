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
    await this.dialog.locator('#email').fill(user.email);
    await this.dialog.locator('#confirmEmail').fill(user.email);
    await this.dialog.locator('#phone').fill(user.phone);
    await this.dialog.locator('#confirmPhone').fill(user.phone);
    await this.dialog.locator('#identification').fill(user.identification);
    await this.dialog.locator('#birthdate').fill(user.birthdate);
    await this.dialog.locator('#instagram').fill('');
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

  async fillPix(email = TEST_USER.email) {
    await this.dialog.locator('input[type="email"]').fill(email);
    await this.continueButton.click();
  }

  async fillCard(card: MercadoPagoCard) {
    const frame = this.page.frameLocator('iframe').last();
    await frame.locator('input[name="cardNumber"]').fill(card.number);
    await frame.locator('input[name="expirationDate"]').fill(`${card.expirationMonth}/${card.expirationYear}`);
    await frame.locator('input[name="securityCode"]').fill(card.securityCode);
    await frame.locator('input[name="cardholderName"]').fill(`TEST ${card.paymentStatus}`);
    await frame.locator('input[name="identificationNumber"]').fill(card.identification);
    await this.continueButton.click();
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
