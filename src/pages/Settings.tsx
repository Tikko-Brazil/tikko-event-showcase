import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, Globe, XCircle } from "lucide-react";
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

  const handleCloseAccount = () => {
    // TODO: Implement account closure logic
    console.log("Close account");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-6 w-full overflow-hidden">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t("settings.subtitle")}
          </p>
        </div>

        {/* Profile Information Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-base md:text-lg font-semibold">
                {t("settings.sections.profileInformation")}
              </h2>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-between px-4 md:px-6 py-3 md:py-4 h-auto rounded-none hover:bg-accent"
              onClick={() => navigate("/profile")}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 overflow-hidden">
                <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <p className="font-medium text-sm md:text-base truncate">
                    {t("settings.options.editProfile")}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                    {t("settings.options.editProfileDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* General Preferences Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-base md:text-lg font-semibold">
                {t("settings.sections.generalPreferences")}
              </h2>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-between px-4 md:px-6 py-3 md:py-4 h-auto rounded-none hover:bg-accent border-b"
              onClick={() => {
                // Language selector will be implemented here
                // For now, navigate to a language settings page or open a dialog
              }}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 overflow-hidden">
                <Globe className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <p className="font-medium text-sm md:text-base truncate">
                    {t("settings.options.language")}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                    {t("settings.options.languageDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Account Management Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-base md:text-lg font-semibold">
                {t("settings.sections.accountManagement")}
              </h2>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-4 md:px-6 py-3 md:py-4 h-auto rounded-none hover:bg-destructive/10 text-destructive hover:text-destructive"
                >
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 overflow-hidden">
                    <XCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0 overflow-hidden">
                      <p className="font-medium text-sm md:text-base truncate">
                        {t("settings.options.closeAccount")}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {t("settings.options.closeAccountDesc")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ml-2" />
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
    </DashboardLayout>
  );
};

export default Settings;
