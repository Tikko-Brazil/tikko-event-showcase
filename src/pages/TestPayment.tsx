import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const TestPayment = () => {
  const mpRef = useRef<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expirationMonth, setExpirationMonth] = useState("");
  const [expirationYear, setExpirationYear] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [identificationType, setIdentificationType] = useState("CPF");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load MercadoPago SDK
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      console.log("MercadoPago SDK loaded");
      initializeMercadoPago();
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeMercadoPago = () => {
    try {
      const mp = new window.MercadoPago("APP_USR-76122f1c-c643-41c2-937e-4f114917782f", {
        locale: "pt-BR",
      });
      mpRef.current = mp;
      console.log("MercadoPago initialized");
    } catch (error) {
      console.error("Error initializing MercadoPago:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!mpRef.current) {
        console.error("MercadoPago not initialized");
        return;
      }

      console.log("Creating card token...");

      const response = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardholder: {
          name: cardholderName,
        },
        securityCode: securityCode,
        expirationMonth: expirationMonth,
        expirationYear: expirationYear,
        identification: {
          type: identificationType,
          number: identificationNumber,
        },
      });

      console.log("Full Response:", response);

      if (response && response.id) {
        console.log("Card Token:", response.id);
        alert(`Token gerado com sucesso: ${response.id}`);
      } else {
        console.log("Response structure:", response);
        alert("Token gerado. Veja o console para detalhes.");
      }
    } catch (error) {
      console.error("Error creating card token:", error);
      alert(`Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Mercado Pago Payment (Direct API)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Number */}
              <div>
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    if (formatted.replace(/\s/g, "").length <= 16) {
                      setCardNumber(formatted);
                    }
                  }}
                  maxLength={19}
                  required
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <Label htmlFor="cardholderName">Titular do Cartão</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="Nome como está no cartão"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                />
              </div>

              {/* Expiration Date and Security Code */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expirationMonth">Mês</Label>
                  <Input
                    id="expirationMonth"
                    type="text"
                    placeholder="MM"
                    value={expirationMonth}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 2) {
                        setExpirationMonth(value);
                      }
                    }}
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expirationYear">Ano</Label>
                  <Input
                    id="expirationYear"
                    type="text"
                    placeholder="AAAA"
                    value={expirationYear}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        setExpirationYear(value);
                      }
                    }}
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="securityCode">CVV</Label>
                  <Input
                    id="securityCode"
                    type="text"
                    placeholder="123"
                    value={securityCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        setSecurityCode(value);
                      }
                    }}
                    maxLength={4}
                    required
                  />
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Identification Type */}
              <div>
                <Label htmlFor="identificationType">Tipo de Documento</Label>
                <select
                  id="identificationType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={identificationType}
                  onChange={(e) => setIdentificationType(e.target.value)}
                  required
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
                  placeholder="12345678900"
                  value={identificationNumber}
                  onChange={(e) => setIdentificationNumber(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Gerando Token..." : "Generate Token"}
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
                Validade: 11/2025
                <br />
                Nome: APRO (aprovado) ou OTHE (outro status)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPayment;
