import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCardPreview } from "@/components/CreditCardPreview";
import { CardBrandIcon } from "@/components/CreditCardPreview";
import {
  validateLuhn,
  detectCardBrand,
  formatCardNumber,
  getMaxCardLength,
  validateExpiry,
  validateCVV,
  CardBrandInfo,
} from "@/lib/cardUtils";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface FormErrors {
  cardNumber?: string;
  cardholderName?: string;
  expiry?: string;
  securityCode?: string;
  email?: string;
  identificationNumber?: string;
}

const TestPayment = () => {
  const mpRef = useRef<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [identificationType, setIdentificationType] = useState("CPF");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const brand: CardBrandInfo = detectCardBrand(cardNumber);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      try {
        const mp = new window.MercadoPago(
          "APP_USR-76122f1c-c643-41c2-937e-4f114917782f",
          { locale: "pt-BR" }
        );
        mpRef.current = mp;
      } catch (error) {
        console.error("Error initializing MercadoPago:", error);
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const validateField = useCallback(
    (field: string, value: string) => {
      const newErrors: FormErrors = { ...errors };

      switch (field) {
        case "cardNumber": {
          const digits = value.replace(/\s/g, "");
          if (!digits) {
            newErrors.cardNumber = "Número do cartão é obrigatório";
          } else if (digits.length < 13) {
            newErrors.cardNumber = "Número incompleto";
          } else if (!validateLuhn(digits)) {
            newErrors.cardNumber = "Número de cartão inválido";
          } else {
            delete newErrors.cardNumber;
          }
          break;
        }
        case "cardholderName":
          if (!value.trim()) {
            newErrors.cardholderName = "Nome do titular é obrigatório";
          } else if (value.trim().split(/\s+/).length < 2) {
            newErrors.cardholderName = "Informe nome e sobrenome";
          } else {
            delete newErrors.cardholderName;
          }
          break;
        case "expiry": {
          const result = validateExpiry(value);
          if (!result.valid) {
            newErrors.expiry = result.error;
          } else {
            delete newErrors.expiry;
          }
          break;
        }
        case "securityCode":
          if (!validateCVV(value, brand.cvvLength)) {
            newErrors.securityCode = `CVV deve ter ${brand.cvvLength} dígitos`;
          } else {
            delete newErrors.securityCode;
          }
          break;
        case "email":
          if (!value) {
            newErrors.email = "E-mail é obrigatório";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = "E-mail inválido";
          } else {
            delete newErrors.email;
          }
          break;
        case "identificationNumber":
          if (!value) {
            newErrors.identificationNumber = "Documento é obrigatório";
          } else {
            delete newErrors.identificationNumber;
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [errors, brand.cvvLength]
  );

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const currentBrand = detectCardBrand(raw);
    const maxDigits = currentBrand.brand === "amex" ? 15 : currentBrand.brand === "diners" ? 14 : 16;
    const trimmed = raw.slice(0, maxDigits);
    const formatted = formatCardNumber(trimmed, currentBrand.brand);
    setCardNumber(formatted);
    if (touched.cardNumber) validateField("cardNumber", formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d/]/g, "");
    // Remove extra slashes
    const slashCount = (value.match(/\//g) || []).length;
    if (slashCount > 1) return;

    const digits = value.replace(/\//g, "");
    if (digits.length > 4) return;

    if (digits.length >= 2 && !value.includes("/")) {
      value = digits.slice(0, 2) + "/" + digits.slice(2);
    }

    // Auto-add slash after typing 2 digits
    if (value.length === 2 && expiry.length === 1) {
      value = value + "/";
    }

    setExpiry(value);
    if (touched.expiry) validateField("expiry", value);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, brand.cvvLength);
    setSecurityCode(value);
    if (touched.securityCode) validateField("securityCode", value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate all fields
    const allTouched: Record<string, boolean> = {
      cardNumber: true,
      cardholderName: true,
      expiry: true,
      securityCode: true,
      email: true,
      identificationNumber: true,
    };
    setTouched(allTouched);

    let hasErrors = false;
    const fields = { cardNumber, cardholderName, expiry, securityCode, email, identificationNumber };
    for (const [field, value] of Object.entries(fields)) {
      if (!validateField(field, value)) hasErrors = true;
    }
    if (hasErrors) return;

    setIsLoading(true);
    try {
      if (!mpRef.current) {
        console.error("MercadoPago not initialized");
        return;
      }

      const [monthStr, yearStr] = expiry.split("/");
      const response = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardholder: { name: cardholderName },
        securityCode,
        expirationMonth: monthStr,
        expirationYear: `20${yearStr}`,
        identification: { type: identificationType, number: identificationNumber },
      });

      if (response?.id) {
        alert(`Token gerado com sucesso: ${response.id}`);
      } else {
        alert("Token gerado. Veja o console para detalhes.");
      }
    } catch (error) {
      console.error("Error creating card token:", error);
      alert(`Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string) =>
    touched[field] && errors[field as keyof FormErrors]
      ? errors[field as keyof FormErrors]
      : undefined;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Card Preview */}
        <CreditCardPreview
          cardNumber={formatCardNumber(cardNumber.replace(/\D/g, ""), brand.brand)}
          cardholderName={cardholderName}
          expiry={expiry}
          brand={brand}
          isFlipped={isFlipped}
          cvv={securityCode}
        />

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Cartão</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Number */}
              <div>
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onBlur={() => handleBlur("cardNumber", cardNumber)}
                    onFocus={() => setIsFlipped(false)}
                    maxLength={getMaxCardLength(brand.brand)}
                    className={`pr-14 ${getFieldError("cardNumber") ? "border-destructive" : ""}`}
                    autoComplete="cc-number"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <CardBrandIcon brand={brand} />
                  </div>
                </div>
                {getFieldError("cardNumber") && (
                  <p className="text-destructive text-sm mt-1">{getFieldError("cardNumber")}</p>
                )}
              </div>

              {/* Cardholder Name */}
              <div>
                <Label htmlFor="cardholderName">Titular do Cartão</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="Nome como está no cartão"
                  value={cardholderName}
                  onChange={(e) => {
                    setCardholderName(e.target.value);
                    if (touched.cardholderName) validateField("cardholderName", e.target.value);
                  }}
                  onBlur={() => handleBlur("cardholderName", cardholderName)}
                  onFocus={() => setIsFlipped(false)}
                  className={getFieldError("cardholderName") ? "border-destructive" : ""}
                  autoComplete="cc-name"
                />
                {getFieldError("cardholderName") && (
                  <p className="text-destructive text-sm mt-1">{getFieldError("cardholderName")}</p>
                )}
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    onBlur={() => handleBlur("expiry", expiry)}
                    onFocus={() => setIsFlipped(false)}
                    maxLength={5}
                    className={getFieldError("expiry") ? "border-destructive" : ""}
                    autoComplete="cc-exp"
                  />
                  {getFieldError("expiry") && (
                    <p className="text-destructive text-sm mt-1">{getFieldError("expiry")}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="securityCode">CVC/CVV</Label>
                  <Input
                    id="securityCode"
                    type="text"
                    inputMode="numeric"
                    placeholder={brand.brand === "amex" ? "0000" : "000"}
                    value={securityCode}
                    onChange={handleCVVChange}
                    onBlur={() => handleBlur("securityCode", securityCode)}
                    onFocus={() => setIsFlipped(true)}
                    maxLength={brand.cvvLength}
                    className={getFieldError("securityCode") ? "border-destructive" : ""}
                    autoComplete="cc-csc"
                  />
                  {getFieldError("securityCode") && (
                    <p className="text-destructive text-sm mt-1">{getFieldError("securityCode")}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateField("email", e.target.value);
                  }}
                  onBlur={() => handleBlur("email", email)}
                  className={getFieldError("email") ? "border-destructive" : ""}
                  autoComplete="email"
                />
                {getFieldError("email") && (
                  <p className="text-destructive text-sm mt-1">{getFieldError("email")}</p>
                )}
              </div>

              {/* Identification Type */}
              <div>
                <Label htmlFor="identificationType">Tipo de Documento</Label>
                <select
                  id="identificationType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={identificationType}
                  onChange={(e) => setIdentificationType(e.target.value)}
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                </select>
              </div>

              {/* Identification Number */}
              <div>
                <Label htmlFor="identificationNumber">Número do Documento</Label>
                <Input
                  id="identificationNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="12345678900"
                  value={identificationNumber}
                  onChange={(e) => {
                    setIdentificationNumber(e.target.value);
                    if (touched.identificationNumber) validateField("identificationNumber", e.target.value);
                  }}
                  onBlur={() => handleBlur("identificationNumber", identificationNumber)}
                  className={getFieldError("identificationNumber") ? "border-destructive" : ""}
                />
                {getFieldError("identificationNumber") && (
                  <p className="text-destructive text-sm mt-1">{getFieldError("identificationNumber")}</p>
                )}
              </div>

              {/* Save card checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="saveCard"
                  checked={saveCard}
                  onCheckedChange={(checked) => setSaveCard(checked === true)}
                />
                <Label htmlFor="saveCard" className="text-sm text-muted-foreground cursor-pointer">
                  Salvar informações do cartão. É confidencial.
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full gradient-button"
                disabled={isLoading}
              >
                {isLoading ? "Gerando Token..." : "Confirmar"}
              </Button>
            </form>

            {/* Test Card Info */}
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm font-semibold mb-2">Cartão de Teste:</p>
              <p className="text-xs text-muted-foreground">
                Número: 5031 4332 1540 6351
                <br />
                CVV: 123
                <br />
                Validade: 11/25
                <br />
                Nome: APRO TESTE (aprovado)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPayment;
