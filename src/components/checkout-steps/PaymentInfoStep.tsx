import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentInfoStepProps {
  paymentMethod: 'credit' | 'pix' | '';
  onNext: () => void;
}

export const PaymentInfoStep: React.FC<PaymentInfoStepProps> = ({
  paymentMethod,
  onNext
}) => {
  // Generate fake payment info
  const generateFakeCardNumber = () => {
    const numbers = ['1234', '5678', '9012', '3456'];
    return `**** **** **** ${numbers[Math.floor(Math.random() * numbers.length)]}`;
  };

  const generateFakeEmail = () => {
    const emails = [
      'usuario.pagador@email.com',
      'fake.payer@gmail.com',
      'pagamento.test@outlook.com',
      'comprador.exemplo@yahoo.com'
    ];
    return emails[Math.floor(Math.random() * emails.length)];
  };

  const fakeCardNumber = generateFakeCardNumber();
  const fakeEmail = generateFakeEmail();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {paymentMethod === 'credit' ? (
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
          {paymentMethod === 'credit' ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-xl">
                <div className="text-sm opacity-90 mb-2">Cartão Selecionado</div>
                <div className="text-2xl font-mono tracking-wider mb-3">
                  {fakeCardNumber}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-75">VÁLIDO ATÉ</div>
                    <div className="text-sm">07/28</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-75">PORTADOR</div>
                    <div className="text-sm">USUARIO TESTE</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>Este é um exemplo de cartão para demonstração. Em um ambiente real, 
                você preencheria as informações do seu cartão de crédito aqui.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 p-6 rounded-xl border-2 border-dashed border-primary/30">
                <div className="text-center space-y-3">
                  <Smartphone className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email do Pagador</div>
                    <div className="font-mono text-lg text-foreground">{fakeEmail}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>Este é um exemplo de dados PIX para demonstração. Em um ambiente real, 
                você seria redirecionado para seu banco ou app de pagamentos.</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};