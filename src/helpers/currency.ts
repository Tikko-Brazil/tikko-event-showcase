/**
 * Convert a decimal value to cents (integer)
 * @param value - The decimal value (e.g., 10.50)
 * @returns The value in cents (e.g., 1050)
 */
export const toCents = (value: number): number => {
  return Math.round(value * 100);
};

/**
 * Convert cents (integer) to decimal value
 * @param cents - The value in cents (e.g., 1050)
 * @returns The decimal value (e.g., 10.50)
 */
export const fromCents = (cents: number): number => {
  return cents / 100;
};

/**
 * Format cents as currency string
 * @param cents - The value in cents (e.g., 1050)
 * @param locale - The locale to use (e.g., 'pt-BR', 'en-US')
 * @returns Formatted currency string (e.g., "R$ 10,50" or "$10.50")
 */
export const formatCurrency = (cents: number, locale: string = 'pt-BR'): string => {
  const value = fromCents(cents);
  const currency = locale === 'pt-BR' ? 'BRL' : 'USD';
  return value.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
  });
};
