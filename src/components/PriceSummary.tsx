import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PriceSummaryProps {
  ticketPrice: number;
  ticketType: string;
  discount?: {
    code: string;
    percentage: number;
    amount: number;
  };
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  ticketPrice,
  ticketType,
  discount
}) => {
  const serviceFee = ticketPrice * 0.1;
  const subtotal = ticketPrice + serviceFee;
  const discountAmount = discount?.amount || 0;
  const total = subtotal - discountAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ingresso ({ticketType})</span>
            <span className="text-sm font-medium">{formatCurrency(ticketPrice)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Taxa de serviço (10%)</span>
            <span className="text-sm font-medium">{formatCurrency(serviceFee)}</span>
          </div>

          {discount && (
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Desconto ({discount.code})</span>
              <span className="text-sm font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-lg text-foreground">{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
};