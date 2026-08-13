export type SmokeEventFixture = {
  slug: string;
  id: number;
  ticketPricingId: number;
  couponCode: string;
};

/**
 * The deploy gate runs against an organization on the **fake payment
 * provider**: TC-04, TC-06, TC-07 and TC-08 only need a paid participant to
 * exist, and paying for it through the Mercado Pago sandbox made the gate as
 * reliable as that sandbox was on the day (TIK-34). Nothing about these events
 * reaches Mercado Pago except the card tokenization the browser does.
 */
export const TEST_EVENT: SmokeEventFixture = {
  slug: process.env.SMOKE_TEST_EVENT_SLUG || '',
  id: Number(process.env.SMOKE_TEST_EVENT_ID) || 0,
  ticketPricingId: Number(process.env.SMOKE_TEST_TICKET_PRICING_ID) || 0,
  couponCode: process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100',
};

export const MANUAL_APPROVAL_EVENT: SmokeEventFixture = {
  slug: process.env.SMOKE_TEST_MANUAL_APPROVAL_EVENT_SLUG || '',
  id: Number(process.env.SMOKE_TEST_MANUAL_APPROVAL_EVENT_ID) || 0,
  ticketPricingId: Number(process.env.SMOKE_TEST_MANUAL_APPROVAL_TICKET_PRICING_ID) || 0,
  couponCode: process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100',
};

/**
 * The Mercado Pago integration cases (TC-01, TC-02, TC-05) run against a
 * *different* organization — still `is_test`, so still the sandbox account, but
 * on `payment_provider = 'mercado_pago'`. Pointing them at the events above
 * would mean the fake provider answered and the suite reported Mercado Pago
 * coverage it no longer had.
 *
 * They are configured separately and on purpose: with these unset, the cases
 * report themselves as skipped instead of silently exercising the fake.
 */
export const MERCADO_PAGO_EVENT: SmokeEventFixture = {
  slug: process.env.SMOKE_TEST_MP_EVENT_SLUG || '',
  id: Number(process.env.SMOKE_TEST_MP_EVENT_ID) || 0,
  ticketPricingId: Number(process.env.SMOKE_TEST_MP_TICKET_PRICING_ID) || 0,
  couponCode: process.env.SMOKE_TEST_MP_COUPON_CODE || process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100',
};

export const MERCADO_PAGO_MANUAL_APPROVAL_EVENT: SmokeEventFixture = {
  slug: process.env.SMOKE_TEST_MP_MANUAL_APPROVAL_EVENT_SLUG || '',
  id: Number(process.env.SMOKE_TEST_MP_MANUAL_APPROVAL_EVENT_ID) || 0,
  ticketPricingId: Number(process.env.SMOKE_TEST_MP_MANUAL_APPROVAL_TICKET_PRICING_ID) || 0,
  couponCode: process.env.SMOKE_TEST_MP_COUPON_CODE || process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100',
};

/** Names the environment variables an event fixture is still missing, if any. */
export const missingEventConfiguration = (
  event: SmokeEventFixture,
  variables: { slug: string; id: string; ticketPricing: string },
): string[] =>
  [
    [variables.slug, event.slug],
    [variables.id, event.id],
    [variables.ticketPricing, event.ticketPricingId],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => String(name));

export const MERCADO_PAGO_EVENT_VARIABLES = {
  slug: 'SMOKE_TEST_MP_EVENT_SLUG',
  id: 'SMOKE_TEST_MP_EVENT_ID',
  ticketPricing: 'SMOKE_TEST_MP_TICKET_PRICING_ID',
};

export const MERCADO_PAGO_MANUAL_APPROVAL_EVENT_VARIABLES = {
  slug: 'SMOKE_TEST_MP_MANUAL_APPROVAL_EVENT_SLUG',
  id: 'SMOKE_TEST_MP_MANUAL_APPROVAL_EVENT_ID',
  ticketPricing: 'SMOKE_TEST_MP_MANUAL_APPROVAL_TICKET_PRICING_ID',
};
