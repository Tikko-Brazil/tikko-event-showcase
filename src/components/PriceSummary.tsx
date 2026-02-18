import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fromCents } from "@/helpers/currency";

interface PriceSummaryProps {
  ticketPrice: number;
  ticketType: string;
  discount?: {
    code: string;
    percentage: number;
    amount: number;
  };
  // Mobile continue button props
  currentStep?: number;
  continueButtonText?: string;
  onContinue?: () => void;
  isContinueDisabled?: boolean;
  isProcessing?: boolean;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  ticketPrice,
  ticketType,
  discount,
  currentStep,
  continueButtonText = "Continuar",
  onContinue,
  isContinueDisabled = false,
  isProcessing = false,
}) => {
  // Convert prices from cents to decimal for calculations
  const ticketPriceDecimal = fromCents(ticketPrice);
  const discountAmountDecimal = discount?.amount ? fromCents(discount.amount) : 0;
  const ticketPriceAfterDiscount = Math.max(0, ticketPriceDecimal - discountAmountDecimal);
  const serviceFee = ticketPriceAfterDiscount * 0.1;
  const subtotal = ticketPriceDecimal + serviceFee;
  const total = subtotal - discountAmountDecimal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardContent className="p-2 space-y-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {ticketType}
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(ticketPriceDecimal)}
              </span>
            </div>

            {discount && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">Desconto ({discount.code})</span>
                <span className="text-sm font-medium">
                  -{formatCurrency(discountAmountDecimal)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Taxa de serviço (10%)
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(serviceFee)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-md text-foreground">
              {formatCurrency(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      {onContinue && (
        <Button
          onClick={onContinue}
          disabled={isContinueDisabled || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Processando..." : continueButtonText}
        </Button>
      )}
    </div>
  );
};
