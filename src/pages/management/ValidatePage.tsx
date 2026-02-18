import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Camera as CameraIcon, AlertTriangle, CheckCircle, X } from "lucide-react";
import { TicketGateway } from "@/lib/TicketGateway";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scanner } from '@yudiel/react-qr-scanner';
import SuccessSnackbar from "@/components/SuccessSnackbar";

interface TicketResponse {
  Ticket: {
    uuid: string;
    event_id: number;
    user_id: number;
    ticket_pricing_id: number;
    already_validated: boolean;
    qr_code?: string;
  };
  UserName: string;
  TicketPrincingType: string;
}

export const ValidatePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [scannedTicketId, setScannedTicketId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const ticketGateway = new TicketGateway(import.meta.env.VITE_API_BASE_URL);

  // Fetch ticket data when scanned
  const { data: ticketData, isLoading: isLoadingTicket, error: ticketError } = useQuery({
    queryKey: ["ticket", scannedTicketId],
    queryFn: () => ticketGateway.getTicket(scannedTicketId!),
    enabled: !!scannedTicketId,
    retry: false,
  }) as { data: TicketResponse | undefined, isLoading: boolean, error: any };

  // Validate ticket mutation
  const validateMutation = useMutation({
    mutationFn: (ticketId: string) => ticketGateway.validateTicket(ticketId),
    onSuccess: () => {
      setSuccessMessage(t("ticketValidation.messages.success"));
      setShowSuccess(true);
      setShowConfirmation(false);
      setLastTicketId(scannedTicketId);
      setScannedTicketId(null);
      setIsCameraVisible(true);
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
    },
    onError: (error: any) => {
      const errorMessage = error.message?.toLowerCase() || "";
      let userMessage = t("ticketValidation.messages.error");

      if (errorMessage.includes("already validated")) {
        userMessage = t("ticketValidation.messages.alreadyValidated");
      } else if (errorMessage.includes("404")) {
        userMessage = t("ticketValidation.messages.notFound");
      } else if (errorMessage.includes("403")) {
        userMessage = t("ticketValidation.messages.noPermission");
      }

      toast({
        description: userMessage,
        variant: "destructive",
      });
    },
  });

  // Handle QR code scan
  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes.length > 0) {
      const ticketId = detectedCodes[0].rawValue;
      if (ticketId && ticketId !== lastTicketId) {
        setScannedTicketId(ticketId);
        setIsCameraVisible(false);
      }
    }
  };

  // Handle manual ticket ID input (for testing)
  const handleManualInput = () => {
    const ticketId = prompt("Enter ticket ID for testing:");
    if (ticketId && ticketId !== lastTicketId) {
      setScannedTicketId(ticketId);
      setIsCameraVisible(false);
    }
  };

  // Show confirmation when ticket data is loaded
  useEffect(() => {
    if (ticketData && !showConfirmation) {
      setShowConfirmation(true);
    }
  }, [ticketData, showConfirmation]);

  // Handle validation confirmation
  const handleValidationConfirm = () => {
    if (scannedTicketId) {
      validateMutation.mutate(scannedTicketId);
    }
  };

  // Handle validation cancel
  const handleValidationCancel = () => {
    setShowConfirmation(false);
    setScannedTicketId(null);
    setIsCameraVisible(true);
  };

  if (ticketError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-medium">{t("ticketValidation.messages.loadError")}</h3>
        <p className="text-muted-foreground text-center">
          {ticketError instanceof Error ? ticketError.message : t("ticketValidation.messages.loadError")}
        </p>
        <Button onClick={() => {
          setScannedTicketId(null);
          setIsCameraVisible(true);
        }}>
          {t("ticketValidation.buttons.tryAgain")}
        </Button>
      </div>
    );
  }

  if (isCameraVisible) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t("ticketValidation.camera.title")}</h2>
        </div>

        <div className="relative w-full max-w-2xl mx-auto">
          <Scanner
            onScan={handleScan}
            onError={(error) => {
              console.error('Scanner error:', error);
              toast({
                description: t("ticketValidation.camera.accessError"),
                variant: "destructive",
              });
            }}
          />

          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              {t("ticketValidation.camera.instruction")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t("ticketValidation.title")}</h2>
        <p className="text-muted-foreground">
          {t("ticketValidation.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            {t("ticketValidation.instructions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

          <div className="space-y-3">
            <p className="font-medium">
              1) {t("ticketValidation.instructions.step1")}
            </p>
            <p className="font-medium">
              2) {t("ticketValidation.instructions.step2")}
            </p>
            <p className="font-medium">
              3) {t("ticketValidation.instructions.step3")}
            </p>
          </div>

          <Button onClick={() => setIsCameraVisible(true)} className="w-full" size="lg">
            <CameraIcon className="h-4 w-4 mr-2" />
            {t("ticketValidation.buttons.startValidation")}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ticketValidation.confirmation.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ticketValidation.confirmation.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {isLoadingTicket ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t("ticketValidation.confirmation.loading")}</p>
            </div>
          ) : ticketData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p><strong>{t("ticketValidation.confirmation.ticketId")}:</strong> {ticketData.Ticket.uuid}</p>
                <p><strong>{t("ticketValidation.confirmation.userName")}:</strong> {ticketData.UserName}</p>
                <p><strong>{t("ticketValidation.confirmation.ticketType")}:</strong> {ticketData.TicketPrincingType}</p>
              </div>

              {ticketData.Ticket.already_validated && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t("ticketValidation.confirmation.alreadyValidated")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : null}

          <AlertDialogFooter>
            {ticketData?.Ticket.already_validated ? (
              <AlertDialogAction onClick={handleValidationCancel}>
                {t("ticketValidation.confirmation.close")}
              </AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel onClick={handleValidationCancel}>
                  {t("ticketValidation.confirmation.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleValidationConfirm}
                  disabled={validateMutation.isPending || isLoadingTicket}
                >
                  {validateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("ticketValidation.confirmation.validating")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("ticketValidation.confirmation.validate")}
                    </>
                  )}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Snackbar */}
      <SuccessSnackbar
        message={successMessage}
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
      />
    </div>
  );
};
