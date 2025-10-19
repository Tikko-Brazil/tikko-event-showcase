import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserData, DiscountData } from "../CheckoutOverlay";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import {
  CreditCard,
  Smartphone,
  User,
  Mail,
  Phone,
  Hash,
  Calendar,
  Instagram,
} from "lucide-react";

interface ConfirmationStepProps {
  userData: UserData;
  paymentMethod: "credit" | "pix" | "";
  ticketPrice: number;
  ticketType: string;
  discount?: DiscountData;
  paymentData?: any;
  onSubmit: () => void;
  isSubmitting: boolean;
  onNext: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  userData,
  paymentMethod,
  ticketPrice,
  ticketType,
  discount,
  paymentData,
  onSubmit,
  isSubmitting,
  onNext,
}) => {
  const [error, setError] = useState<string | null>(null);
  const discountAmount = discount?.amount || 0;
  const ticketPriceAfterDiscount = Math.max(0, ticketPrice - discountAmount);
  const serviceFee = ticketPriceAfterDiscount * 0.1;
  const subtotal = ticketPrice + serviceFee;
  const total = subtotal - discountAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleSubmit = async () => {
    setError(null);
    onSubmit();
  };

  return (
    <div className="h-full overflow-y-auto space-y-4 pb-60">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confirmação da Compra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ticket Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Informações do Ingresso
            </h3>
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo: </span>
                <span className="font-medium">{ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">
                  {formatCurrency(ticketPrice)}
                </span>
              </div>
              {discount && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({discount.code}):</span>
                  <span className="font-medium">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de serviço:</span>
                <span className="font-medium">
                  {formatCurrency(serviceFee)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Dados Pessoais
            </h3>
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
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
                <span className="text-sm text-muted-foreground">
                  Nascimento:
                </span>
                <span className="font-medium">{userData.birthdate}</span>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Instagram:
                </span>
                <span className="font-medium">@{userData.instagram}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {total > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Método de Pagamento
              </h3>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  {paymentMethod === "credit" ? (
                    <>
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Cartão:
                      </span>
                      <span className="font-medium">
                        {paymentData?.cardInfo?.formData?.payment_method_id
                          ? paymentData.cardInfo.formData.payment_method_id
                              .charAt(0)
                              .toUpperCase() +
                            paymentData.cardInfo.formData.payment_method_id.slice(
                              1
                            )
                          : "Cartão de Crédito"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        PIX:
                      </span>
                      <span className="font-medium">
                        {paymentData?.pixInfo?.payerEmail || userData.email}
                      </span>
                    </>
                  )}
                </div>
                {paymentData?.cardInfo?.formData?.payer && (
                  <div className="flex items-center gap-3 mt-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {paymentData.cardInfo.formData.payer.identification
                        ?.type || "CPF"}
                      :
                    </span>
                    <span className="font-medium">
                      {paymentData.cardInfo.formData.payer.identification
                        ?.number || userData.identification}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button - Desktop only */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full hidden lg:block"
            size="lg"
          >
            {isSubmitting ? "Processando..." : "Confirmar e Finalizar Compra"}
          </Button>
        </CardContent>
      </Card>
      <ErrorSnackbar
        message={error || ""}
        visible={!!error}
        onDismiss={() => setError(null)}
      />
    </div>
  );
};
