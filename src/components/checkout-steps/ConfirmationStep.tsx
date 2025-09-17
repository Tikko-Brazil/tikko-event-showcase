import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserData, DiscountData } from '../CheckoutOverlay';
import { CreditCard, Smartphone, User, Mail, Phone, Hash, Calendar, Instagram } from 'lucide-react';

interface ConfirmationStepProps {
  userData: UserData;
  paymentMethod: 'credit' | 'pix' | '';
  ticketPrice: number;
  ticketType: string;
  discount?: DiscountData;
  onNext: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  userData,
  paymentMethod,
  ticketPrice,
  ticketType,
  discount,
  onNext
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confirmação da Compra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ticket Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Informações do Ingresso</h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">{formatCurrency(ticketPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de serviço:</span>
                <span className="font-medium">{formatCurrency(serviceFee)}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({discount.code}):</span>
                  <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Dados Pessoais</h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Nome:</span>
                <span className="font-medium">{userData.fullName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Telefone:</span>
                <span className="font-medium">{userData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">CPF:</span>
                <span className="font-medium">{userData.identification}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Nascimento:</span>
                <span className="font-medium">{userData.birthdate}</span>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Instagram:</span>
                <span className="font-medium">@{userData.instagram}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Método de Pagamento</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                {paymentMethod === 'credit' ? (
                  <>
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cartão de Crédito:</span>
                    <span className="font-medium">**** **** **** 1234</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">PIX:</span>
                    <span className="font-medium">fake.payer@example.com</span>
                  </>
                )}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};