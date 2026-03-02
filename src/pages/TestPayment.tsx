import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputMask from "react-input-mask";
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
import { createCommonValidations, validateCNPJ } from "@/lib/validationSchemas";
import { useTranslation } from "react-i18next";
import {
  createCardToken
} from "@mercadopago/sdk-react";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const TestPayment = () => {
  const { t } = useTranslation();
  const mpRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [identificationType, setIdentificationType] = useState("CPF");
  const brand: CardBrandInfo = detectCardBrand(cardNumber);

  const commonValidations = createCommonValidations(t);

  const getValidationSchema = (identificationType: string) => Yup.object({
    cardNumber: Yup.string()
      .test("luhn", "Número de cartão inválido", (value) => {
        if (!value) return false;
        const digits = value.replace(/\s/g, "");
        return digits.length >= 13 && validateLuhn(digits);
      })
      .required("Número do cartão é obrigatório"),
    cardholderName: Yup.string()
      .test("full-name", "Informe nome e sobrenome", (value) => {
        if (!value) return false;
        return value.trim().split(/\s+/).length >= 2;
      })
      .required("Nome do titular é obrigatório"),
    expiry: Yup.string()
      .test("expiry", (value, context) => {
        if (!value) return context.createError({ message: "Validade é obrigatória" });
        const result = validateExpiry(value);
        return result.valid || context.createError({ message: result.error });
      })
      .required("Validade é obrigatória"),
    securityCode: Yup.string()
      .test("cvv", (value, context) => {
        if (!value) return context.createError({ message: "CVV é obrigatório" });
        return validateCVV(value, brand.cvvLength) || context.createError({ message: `CVV deve ter ${brand.cvvLength} dígitos` });
      })
      .required("CVV é obrigatório"),
    email: commonValidations.email,
    identificationType: Yup.string().required(),
    identificationNumber: identificationType === "CPF"
      ? commonValidations.cpf
      : Yup.string()
        .test("cnpj-validation", "CNPJ inválido", (value) => {
          if (!value) return false;
          return validateCNPJ(value);
        })
        .required("Documento é obrigatório"),
  });

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

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      if (!mpRef.current) {
        console.error("MercadoPago not initialized");
        return;
      }

      const [monthStr, yearStr] = values.expiry.split("/");
      const response = await mpRef.current.createCardToken({
        cardNumber: values.cardNumber.replace(/\s/g, ""),
        cardholder: { name: values.cardholderName },
        securityCode: values.securityCode,
        expirationMonth: monthStr,
        expirationYear: `20${yearStr}`,
        identification: { type: values.identificationType, number: values.identificationNumber },
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

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-lg mx-auto space-y-6">
        <Formik
          initialValues={{
            cardNumber: "",
            cardholderName: "",
            expiry: "",
            securityCode: "",
            email: "",
            identificationType: "CPF",
            identificationNumber: "",
          }}
          validationSchema={getValidationSchema(identificationType)}
          validateOnBlur={true}
          validateOnChange={false}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, handleChange, handleBlur, validateField, setFieldTouched }) => {
            const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const raw = e.target.value.replace(/\D/g, "");
              const currentBrand = detectCardBrand(raw);
              const maxDigits = currentBrand.brand === "amex" ? 15 : currentBrand.brand === "diners" ? 14 : 16;
              const trimmed = raw.slice(0, maxDigits);
              const formatted = formatCardNumber(trimmed, currentBrand.brand);
              setCardNumber(formatted);
              setFieldValue("cardNumber", formatted);
              if (touched.cardNumber) setTimeout(() => validateField("cardNumber"), 0);
            };

            const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value.replace(/[^\d/]/g, "");
              const slashCount = (value.match(/\//g) || []).length;
              if (slashCount > 1) return;

              const digits = value.replace(/\//g, "");
              if (digits.length > 4) return;

              if (digits.length >= 2 && !value.includes("/")) {
                value = digits.slice(0, 2) + "/" + digits.slice(2);
              }

              if (value.length === 2 && values.expiry.length === 1) {
                value = value + "/";
              }

              setFieldValue("expiry", value);
              if (touched.expiry) setTimeout(() => validateField("expiry"), 0);
            };

            const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, brand.cvvLength);
              setFieldValue("securityCode", value);
              if (touched.securityCode) setTimeout(() => validateField("securityCode"), 0);
            };

            const shouldShowError = (field: string) => touched[field] && errors[field];

            return (
              <>
                {/* Card Preview */}
                <CreditCardPreview
                  cardNumber={formatCardNumber(cardNumber.replace(/\D/g, ""), brand.brand)}
                  cardholderName={values.cardholderName}
                  expiry={values.expiry}
                  brand={brand}
                  isFlipped={isFlipped}
                  cvv={values.securityCode}
                />

                {/* Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dados do Cartão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            type="text"
                            inputMode="numeric"
                            placeholder="0000 0000 0000 0000"
                            value={values.cardNumber}
                            onChange={handleCardNumberChange}
                            onBlur={handleBlur}
                            onFocus={() => setIsFlipped(false)}
                            maxLength={getMaxCardLength(brand.brand)}
                            className={`pr-14 ${shouldShowError("cardNumber") ? "border-destructive" : ""}`}
                            autoComplete="cc-number"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <CardBrandIcon brand={brand} />
                          </div>
                        </div>
                        {shouldShowError("cardNumber") && (
                          <p className="text-destructive text-sm mt-1">{errors.cardNumber as string}</p>
                        )}
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <Label htmlFor="cardholderName">Titular do Cartão</Label>
                        <Field
                          as={Input}
                          id="cardholderName"
                          name="cardholderName"
                          type="text"
                          placeholder="Nome como está no cartão"
                          onFocus={() => setIsFlipped(false)}
                          className={shouldShowError("cardholderName") ? "border-destructive" : ""}
                          autoComplete="cc-name"
                        />
                        {shouldShowError("cardholderName") && (
                          <p className="text-destructive text-sm mt-1">{errors.cardholderName as string}</p>
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
                            value={values.expiry}
                            onChange={handleExpiryChange}
                            onBlur={handleBlur}
                            onFocus={() => setIsFlipped(false)}
                            maxLength={5}
                            className={shouldShowError("expiry") ? "border-destructive" : ""}
                            autoComplete="cc-exp"
                          />
                          {shouldShowError("expiry") && (
                            <p className="text-destructive text-sm mt-1">{errors.expiry as string}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="securityCode">CVC/CVV</Label>
                          <Input
                            id="securityCode"
                            type="text"
                            inputMode="numeric"
                            placeholder={brand.brand === "amex" ? "0000" : "000"}
                            value={values.securityCode}
                            onChange={handleCVVChange}
                            onBlur={handleBlur}
                            onFocus={() => setIsFlipped(true)}
                            maxLength={brand.cvvLength}
                            className={shouldShowError("securityCode") ? "border-destructive" : ""}
                            autoComplete="cc-csc"
                          />
                          {shouldShowError("securityCode") && (
                            <p className="text-destructive text-sm mt-1">{errors.securityCode as string}</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Field
                          as={Input}
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          className={shouldShowError("email") ? "border-destructive" : ""}
                          autoComplete="email"
                        />
                        {shouldShowError("email") && (
                          <p className="text-destructive text-sm mt-1">{errors.email as string}</p>
                        )}
                      </div>

                      {/* Identification Type */}
                      <div>
                        <Label htmlFor="identificationType">Tipo de Documento</Label>
                        <select
                          id="identificationType"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={values.identificationType}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setIdentificationType(newType);
                            setFieldValue("identificationType", newType);
                            setFieldValue("identificationNumber", "");
                            setFieldTouched("identificationNumber", false);
                          }}
                        >
                          <option value="CPF">CPF</option>
                          <option value="CNPJ">CNPJ</option>
                        </select>
                      </div>

                      {/* Identification Number */}
                      <div>
                        <Label htmlFor="identificationNumber">
                          {identificationType === "CPF" ? "CPF" : "CNPJ"}
                        </Label>
                        {identificationType === "CPF" ? (
                          <InputMask
                            mask="999.999.999-99"
                            value={values.identificationNumber}
                            onChange={(e) => {
                              handleChange("identificationNumber")(e);
                              if (touched.identificationNumber) {
                                setTimeout(() => validateField("identificationNumber"), 0);
                              }
                            }}
                            onBlur={handleBlur}
                          >
                            {(inputProps: any) => (
                              <Input
                                {...inputProps}
                                id="identificationNumber"
                                placeholder="000.000.000-00"
                                className={shouldShowError("identificationNumber") ? "border-destructive" : ""}
                              />
                            )}
                          </InputMask>
                        ) : (
                          <InputMask
                            mask="99.999.999/9999-99"
                            value={values.identificationNumber}
                            onChange={(e) => {
                              handleChange("identificationNumber")(e);
                              if (touched.identificationNumber) {
                                setTimeout(() => validateField("identificationNumber"), 0);
                              }
                            }}
                            onBlur={handleBlur}
                          >
                            {(inputProps: any) => (
                              <Input
                                {...inputProps}
                                id="identificationNumber"
                                placeholder="00.000.000/0000-00"
                                className={shouldShowError("identificationNumber") ? "border-destructive" : ""}
                              />
                            )}
                          </InputMask>
                        )}
                        {shouldShowError("identificationNumber") && (
                          <p className="text-destructive text-sm mt-1">{errors.identificationNumber as string}</p>
                        )}
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        className="w-full gradient-button"
                        disabled={isLoading}
                      >
                        {isLoading ? "Gerando Token..." : "Confirmar"}
                      </Button>
                    </Form>
                  </CardContent>
                </Card>
              </>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default TestPayment;
