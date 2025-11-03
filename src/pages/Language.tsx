import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Language = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const languages = [
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
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
            {t("settings.options.language")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {t("settings.options.languageDesc")}
          </p>
        </div>

        {/* Language Selection Card */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  {t("settings.options.language")}
                </label>
                <Select
                  value={currentLanguage.code}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-full h-14 text-base">
                    <SelectValue>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{currentLanguage.flag}</span>
                        <span className="font-medium">{currentLanguage.name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem
                        key={language.code}
                        value={language.code}
                        className="h-12 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{language.flag}</span>
                          <span className="font-medium">{language.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Language;
