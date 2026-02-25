import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { Pagination } from "@/components/Pagination";
import { useGetOrganizations } from "@/api/organization/api";

export default function Organizations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: organizationsResponse, isLoading } = useGetOrganizations({
    page: currentPage,
    limit: itemsPerPage,
  });

  const organizations = organizationsResponse?.organizations || [];
  const totalPages = organizationsResponse?.total_pages || 0;
  const isAdmin = organizationsResponse?.is_admin || false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold truncate">{t("dashboard.tabs.organizations")}</h1>
          {isAdmin && (
            <Button onClick={() => navigate("/create-organization")} className="shrink-0" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">{t("organizationCreation.buttons.create")}</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any organizations yet
            </p>
            {isAdmin && (
              <Button onClick={() => navigate("/create-organization")}>
                {t("organizationCreation.buttons.create")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer"
                  onClick={() => navigate(`/organization-management/${org.id}`)}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Logo - Left side */}
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0">
                      <img
                        src={org.logo || "/placeholder-event.jpg"}
                        alt={org.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 to-transparent" />
                    </div>

                    {/* Content - Right side */}
                    <CardContent className="flex-1 p-6 flex items-center">
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-2xl font-bold">{org.name}</h3>
                          <Badge variant={org.is_active ? "default" : "secondary"}>
                            {org.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={0}
                endIndex={0}
                totalItems={0}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
