import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetMercadoPagoOAuth, useGetMercadoPagoStatus, useDisconnectMercadoPago } from "@/api/payment/api";
import { mercadoPagoOAuthErrorMessage, mercadoPagoDisconnectErrorMessage } from "@/api/payment/errors";
import { useToast } from "@/hooks/use-toast";
import { normalizeApiError } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface OrganizationPaymentSectionProps {
  organizationId: number;
}

export function OrganizationPaymentSection({ organizationId }: OrganizationPaymentSectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: statusData, isLoading: statusLoading } = useGetMercadoPagoStatus(organizationId);
  const mercadoPagoMutation = useGetMercadoPagoOAuth(organizationId);
  const disconnectMutation = useDisconnectMercadoPago(organizationId);

  const isConnected = statusData?.configured || false;

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

  const handleDisconnectMercadoPago = () => {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mercado-pago-status", organizationId] });
        toast({
          title: t("common.success"),
          description: t("organizationManagement.payment.disconnectSuccess"),
        });
      },
      onError: (error) => {
        const appError = normalizeApiError(error);
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: mercadoPagoDisconnectErrorMessage(appError, t),
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

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("organizationManagement.payment.status")}:</span>
          {statusLoading ? (
            <Badge variant="outline">{t("common.loading")}</Badge>
          ) : isConnected ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {t("organizationManagement.payment.connected")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              {t("organizationManagement.payment.disconnected")}
            </Badge>
          )}
        </div>

        {/* Action Button */}
        {isConnected ? (
          <Button
            variant="destructive"
            onClick={handleDisconnectMercadoPago}
            disabled={disconnectMutation.isPending}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            {disconnectMutation.isPending
              ? t("organizationManagement.payment.disconnecting")
              : t("organizationManagement.payment.disconnectMercadoPago")}
          </Button>
        ) : (
          <Button
            onClick={handleConnectMercadoPago}
            disabled={mercadoPagoMutation.isPending}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {mercadoPagoMutation.isPending
              ? t("organizationManagement.payment.connecting")
              : t("organizationManagement.payment.connectMercadoPago")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
