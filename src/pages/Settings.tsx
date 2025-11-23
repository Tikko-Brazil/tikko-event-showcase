import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, Globe, XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { PaymentGateway } from "@/lib/PaymentGateway";
import SuccessSnackbar from "@/components/SuccessSnackbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [oauthState] = useState(() => `mp_oauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  useEffect(() => {
    if (searchParams.has('mercado-pago-succeeded')) {
      setShowSuccessSnackbar(true);
      // Remove the query parameter
      searchParams.delete('mercado-pago-succeeded');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const paymentGateway = new PaymentGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  const mercadoPagoMutation = useMutation({
    mutationFn: () => paymentGateway.getMercadoPagoOAuth(),
    onSuccess: (data) => {
      window.location.href = data.auth_url;
    },
    onError: (error) => {
      console.error("Error getting Mercado Pago OAuth URL:", error);
    },
  });

  const handleCloseAccount = () => {
    // TODO: Implement account closure logic
    console.log("Close account");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {t("settings.subtitle")}
          </p>
        </div>

        {/* Profile Information Section */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-base md:text-lg font-semibold">
                {t("settings.sections.profileInformation")}
              </h2>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-between px-4 md:px-6 py-3 md:py-4 h-auto rounded-none hover:bg-accent"
              onClick={() => navigate("/edit-profile")}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                <div className="text-left flex-1 min-w-0" style={{ textWrap: 'wrap' }}>
                  <p className="font-medium text-sm md:text-base">
                    {t("settings.options.editProfile")}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground break-words">
                    {t("settings.options.editProfileDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
            </Button>
          </CardContent>
        </Card>

        {/* General Preferences Section */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-base md:text-lg font-semibold">
                {t("settings.sections.generalPreferences")}
              </h2>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-between px-4 md:px-6 py-3 md:py-4 h-auto rounded-none hover:bg-accent border-b"
              onClick={() => navigate("/language")}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Globe className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                <div className="text-left flex-1 min-w-0" style={{ textWrap: 'wrap' }}>
                  <p className="font-medium text-sm md:text-base">
                    {t("settings.options.language")}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground break-words">
                    {t("settings.options.languageDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
            </Button>
          </CardContent>
        </Card>

        {/* Account Management Section */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-base md:text-lg font-semibold">
                {t("settings.sections.accountManagement")}
              </h2>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-between px-4 md:px-6 py-3 md:py-4 h-auto rounded-none hover:bg-accent border-b"
              onClick={() => mercadoPagoMutation.mutate()}
              disabled={mercadoPagoMutation.isPending}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                <div className="text-left flex-1 min-w-0" style={{ textWrap: 'wrap' }}>
                  <p className="font-medium text-sm md:text-base">
                    {t("settings.options.linkMercadoPago")}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground break-words">
                    {t("settings.options.linkMercadoPagoDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-4 md:px-6 py-3 md:py-4 h-auto rounded-none hover:bg-destructive/10 text-destructive hover:text-destructive"
                >
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <XCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0" style={{ textWrap: 'wrap' }}>
                      <p className="font-medium text-sm md:text-base">
                        {t("settings.options.closeAccount")}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground break-words">
                        {t("settings.options.closeAccountDesc")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("settings.closeAccountDialog.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("settings.closeAccountDialog.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("settings.closeAccountDialog.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCloseAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("settings.closeAccountDialog.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <SuccessSnackbar
        message={t("settings.mercadoPagoSuccess")}
        visible={showSuccessSnackbar}
        onDismiss={() => setShowSuccessSnackbar(false)}
      />
    </div>
  );
};

export default Settings;
