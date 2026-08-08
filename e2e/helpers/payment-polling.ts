import { expect, type APIRequestContext } from '@playwright/test';
import { apiBaseUrl } from './auth';

export type PaymentState = {
  status?: string;
  payment_status?: string;
  [key: string]: unknown;
};

export async function pollPaymentStatus(
  request: APIRequestContext,
  paymentId: string | number,
  options: { timeoutMs?: number; intervalMs?: number; expectedStatuses?: string[] } = {},
) {
  const timeoutMs = options.timeoutMs ?? 120_000;
  const intervalMs = options.intervalMs ?? 5_000;
  const expectedStatuses = options.expectedStatuses ?? ['approved'];
  const deadline = Date.now() + timeoutMs;
  let lastState: PaymentState = {};

  while (Date.now() < deadline) {
    const response = await request.get(`${apiBaseUrl()}/public/payment/${paymentId}/status`);
    expect(response.ok(), `Payment status request failed (${response.status()})`).toBeTruthy();
    lastState = (await response.json()) as PaymentState;
    const status = String(lastState.status ?? lastState.payment_status ?? '').toLowerCase();
    if (expectedStatuses.some((expected) => expected.toLowerCase() === status)) return lastState;
    await new Promise((resolve) => setTimeout(resolve, Math.min(intervalMs, Math.max(0, deadline - Date.now()))));
  }

  throw new Error(`Payment ${paymentId} did not reach ${expectedStatuses.join(', ')}. Last state: ${JSON.stringify(lastState)}`);
}
