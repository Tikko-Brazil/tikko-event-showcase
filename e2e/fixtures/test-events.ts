export const TEST_EVENT = {
  slug: process.env.SMOKE_TEST_EVENT_SLUG || '',
  id: Number(process.env.SMOKE_TEST_EVENT_ID) || 0,
  ticketPricingId: Number(process.env.SMOKE_TEST_TICKET_PRICING_ID) || 0,
  couponCode: process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100',
};

export const MANUAL_APPROVAL_EVENT = {
  slug: process.env.SMOKE_TEST_MANUAL_APPROVAL_EVENT_SLUG || '',
  id: Number(process.env.SMOKE_TEST_MANUAL_APPROVAL_EVENT_ID) || 0,
  ticketPricingId: Number(process.env.SMOKE_TEST_MANUAL_APPROVAL_TICKET_PRICING_ID) || 0,
  couponCode: process.env.SMOKE_TEST_COUPON_CODE || 'SMOKETEST100',
};
