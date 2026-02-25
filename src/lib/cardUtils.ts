// Luhn algorithm validation
export const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, "");
  if (!/^\d+$/.test(digits) || digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Card brand detection
export type CardBrand = "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover" | "jcb" | "unknown";

export interface CardBrandInfo {
  brand: CardBrand;
  label: string;
  cvvLength: number;
  cardLength: number[];
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const brandConfigs: Record<CardBrand, Omit<CardBrandInfo, "brand">> = {
  visa: { label: "Visa", cvvLength: 3, cardLength: [16], color: "#1A1F71", gradientFrom: "from-blue-800", gradientTo: "to-blue-500" },
  mastercard: { label: "Mastercard", cvvLength: 3, cardLength: [16], color: "#EB001B", gradientFrom: "from-red-700", gradientTo: "to-orange-500" },
  amex: { label: "Amex", cvvLength: 4, cardLength: [15], color: "#006FCF", gradientFrom: "from-cyan-700", gradientTo: "to-blue-400" },
  elo: { label: "Elo", cvvLength: 3, cardLength: [16], color: "#000", gradientFrom: "from-yellow-600", gradientTo: "to-red-500" },
  hipercard: { label: "Hipercard", cvvLength: 3, cardLength: [16], color: "#822124", gradientFrom: "from-red-800", gradientTo: "to-red-500" },
  diners: { label: "Diners", cvvLength: 3, cardLength: [14], color: "#004080", gradientFrom: "from-slate-700", gradientTo: "to-slate-400" },
  discover: { label: "Discover", cvvLength: 3, cardLength: [16], color: "#FF6600", gradientFrom: "from-orange-600", gradientTo: "to-orange-400" },
  jcb: { label: "JCB", cvvLength: 3, cardLength: [16], color: "#003A80", gradientFrom: "from-green-700", gradientTo: "to-blue-500" },
  unknown: { label: "", cvvLength: 3, cardLength: [16], color: "#6B21A8", gradientFrom: "from-primary", gradientTo: "to-purple-400" },
};

export const detectCardBrand = (cardNumber: string): CardBrandInfo => {
  const digits = cardNumber.replace(/\s/g, "");

  const patterns: [RegExp, CardBrand][] = [
    // Elo (must be checked before Visa/Mastercard due to overlapping ranges)
    [/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/, "elo"],
    // Hipercard
    [/^(606282|3841)/, "hipercard"],
    // Amex
    [/^3[47]/, "amex"],
    // Diners
    [/^3(?:0[0-5]|[68])/, "diners"],
    // Discover
    [/^6(?:011|5)/, "discover"],
    // JCB
    [/^(?:2131|1800|35\d{3})/, "jcb"],
    // Mastercard (includes 50xx-55xx and 2221-2720)
    [/^5[0-5]|^2[2-7]/, "mastercard"],
    // Visa
    [/^4/, "visa"],
  ];

  for (const [pattern, brand] of patterns) {
    if (pattern.test(digits)) {
      return { brand, ...brandConfigs[brand] };
    }
  }

  return { brand: "unknown", ...brandConfigs.unknown };
};

// Format card number with spaces
export const formatCardNumber = (value: string, brand: CardBrand): string => {
  const digits = value.replace(/\D/g, "");
  if (brand === "amex") {
    // Amex: 4-6-5 format
    const parts = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)];
    return parts.filter(Boolean).join(" ");
  }
  // Standard: 4-4-4-4
  const chunks = digits.match(/.{1,4}/g);
  return chunks ? chunks.join(" ") : digits;
};

// Get max card number length (with spaces)
export const getMaxCardLength = (brand: CardBrand): number => {
  if (brand === "amex") return 17; // 15 digits + 2 spaces
  if (brand === "diners") return 17; // 14 digits + 3 spaces
  return 19; // 16 digits + 3 spaces
};

// Validate expiration date MM/YY
export const validateExpiry = (expiry: string): { valid: boolean; error: string } => {
  if (!expiry || expiry.length < 5) return { valid: false, error: "Preencha a data de validade" };

  const [monthStr, yearStr] = expiry.split("/");
  const month = parseInt(monthStr, 10);
  const year = parseInt(`20${yearStr}`, 10);

  if (month < 1 || month > 12) return { valid: false, error: "Mês inválido" };

  const now = new Date();
  const expDate = new Date(year, month);
  if (expDate <= now) return { valid: false, error: "Cartão vencido" };

  return { valid: true, error: "" };
};

// Validate CVV
export const validateCVV = (cvv: string, expectedLength: number): boolean => {
  return /^\d+$/.test(cvv) && cvv.length === expectedLength;
};
