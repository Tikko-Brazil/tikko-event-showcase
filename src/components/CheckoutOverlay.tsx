import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Button } from "@/components/ui/button";
import { PriceSummary } from "./PriceSummary";
import { ProgressIndicator } from "./ProgressIndicator";
import { TermsStep } from "./checkout-steps/TermsStep";
import { UserInfoStep } from "./checkout-steps/UserInfoStep";
import { CouponStep } from "./checkout-steps/CouponStep";
import { PaymentMethodStep } from "./checkout-steps/PaymentMethodStep";
import { PaymentInfoStep } from "./checkout-steps/PaymentInfoStep";
import { ConfirmationStep } from "./checkout-steps/ConfirmationStep";
import { SuccessStep } from "./checkout-steps/SuccessStep";
import { PixQRCodeStep } from "./checkout-steps/PixQRCodeStep";
import { useRegisterAndJoinEvent } from "@/api/user/api";
import { registerAndJoinEventErrorMessage } from "@/api/user/errors";
import { AppError } from "@/api/errors";
import { toast } from "@/hooks/use-toast";

interface CheckoutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice: number;
  ticketType: string;
  eventId: number;
  ticketPricingId: number;
  autoAccept?: boolean;
  initialCoupon?: string;
  initialDiscount?: DiscountData;
}

export interface UserData {
  fullName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  confirmPhone: string;
  identification: string;
  birthdate: string;
  instagram: string;
}

export interface DiscountData {
  code: string;
  percentage: number;
  amount: number;
}

