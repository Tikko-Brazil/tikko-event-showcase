import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { MemoizedCardPayment } from "@/components/MemoizedCardComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Smartphone } from "lucide-react";
import { createCommonValidations } from "@/lib/validationSchemas";

interface PaymentInfoStepProps {
  paymentMethod: "credit" | "pix" | "";
  ticketPrice: number;
  onNext: () => void;
  onPaymentDataChange?: (data: any) => void;
  creditPaymentRef?: React.MutableRefObject<(() => void) | null>;
  pixPaymentRef?: React.MutableRefObject<(() => void) | null>;
}

export const PaymentInfoStep: React.FC<PaymentInfoStepProps> = ({
  paymentMethod,
  ticketPrice,
  onNext,
  onPaymentDataChange,
  creditPaymentRef,
  pixPaymentRef,
}) => {
  const { t } = useTranslation();
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const pixFormRef = React.useRef<any>(null);

  const commonValidations = createCommonValidations(t);
  const pixPaymentSchema = Yup.object({
    payerEmail: commonValidations.email,
  });

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

  // Expose createPayment to parent component
  React.useEffect(() => {
    if (creditPaymentRef && paymentMethod === "credit") {
      creditPaymentRef.current = createPayment;
    }
    if (pixPaymentRef && paymentMethod === "pix") {
      pixPaymentRef.current = () => pixFormRef.current?.submitForm();
    }
  }, [creditPaymentRef, pixPaymentRef, paymentMethod]);

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
            <div className="space-y-4 pb-32 lg:pb-1">
              <MemoizedCardPayment amount={ticketPrice} />
            </div>
          ) : (
            <Formik
              initialValues={{ payerEmail: "" }}
              validationSchema={pixPaymentSchema}
              onSubmit={handlePixPaymentSubmit}
              innerRef={pixFormRef}
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
                </Form>
              )}
            </Formik>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
