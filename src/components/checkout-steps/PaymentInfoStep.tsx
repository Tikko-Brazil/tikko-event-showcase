import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CardPayment } from "@mercadopago/sdk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Smartphone } from "lucide-react";
import {
  IAdditionalData,
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/esm/bricks/cardPayment/type";

interface PaymentInfoStepProps {
  paymentMethod: "credit" | "pix" | "";
  ticketPrice: number;
  onNext: () => void;
  onPaymentDataChange?: (data: any) => void;
}

const pixPaymentSchema = Yup.object({
  payerEmail: Yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),
});

export const PaymentInfoStep: React.FC<PaymentInfoStepProps> = ({
  paymentMethod,
  ticketPrice,
  onNext,
  onPaymentDataChange,
}) => {
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  const createPayment = () => {
    setIsProcessingCard(true);
    (window as any).cardPaymentBrickController
      .getFormData()
      .then((cardFormData: any) => {
        if (!cardFormData) {
          return;
        }
        const paymentData = {
          paymentMethod: "credit",
          cardInfo: { formData: cardFormData },
        };
        onPaymentDataChange?.(paymentData);
        onNext();
      })
      .catch((error: any) => {
        console.error("Card payment error:", error);
      })
      .finally(() => {
        setIsProcessingCard(false);
      });
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

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
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
            <div className="space-y-4 pb-32 lg:pb-4">
              <CardPayment
                initialization={{ amount: ticketPrice }}
                customization={{
                  visual: {
                    style: {
                      theme: "dark",
                      customVariables: {
                        formBackgroundColor: "hsl(224, 71%, 4%)", // --card
                        errorColor: "hsl(0, 62.8%, 30.6%)", // --destructive
                        baseColor: "hsl(263, 70%, 50%)", // --primary
                        baseColorFirstVariant: "hsl(215, 28%, 17%)", // --secondary
                        baseColorSecondVariant: "hsl(217, 33%, 17%)", // --accent
                        inputBackgroundColor: "hsl(215, 28%, 17%)", // --input
                        successColor: "hsl(263, 70%, 50%)", // --primary
                        textPrimaryColor: "hsl(210, 40%, 98%)", // --foreground
                        textSecondaryColor: "hsl(217.9, 10.6%, 64.9%)", // --muted-foreground
                        inputFocusedBorderColor: "hsl(263, 70%, 50%)", // --ring
                        placeholderColor: "hsl(217.9, 10.6%, 64.9%)", // --muted-foreground
                      },
                    },
                    hideFormTitle: true,
                    hidePaymentButton: true,
                  },
                  paymentMethods: {
                    maxInstallments: 1,
                  },
                }}
                onSubmit={async (
                  param: ICardPaymentFormData<ICardPaymentBrickPayer>,
                  param2?: IAdditionalData
                ) => {
                  // This won't be called since we're using our own submit button
                }}
              />
              <Button
                onClick={createPayment}
                className="w-full"
                disabled={isProcessingCard}
              >
                {isProcessingCard
                  ? "Processando..."
                  : "Continuar para Confirmação"}
              </Button>
            </div>
          ) : (
            <Formik
              initialValues={{ payerEmail: "" }}
              validationSchema={pixPaymentSchema}
              onSubmit={handlePixPaymentSubmit}
            >
              {({ errors, touched, isValid }) => (
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
                    <ErrorMessage
                      name="payerEmail"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={!isValid}>
                    Continuar para Confirmação
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