export const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({
  isOpen,
  onClose,
  ticketPrice,
  ticketType,
  eventId,
  ticketPricingId,
  autoAccept = true,
  initialCoupon,
  initialDiscount,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    confirmEmail: "",
    phone: "+55 ",
    confirmPhone: "+55 ",
    identification: "",
    birthdate: "",
    instagram: "",
  });
  const [identificationType, setIdentificationType] = useState<"cpf" | "other">(
    "cpf"
  );
  const [formValidationTrigger, setFormValidationTrigger] = useState(0);
  const [discount, setDiscount] = useState<DiscountData | undefined>(initialDiscount);
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "pix" | "">("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUserInfoValid, setIsUserInfoValid] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const creditPaymentRef = React.useRef<(() => void) | null>(null);
  const pixPaymentRef = React.useRef<(() => void) | null>(null);

  const { t } = useTranslation();
  const { mutateAsync, isPending } = useRegisterAndJoinEvent();

  // Update discount when initialDiscount changes (e.g., when overlay reopens)
  React.useEffect(() => {
    if (isOpen) {
      setDiscount(initialDiscount);
    }
  }, [isOpen, initialDiscount]);

  const totalSteps = 8;

  // Calculate if ticket is free after discount
  const finalPrice = discount ? ticketPrice - discount.amount : ticketPrice;
  const isFreeTicket = finalPrice <= 0;

  const handleRegisterAndJoin = async () => {
    try {
      // Prepare payment data
      let paymentInfo = undefined;
      if (!isFreeTicket) {
        if (paymentMethod === "credit" && paymentData?.cardInfo?.formData) {
          paymentInfo = {
            token: paymentData.cardInfo.formData.token,
            description: "",
            installments:
              paymentData.cardInfo.formData.installments?.toString() || "1",
            paymentMethodId:
              paymentData.cardInfo.formData.payment_method_id || "credit_card",
            issuerId: Number(paymentData.cardInfo.formData.issuer_id) || 0,
            payer: {
              email: paymentData.cardInfo.formData.payer?.email || userData.email,
              identification: paymentData.cardInfo.formData.payer
                ?.identification || {
                type: "CPF",
                number: userData.identification,
              },
            },
          };
        } else if (paymentMethod === "pix") {
          paymentInfo = {
            token: "",
            description: "",
            installments: "1",
            paymentMethodId: "pix",
            issuerId: 0,
            payer: {
              email: paymentData?.pixInfo?.payerEmail || userData.email,
              identification: {
                type: "CPF",
                number: userData.identification,
              },
            },
          };
        }
      }

      const result = await mutateAsync({
        user: {
          email: userData.email,
          username: userData.fullName,
          gender: identificationType === "cpf" ? "male" : "female",
          birthday: userData.birthdate
            ? new Date(
              userData.birthdate.split("/").reverse().join("-")
            ).toISOString()
            : new Date().toISOString(),
          phone_number: userData.phone.replace(/[()\s-]/g, ""),
          location: "",
          bio: "",
          instagram_profile: userData.instagram,
          identification_number: userData.identification
        },
        event_id: eventId,
        ticket_pricing_id: ticketPricingId,
        coupon: discount?.code || "",
        payment: {
          transaction_amount: isFreeTicket ? 0 : finalPrice,
          token: paymentInfo?.token || "",
          description: paymentInfo?.description || "Event ticket",
          installments: Number(paymentInfo?.installments) || 1,
          payment_method_id: isFreeTicket
            ? "free"
            : paymentInfo?.paymentMethodId || "",
          issuer_id: paymentInfo?.issuerId || 0,
          capture: true,
          external_reference: "",
          callback_url: "",
          payer: {
            email: userData.email,
            first_name: userData.fullName.split(" ")[0] || "",
            last_name: userData.fullName.split(" ").slice(1).join(" ") || "",
            identification: {
              type: "CPF",
              number: userData.identification,
            },
          },
        },
      });

      if (result.qr_code) {
        setQrCode(result.qr_code);
        setPaymentId(result.payment_id.toString());
        setCurrentStep(8);
      } else {
        handleNext();
      }
    } catch (error) {
      const message = registerAndJoinEventErrorMessage(error as AppError, t);
      toast({ variant: "destructive", description: message });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Special case: if on confirmation step (6) and ticket is free, go back to coupon step (3)
      if (currentStep === 6 && isFreeTicket) {
        setCurrentStep(3);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleDialogClose = () => {
    onClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setUserData({
      fullName: "",
      email: "",
      confirmEmail: "",
      phone: "+55 ",
      confirmPhone: "+55 ",
      identification: "",
      birthdate: "",
      instagram: "",
    });
    setIdentificationType("cpf");
    setDiscount(undefined);
    setPaymentMethod("");
    setTermsAccepted(false);
    setIsProcessing(false);
    setIsUserInfoValid(false);
    setPaymentData(null);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TermsStep
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <UserInfoStep
            userData={userData}
            onUserDataChange={setUserData}
            identificationType={identificationType}
            onIdentificationTypeChange={setIdentificationType}
            onNext={handleNext}
            onValidationChange={(isValid) => {
              setIsUserInfoValid(isValid);
            }}
          />
        );
      case 3:
        return (
          <CouponStep
            discount={discount}
            onDiscountChange={setDiscount}
            ticketPrice={ticketPrice}
            eventId={eventId}
            ticketPricingId={ticketPricingId}
            onNext={handleNext}
            initialCoupon={initialCoupon}
          />
        );
      case 4:
        return (
          <PaymentMethodStep
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            autoAccept={autoAccept}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <PaymentInfoStep
            paymentMethod={paymentMethod}
            ticketPrice={ticketPrice}
            onNext={handleNext}
            onPaymentDataChange={setPaymentData}
            creditPaymentRef={creditPaymentRef}
            pixPaymentRef={pixPaymentRef}
          />
        );
      case 6:
        return (
          <ConfirmationStep
            userData={userData}
            paymentMethod={paymentMethod}
            ticketPrice={ticketPrice}
            ticketType={ticketType}
            discount={discount}
            paymentData={paymentData}
            onSubmit={handleRegisterAndJoin}
            isSubmitting={isPending}
            onNext={handleNext}
          />
        );
      case 7:
        return <SuccessStep onClose={handleClose} autoAccept={autoAccept} />;
      case 8:
        return (
          <PixQRCodeStep
            ticketType={ticketType}
            payerEmail={userData.email}
            qrCode={qrCode}
            paymentId={paymentId}
            onClose={handleClose}
            onPaymentSuccess={() => setCurrentStep(7)} // Go to success step
          />
        );
      default:
        return null;
    }
  };

  const getContinueButtonProps = () => {
    switch (currentStep) {
      case 1:
        return {
          onContinue: termsAccepted ? handleNext : undefined,
          continueButtonText: "Continuar",
          isContinueDisabled: !termsAccepted,
        };
      case 2:
        return {
          onContinue: handleNext,
          continueButtonText: "Continuar",
          isContinueDisabled: !isUserInfoValid,
        };
      case 3:
        return {
          onContinue: () => {
            // Skip payment steps if ticket is free
            if (isFreeTicket) {
              setCurrentStep(6); // Go directly to confirmation
            } else {
              handleNext(); // Go to payment method step
            }
          },
          continueButtonText: "Continuar",
        };
      case 4:
        return {
          onContinue: () => {
            // Skip payment step if ticket is free
            if (isFreeTicket) {
              setCurrentStep(6); // Go directly to confirmation
            } else {
              handleNext(); // Go to payment step
            }
          },
          continueButtonText: "Continuar",
          isContinueDisabled: !paymentMethod,
        };
      case 5:
        return {
          onContinue:
            paymentMethod === "credit"
              ? () => creditPaymentRef.current?.()
              : () => pixPaymentRef.current?.(),
          continueButtonText: "Continuar para Confirmação",
        };
      case 6:
        return {
          onContinue: handleRegisterAndJoin,
          continueButtonText: "Confirmar e Finalizar Compra",
          isContinueDisabled: false,
          isProcessing: isPending,
        };
      default:
        return {};
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && handleDialogClose()}
      >
        <DialogContent className="lg:max-w-none lg:max-h-[90vh] max-h-screen w-screen h-screen lg:w-[1050px] lg:h-[805px] overflow-hidden p-0">
          <VisuallyHidden>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Processo de compra de ingressos</DialogDescription>
          </VisuallyHidden>
          <div className="flex flex-col lg:flex-row h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0 lg:h-auto">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between p-4 lg:p-6 border-b lg:border-b-0 shrink-0">
                <div className="flex items-center gap-3">
                  {currentStep > 1 && currentStep < 7 && (
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  <h2 className="text-xl font-semibold text-foreground">
                    {currentStep === 7
                      ? "Compra Realizada!"
                      : currentStep === 8
                        ? "Pagamento PIX"
                        : "Checkout"}
                  </h2>
                </div>
              </div>

              {/* Progress Indicator */}
              {currentStep > 1 && currentStep < 7 && (
                <div className="px-4 lg:px-6 pt-2 pb-0 lg:py-0 shrink-0">
                  <ProgressIndicator
                    currentStep={
                      currentStep <= 3
                        ? currentStep - 1
                        : currentStep <= 5
                          ? 3
                          : 4
                    }
                    totalSteps={4}
                  />
                </div>
              )}

              {/* Step Content - Scrollable on mobile with bottom padding for fixed price summary */}
              <div
                className={`flex-1 ${currentStep === 8
                  ? "p-4 lg:p-6 pt-0 pb-0 lg:pb-0"
                  : "p-4 lg:p-6 pt-0 lg:pb-6"
                  } ${currentStep === 6
                    ? "overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-[calc(805px-200px)]"
                    : currentStep === 8
                      ? "overflow-y-auto max-h-[100vh] lg:max-h-none"
                      : "overflow-y-auto lg:overflow-visible max-h-[calc(100vh-200px)] lg:max-h-none"
                  }`}
              >
                {renderStepContent()}
              </div>
            </div>

            {/* Price Summary Sidebar - Desktop */}
            {currentStep < 7 && currentStep !== 8 && (
              <div className="hidden lg:block lg:w-80 bg-muted/30 p-6 border-l border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Resumo do Pedido
                </h3>
                <PriceSummary
                  ticketPrice={ticketPrice}
                  ticketType={ticketType}
                  discount={discount}
                  {...getContinueButtonProps()}
                />
              </div>
            )}

            {/* Price Summary Bottom - Mobile - Fixed Position */}
            {currentStep < 7 && currentStep !== 8 && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50 min-h-[200px]">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Resumo do Pedido
                  </h3>
                  <PriceSummary
                    ticketPrice={ticketPrice}
                    ticketType={ticketType}
                    discount={discount}
                    {...getContinueButtonProps()}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
