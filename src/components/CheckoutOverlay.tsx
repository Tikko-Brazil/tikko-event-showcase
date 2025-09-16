import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PriceSummary } from './PriceSummary';
import { ProgressIndicator } from './ProgressIndicator';
import { TermsStep } from './checkout-steps/TermsStep';
import { UserInfoStep } from './checkout-steps/UserInfoStep';
import { CouponStep } from './checkout-steps/CouponStep';
import { PaymentMethodStep } from './checkout-steps/PaymentMethodStep';
import { PaymentInfoStep } from './checkout-steps/PaymentInfoStep';
import { ConfirmationStep } from './checkout-steps/ConfirmationStep';
import { SuccessStep } from './checkout-steps/SuccessStep';

interface CheckoutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice: number;
  ticketType: string;
}

export interface UserData {
  fullName: string;
  email: string;
  phone: string;
  identification: string;
  birthdate: string;
  instagram?: string;
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
  ticketType
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    email: '',
    phone: '+55 ',
    identification: '',
    birthdate: '',
    instagram: ''
  });
  const [discount, setDiscount] = useState<DiscountData | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | ''>('');
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      fullName: '',
      email: '',
      phone: '+55 ',
      identification: '',
      birthdate: '',
      instagram: ''
    });
    setDiscount(undefined);
    setPaymentMethod('');
    setTermsAccepted(false);
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
          <PaymentInfoStep
            paymentMethod={paymentMethod}
            onNext={handleNext}
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
            onNext={handleNext}
          />
        );
      case 7:
        return (
          <SuccessStep onClose={handleClose} />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] md:max-h-[90vh] h-full md:h-auto w-full md:w-auto overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full md:min-h-[600px]">
          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0 md:pb-6 shrink-0">
              {/* Back button on mobile/tablet */}
              {currentStep > 1 && currentStep < 7 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="lg:hidden text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              
              <h2 className="text-xl font-semibold text-foreground flex-1 lg:flex-none text-center lg:text-left">
                {currentStep === 7 ? 'Compra Realizada!' : 'Checkout'}
              </h2>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Indicator */}
            {currentStep < 7 && (
              <div className="px-6 pb-4 shrink-0">
                <ProgressIndicator currentStep={currentStep} totalSteps={6} />
              </div>
            )}

            {/* Step Content - Scrollable on mobile */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 lg:pb-0">
              {renderStepContent()}
            </div>

            {/* Desktop Navigation */}
            {currentStep > 1 && currentStep < 7 && (
              <div className="hidden lg:flex justify-between p-6 pt-0">
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

          {/* Price Summary - Desktop Sidebar / Mobile Bottom */}
          {currentStep < 7 && (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden lg:block lg:w-80 bg-muted/30 p-6 border-l border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Resumo do Pedido
                </h3>
                <PriceSummary
                  ticketPrice={ticketPrice}
                  ticketType={ticketType}
                  discount={discount}
                />
              </div>
              
              {/* Mobile Bottom Price Summary */}
              <div className="lg:hidden bg-muted/30 border-t border-border p-4 shrink-0">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Resumo do Pedido
                </h3>
                <PriceSummary
                  ticketPrice={ticketPrice}
                  ticketType={ticketType}
                  discount={discount}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};