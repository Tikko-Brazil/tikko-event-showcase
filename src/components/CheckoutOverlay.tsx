import React, { useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

interface CheckoutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice: number;
  ticketType: string;
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
  const [discount, setDiscount] = useState<DiscountData | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "pix" | "">("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
    setDiscount(undefined);
    setPaymentMethod("");
    setTermsAccepted(false);
    setIsProcessing(false);
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
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <CouponStep
            discount={discount}
            onDiscountChange={setDiscount}
            ticketPrice={ticketPrice}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <PaymentMethodStep
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <PaymentInfoStep paymentMethod={paymentMethod} onNext={handleNext} />
        );
      case 6:
        return (
          <ConfirmationStep
            userData={userData}
            paymentMethod={paymentMethod}
            ticketPrice={ticketPrice}
            ticketType={ticketType}
            discount={discount}
            onNext={handleNext}
          />
        );
      case 7:
        return <SuccessStep onClose={handleClose} />;
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
        };
      case 3:
        return {
          onContinue: handleNext,
          continueButtonText: "Continuar",
        };
      case 4:
        return {
          onContinue: paymentMethod ? handleNext : undefined,
          continueButtonText: "Continuar",
          isContinueDisabled: !paymentMethod,
        };
      case 5:
        return {
          onContinue: handleNext,
          continueButtonText: "Continuar para Confirmação",
        };
      case 6:
        return {
          onContinue: async () => {
            setIsProcessing(true);
            // Simulate the same logic as ConfirmationStep
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setIsProcessing(false);
            handleNext();
          },
          continueButtonText: "Confirmar e Finalizar Compra",
          isContinueDisabled: false,
          isProcessing: isProcessing,
        };
      default:
        return {};
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl lg:max-h-[90vh] max-h-screen w-screen h-screen lg:w-auto lg:h-auto overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full lg:min-h-[700px]">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 lg:h-auto">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b lg:border-b-0 shrink-0">
              <div className="flex items-center gap-3">
                {currentStep > 1 && currentStep < 7 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <h2 className="text-xl font-semibold text-foreground">
                  {currentStep === 7 ? "Compra Realizada!" : "Checkout"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground lg:block hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Indicator */}
            {currentStep < 7 && (
              <div className="px-4 lg:px-6 pt-2 pb-0 lg:py-0 shrink-0">
                <ProgressIndicator currentStep={currentStep} totalSteps={6} />
              </div>
            )}

            {/* Step Content - Scrollable on mobile with bottom padding for fixed price summary */}
            <div className="flex-1 overflow-y-auto lg:overflow-visible p-4 lg:p-6 pt-0 pb-80 lg:pb-6 max-h-[calc(100vh-200px)] lg:max-h-none">
              {renderStepContent()}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block p-6 pt-0">
              {currentStep > 1 && currentStep < 7 && (
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                  <div className="flex-1" />
                </div>
              )}
            </div>
          </div>

          {/* Price Summary Sidebar - Desktop */}
          {currentStep < 7 && (
            <div className="hidden lg:block lg:w-80 bg-muted/30 p-6 border-l border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Resumo do Pedido
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <PriceSummary
                ticketPrice={ticketPrice}
                ticketType={ticketType}
                discount={discount}
                {...getContinueButtonProps()}
              />
            </div>
          )}

          {/* Price Summary Bottom - Mobile - Fixed Position */}
          {currentStep < 7 && (
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
  );
};
