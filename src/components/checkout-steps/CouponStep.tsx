import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Tag } from 'lucide-react';
import { DiscountData } from '../CheckoutOverlay';

interface CouponStepProps {
  discount?: DiscountData;
  onDiscountChange: (discount?: DiscountData) => void;
  ticketPrice: number;
  onNext: () => void;
}

export const CouponStep: React.FC<CouponStepProps> = ({
  discount,
  onDiscountChange,
  ticketPrice,
  onNext
}) => {
  const [couponCode, setCouponCode] = useState(discount?.code || '');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Digite um código de cupom');
      return;
    }

    setIsApplying(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (couponCode.toUpperCase() === 'DISCOUNT10') {
      const percentage = 10;
      const amount = (ticketPrice + ticketPrice * 0.1) * (percentage / 100);
      onDiscountChange({
        code: couponCode.toUpperCase(),
        percentage,
        amount
      });
    } else {
      setError('Código de cupom inválido');
      onDiscountChange(undefined);
    }

    setIsApplying(false);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setError('');
    onDiscountChange(undefined);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Cupom de Desconto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coupon">Código do Cupom (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="DIGITE SEU CUPOM"
                disabled={isApplying}
                className="uppercase"
              />
              <Button
                onClick={applyCoupon}
                disabled={isApplying || !couponCode.trim()}
                variant="outline"
              >
                {isApplying ? 'Aplicando...' : 'Aplicar'}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {discount && (
            <Alert className="border-green-500 text-green-700 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Cupom {discount.code} aplicado! Desconto de {discount.percentage}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={removeCoupon}
                  className="text-green-700 hover:text-green-800"
                >
                  Remover
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            <Button
              onClick={onNext}
              className="w-full lg:hidden"
              size="lg"
            >
              Continuar
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Cupons disponíveis para teste:</p>
            <code className="bg-muted px-2 py-1 rounded text-xs">DISCOUNT10</code>
            <span className="ml-2">- 10% de desconto</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};