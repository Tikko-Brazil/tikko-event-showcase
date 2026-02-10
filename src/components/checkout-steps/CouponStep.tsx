import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Tag } from "lucide-react";
import { DiscountData } from "../CheckoutOverlay";
import { useValidateCoupon } from "@/api/coupon/api";
import { validateCouponErrorMessage } from "@/api/coupon/errors";
import { AppError } from "@/api/errors";

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
  const { t } = useTranslation();
  const [couponCode, setCouponCode] = useState(discount?.code || "");
  const [error, setError] = useState("");
  const { mutateAsync, isPending } = useValidateCoupon();

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Digite um código de cupom");
      return;
    }

    try {
      setError("");
      const data = await mutateAsync({
        event_id: eventId,
        ticket_pricing_id: ticketPricingId,
        coupon: couponCode.toUpperCase(),
      });

      const discountAmount = data.original_price - data.final_price;
      const discountPercentage = Math.round((discountAmount / data.original_price) * 100);
      
      onDiscountChange({
        code: couponCode.toUpperCase(),
        percentage: discountPercentage,
        amount: discountAmount,
      });
    } catch (err) {
      const message = validateCouponErrorMessage(err as AppError, t);
      setError(message);
      onDiscountChange(undefined);
    }
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
                disabled={isPending}
                className="uppercase"
                maxLength={30}
              />
              <Button
                onClick={applyCoupon}
                disabled={isPending || !couponCode.trim()}
                variant="outline"
              >
                {isPending ? "Aplicando..." : "Aplicar"}
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
