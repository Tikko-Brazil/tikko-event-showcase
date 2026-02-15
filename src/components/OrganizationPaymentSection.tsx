import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetMercadoPagoOAuth } from "@/api/payment/api";
import { mercadoPagoOAuthErrorMessage } from "@/api/payment/errors";
import { useToast } from "@/hooks/use-toast";
import { normalizeApiError } from "@/api/client";

interface OrganizationPaymentSectionProps {
  organizationId: number;
}

export function OrganizationPaymentSection({ organizationId }: OrganizationPaymentSectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const mercadoPagoMutation = useGetMercadoPagoOAuth(organizationId);

  const handleConnectMercadoPago = () => {
    mercadoPagoMutation.mutate(undefined, {
      onSuccess: (data) => {
        window.location.href = data.auth_url;
      },
      onError: (error) => {
        const appError = normalizeApiError(error);
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: mercadoPagoOAuthErrorMessage(appError, t),
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("organizationManagement.payment.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("organizationManagement.payment.description")}
        </p>
        <Button
          onClick={handleConnectMercadoPago}
          disabled={mercadoPagoMutation.isPending}
          className="gap-2"
        >
          <CreditCard className="h-4 w-4" />
          {t("organizationManagement.payment.connectMercadoPago")}
        </Button>
      </CardContent>
    </Card>
  );
}
