import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputMask from "react-input-mask";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCardPreview } from "@/components/CreditCardPreview";
import { CardBrandIcon } from "@/components/CreditCardPreview";
import { CreditCard, Smartphone } from "lucide-react";
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

interface PaymentInfoStepProps {
  paymentMethod: "credit" | "pix" | "";
  ticketPrice: number;
  onNext: () => void;
  onPaymentDataChange?: (data: any) => void;
  creditPaymentRef?: React.MutableRefObject<(() => void) | null>;
  pixPaymentRef?: React.MutableRefObject<(() => void) | null>;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const PaymentInfoStepTest: React.FC<PaymentInfoStepProps> = ({
  paymentMethod,
  ticketPrice,
  onNext,
  onPaymentDataChange,
  creditPaymentRef,
  pixPaymentRef,
}) => {
  const { t } = useTranslation();
  const mpRef = useRef<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [identificationType, setIdentificationType] = useState("CPF");
  const pixFormRef = useRef<any>(null);
  const creditFormRef = useRef<any>(null);
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

  const pixPaymentSchema = Yup.object({
    payerEmail: commonValidations.email,
  });

  useEffect(() => {
    if (paymentMethod !== "credit") return;

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
  }, [paymentMethod]);

  const handleCreditSubmit = async (values: any) => {
    try {
      if (!mpRef.current) {
        console.error("MercadoPago not initialized");
        return;
      }

      const [monthStr, yearStr] = values.expiry.split("/");
      const cardNumberClean = values.cardNumber.replace(/\s/g, "");
      
      const response = await mpRef.current.createCardToken({
        card_number: cardNumberClean,
        cardholder: {
          name: values.cardholderName,
          identification: {
            type: values.identificationType,
            number: values.identificationNumber.replace(/[^\d]/g, "")
          }
        },
        security_code: values.securityCode,
        expiration_month: monthStr,
        expiration_year: `20${yearStr}`,
      });

      if (response?.id) {
        // Get payment method from MercadoPago
        let paymentMethodId = "credit_card";
        let issuerId = 0;
        
        try {
          const bin = cardNumberClean.substring(0, 6);
          const paymentMethods = await mpRef.current.getPaymentMethods({ bin });
          
          if (paymentMethods?.results?.length > 0) {
            const method = paymentMethods.results[0];
            paymentMethodId = method.id;
            
            // Get issuer
            if (method.issuer?.id) {
              issuerId = method.issuer.id;
            }
          }
        } catch (error) {
          console.error("Error getting payment methods:", error);
        }
        
        const paymentData = {
          paymentMethod: "credit",
          cardInfo: {
            formData: {
              token: response.id,
              payment_method_id: paymentMethodId,
              issuer_id: issuerId,
              installments: 1,
              payer: {
                email: values.email,
                identification: {
                  type: values.identificationType,
                  number: values.identificationNumber.replace(/[^\d]/g, "")
                }
              }
            }
          }
        };
        onPaymentDataChange?.(paymentData);
        onNext();
      }
    } catch (error) {
      console.error("Error creating card token:", error);
    }
  };

  const handlePixPaymentSubmit = (values: any) => {
    const paymentData = {
      paymentMethod: "pix",
      pixInfo: values,
      cardInfo: {
        formData: {
          payment_method_id: "pix",
        },
      },
    };
    onPaymentDataChange?.(paymentData);
    onNext();
  };

  // Expose submit functions to parent
  useEffect(() => {
    if (creditPaymentRef && paymentMethod === "credit") {
      creditPaymentRef.current = () => creditFormRef.current?.submitForm();
    }
    if (pixPaymentRef && paymentMethod === "pix") {
      pixPaymentRef.current = () => pixFormRef.current?.submitForm();
    }
  }, [creditPaymentRef, pixPaymentRef, paymentMethod]);

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {paymentMethod === "credit" ? (
              <>
                <CreditCard className="w-5 h-5" />
                Informações do Cartão
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                Informações do PIX
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethod === "credit" ? (
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
              onSubmit={handleCreditSubmit}
              innerRef={creditFormRef}
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
                    {false && (<CreditCardPreview
                      cardNumber={formatCardNumber(cardNumber.replace(/\D/g, ""), brand.brand)}
                      cardholderName={values.cardholderName}
                      expiry={values.expiry}
                      brand={brand}
                      isFlipped={isFlipped}
                      cvv={values.securityCode}
                    />)}


                    <Form className="space-y-4 pb-32 lg:pb-1">
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
                    </Form>
                  </>
                );
              }}
            </Formik>
          ) : (
            <Formik
              initialValues={{ payerEmail: "" }}
              validationSchema={pixPaymentSchema}
              onSubmit={handlePixPaymentSubmit}
              innerRef={pixFormRef}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <Label htmlFor="payerEmail">E-mail do Pagador *</Label>
                    <Field
                      as={Input}
                      id="payerEmail"
                      name="payerEmail"
                      type="email"
                      placeholder="seu@email.com"
                      className={
                        errors.payerEmail && touched.payerEmail
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors.payerEmail && touched.payerEmail && (
                      <div className="text-destructive text-sm mt-1">
                        {errors.payerEmail as string}
                      </div>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
