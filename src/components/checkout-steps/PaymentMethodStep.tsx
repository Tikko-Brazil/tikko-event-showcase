import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodStepProps {
  paymentMethod: 'credit' | 'pix' | '';
  onPaymentMethodChange: (method: 'credit' | 'pix') => void;
  onNext: () => void;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => onPaymentMethodChange(value as 'credit' | 'pix')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="credit" id="credit" />
              <Label htmlFor="credit" className="flex-1 flex items-center gap-3 cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Cartão de Crédito</div>
                  <div className="text-sm text-muted-foreground">
                    Pague com Visa, Mastercard ou outros cartões
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix" className="flex-1 flex items-center gap-3 cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">PIX</div>
                  <div className="text-sm text-muted-foreground">
                    Pagamento instantâneo via QR Code ou chave PIX
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Button
            onClick={onNext}
            disabled={!paymentMethod}
            className="w-full"
            size="lg"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};