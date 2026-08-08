export type PaymentStatusCode = 'APRO' | 'OTHE' | 'CONT' | 'CALL' | 'FUND' | 'SECU' | 'EXPI' | 'FORM';

export type MercadoPagoCard = {
  number: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  paymentStatus: PaymentStatusCode;
  identification: string;
};

// Card numbers belong in GitHub Secrets or a developer-only .env file. Never commit them.
const expirationMonth = process.env.SMOKE_TEST_MP_CARD_EXPIRATION_MONTH || '11';
const expirationYear = process.env.SMOKE_TEST_MP_CARD_EXPIRATION_YEAR || '30';

// Mercado Pago decides the sandbox payment result from the *cardholder name*,
// not from the card number, so every status code can be exercised with a single
// card. `SMOKE_TEST_MP_<STATUS>_NUMBER` still overrides per status if a specific
// account ever needs it.
const baseCard = {
  number: process.env.SMOKE_TEST_MP_CARD_NUMBER || process.env.SMOKE_TEST_MP_APPROVED_NUMBER || '',
  securityCode:
    process.env.SMOKE_TEST_MP_CARD_SECURITY_CODE || process.env.SMOKE_TEST_MP_APPROVED_SECURITY_CODE || '',
  identification:
    process.env.SMOKE_TEST_MP_CARD_IDENTIFICATION ||
    process.env.SMOKE_TEST_MP_APPROVED_IDENTIFICATION ||
    '12345678909',
};

const cardFromEnvironment = (prefix: string, paymentStatus: PaymentStatusCode): MercadoPagoCard => ({
  number: process.env[`SMOKE_TEST_MP_${prefix}_NUMBER`] || baseCard.number,
  expirationMonth,
  expirationYear,
  securityCode: process.env[`SMOKE_TEST_MP_${prefix}_SECURITY_CODE`] || baseCard.securityCode,
  paymentStatus,
  identification: process.env[`SMOKE_TEST_MP_${prefix}_IDENTIFICATION`] || baseCard.identification,
});

export const MERCADO_PAGO_CARDS = {
  approved: cardFromEnvironment('APPROVED', 'APRO'),
  otherError: cardFromEnvironment('OTHER_ERROR', 'OTHE'),
  pending: cardFromEnvironment('PENDING', 'CONT'),
  callForAuthorization: cardFromEnvironment('CALL_FOR_AUTHORIZATION', 'CALL'),
  insufficientFunds: cardFromEnvironment('INSUFFICIENT_FUNDS', 'FUND'),
  securityCodeError: cardFromEnvironment('SECURITY_CODE_ERROR', 'SECU'),
  expired: cardFromEnvironment('EXPIRED', 'EXPI'),
  formError: cardFromEnvironment('FORM_ERROR', 'FORM'),
} as const;

export type MercadoPagoBrand = {
  key: string;
  label: string;
  /** Environment prefix holding the private fixture for this brand. */
  envPrefix: string;
  /** What `payment_methods/search` must resolve for this card's BIN. */
  expectedPaymentMethodId: RegExp;
  card: MercadoPagoCard;
  isConfigured: boolean;
};

const brandFromEnvironment = (
  key: string,
  label: string,
  envPrefix: string,
  expectedPaymentMethodId: RegExp,
): MercadoPagoBrand => {
  const card: MercadoPagoCard = {
    number: process.env[`SMOKE_TEST_MP_${envPrefix}_NUMBER`] || '',
    expirationMonth,
    expirationYear,
    securityCode: process.env[`SMOKE_TEST_MP_${envPrefix}_SECURITY_CODE`] || '',
    paymentStatus: 'APRO',
    identification: process.env[`SMOKE_TEST_MP_${envPrefix}_IDENTIFICATION`] || baseCard.identification,
  };
  return {
    key,
    label,
    envPrefix,
    expectedPaymentMethodId,
    card,
    isConfigured: Boolean(card.number && card.securityCode),
  };
};

// The brand matrix intentionally has no in-repo default: these numbers come from
// the private Mercado Pago fixture and must stay in repository secrets.
export const MERCADO_PAGO_BRANDS: MercadoPagoBrand[] = [
  brandFromEnvironment('mastercard', 'Mastercard', 'MASTERCARD', /master/i),
  brandFromEnvironment('visa', 'Visa', 'VISA', /visa/i),
  brandFromEnvironment('amex', 'American Express', 'AMEX', /amex/i),
  brandFromEnvironment('elo_debit', 'Elo débito', 'ELO_DEBIT', /elo/i),
];

export const requireCard = (card: MercadoPagoCard): MercadoPagoCard => {
  if (!card.number || !card.securityCode) {
    throw new Error('Mercado Pago test card secrets are not configured');
  }
  return card;
};
