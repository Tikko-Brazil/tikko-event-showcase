import React, { useState } from "react";
import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Settings, Users, Calendar, CreditCard, Activity } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoLight from "@/assets/logoLight.png";
import { useGetOrganization } from "@/api/organization/api";
import { GeocodingGateway } from "@/lib/GeocodingGateway";

const geocodingGateway = new GeocodingGateway();

const OrganizationManagement = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<string>("");

  const { data: organization, isLoading } = useGetOrganization(Number(organizationId));

  // Reverse geocode to get address
  React.useEffect(() => {
    if (organization?.latitude && organization?.longitude) {
      geocodingGateway.reverseGeocode(organization.latitude, organization.longitude)
        .then(result => {
          const parts = [
            result.city || result.suburb,
            result.state,
            result.country
          ].filter(Boolean);
          setReverseGeocodedAddress(parts.join(', '));
        })
        .catch(() => setReverseGeocodedAddress(organization.address_name));
    }
  }, [organization]);

  const managementSections = [
    { id: "edit", label: "Edit Organization", icon: Edit },
    { id: "members", label: "Members", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "meta-pixel", label: "Meta Pixel", icon: Activity },
  ];

  // Wait for isMobile to be determined
  if (isMobile === undefined) {
    return null;
  }

  if (isLoading || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const currentPath = location.pathname.split('/').pop();

  // Mobile: Show menu grid on edit route (first visit), show content on explicit navigation
  if (isMobile) {
    // Check if we're coming from the menu or navigating directly
    const showMenu = currentPath === 'edit' && !location.state?.fromMenu;
    
    if (currentPath && currentPath !== organizationId && !showMenu) {
      // Show subroute content with back button
      return (
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/organization-management/${organizationId}/edit`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold">
                {managementSections.find((s) => s.id === currentPath)?.label}
              </h1>
              <div className="w-10" />
            </div>
          </header>

          <main className="p-4">
            <Outlet />
          </main>
        </div>
      );
    }

    // Show menu grid
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/organizations")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoLight} alt="Tikko" className="h-6" />
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Organization Header */}
        <div className="border-b bg-card">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={organization.logo || "/placeholder-event.jpg"}
                alt={organization.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{organization.name}</h1>
                <p className="text-sm text-muted-foreground truncate">{organization.address_name}</p>
                {reverseGeocodedAddress && reverseGeocodedAddress !== organization.address_name && (
                  <p className="text-xs text-muted-foreground">{reverseGeocodedAddress}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Management Grid Menu */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Organization Management</h2>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {managementSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => navigate(`/organization-management/${organizationId}/${section.id}`, { state: { fromMenu: true } })}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-center">
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Show sidebar + content
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/organizations")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
            <img src={logoLight} alt="Tikko" className="h-8" />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="w-64 border-r bg-card/50 backdrop-blur-sm">
          {/* Organization Info */}
          <div className="border-b bg-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={organization.logo || "/placeholder-event.jpg"}
                alt={organization.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">{organization.name}</h2>
                <p className="text-xs text-muted-foreground truncate">{organization.address_name}</p>
              </div>
            </div>
            {reverseGeocodedAddress && reverseGeocodedAddress !== organization.address_name && (
              <p className="text-xs text-muted-foreground">{reverseGeocodedAddress}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-2">
            {managementSections.map((section) => {
              const Icon = section.icon;
              const isActive = location.pathname.includes(`/${section.id}`);
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => navigate(`/organization-management/${organizationId}/${section.id}`)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {section.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizationManagement;
