import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

export default function Organizations() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t("dashboard.tabs.organizations")}</h1>
          <Button onClick={() => navigate("/create-organization")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
        <p className="text-muted-foreground">Organizations list - Coming soon</p>
      </div>
    </DashboardLayout>
  );
}
