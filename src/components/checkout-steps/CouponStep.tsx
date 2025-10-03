import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Tag } from "lucide-react";
import { DiscountData } from "../CheckoutOverlay";
import { CouponGateway } from "@/lib/CouponGateway";

const couponGateway = new CouponGateway(import.meta.env.VITE_BACKEND_BASE_URL);

interface CouponStepProps {
  discount?: DiscountData;
  onDiscountChange: (discount?: DiscountData) => void;
  ticketPrice: number;
  eventId: number;
  ticketPricingId: number;
  onNext: () => void;
}

export const CouponStep: React.FC<CouponStepProps> = ({
  discount,
  onDiscountChange,
  ticketPrice,
  eventId,
  ticketPricingId,
  onNext,
}) => {
  const [couponCode, setCouponCode] = useState(discount?.code || "");
  const [error, setError] = useState("");

  const couponMutation = useMutation({
    mutationFn: (code: string) => couponGateway.getCouponPrice({
      event_id: eventId.toString(),
      ticket_pricing_id: ticketPricingId.toString(),
      coupon: code,
    }),
    onSuccess: (data) => {
      const discountAmount = data.original_price - data.final_price;
      const discountPercentage = Math.round((discountAmount / data.original_price) * 100);
      
      onDiscountChange({
        code: couponCode.toUpperCase(),
        percentage: discountPercentage,
        amount: discountAmount,
      });
      setError("");
    },
    onError: (error: any) => {
      setError(error.message || "Código de cupom inválido");
      onDiscountChange(undefined);
    },
  });

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setError("Digite um código de cupom");
      return;
    }
    setError("");
    couponMutation.mutate(couponCode.toUpperCase());
  };

  const removeCoupon = () => {
    setCouponCode("");
    setError("");
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
                disabled={couponMutation.isPending}
                className="uppercase"
                maxLength={30}
              />
              <Button
                onClick={applyCoupon}
                disabled={couponMutation.isPending || !couponCode.trim()}
                variant="outline"
              >
                {couponMutation.isPending ? "Aplicando..." : "Aplicar"}
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
                  Cupom {discount.code} aplicado! Desconto de{" "}
                  {discount.percentage}%
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

          <div className="pt-4"></div>
        </CardContent>
      </Card>
    </div>
  );
};
