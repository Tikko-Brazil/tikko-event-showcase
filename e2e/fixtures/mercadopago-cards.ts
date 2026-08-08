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
const cardFromEnvironment = (prefix: string, paymentStatus: PaymentStatusCode): MercadoPagoCard => ({
  number: process.env[`SMOKE_TEST_MP_${prefix}_NUMBER`] || '',
  expirationMonth: process.env.SMOKE_TEST_MP_CARD_EXPIRATION_MONTH || '11',
  expirationYear: process.env.SMOKE_TEST_MP_CARD_EXPIRATION_YEAR || '30',
  securityCode: process.env[`SMOKE_TEST_MP_${prefix}_SECURITY_CODE`] || '',
  paymentStatus,
  identification: process.env[`SMOKE_TEST_MP_${prefix}_IDENTIFICATION`] || '12345678909',
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

export const requireCard = (card: MercadoPagoCard): MercadoPagoCard => {
  if (!card.number || !card.securityCode) {
    throw new Error('Mercado Pago test card secrets are not configured');
  }
  return card;
};
