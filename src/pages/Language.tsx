import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

const Language = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
            {t("settings.options.language")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {t("settings.options.languageDesc")}
          </p>
        </div>

        {/* Language Selection Card */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm md:text-base">
                    {t("settings.options.language")}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {t("settings.options.languageDesc")}
                  </p>
                </div>
              </div>
              <LanguageSelector />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Language;
