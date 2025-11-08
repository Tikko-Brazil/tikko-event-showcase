import React, { useState } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EventInfoHeader } from "@/components/EventInfoHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Ticket,
  CheckCircle2,
  Send,
  UserPlus,
  Gift,
  Edit,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoLight from "@/assets/logoLight.png";
import { EventGateway } from "@/lib/EventGateway";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);

export const EventManagementLayout = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileOverlay, setMobileOverlay] = useState<string | null>(null);

  // Get current section from URL
  const currentSection = location.pathname.split('/').pop() || 'overview';

  // Fetch event data and user role
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
  } = useQuery({
    queryKey: ["event-with-pricing", eventId],
    queryFn: () => eventGateway.getEventWithTicketPricing(Number(eventId)),
    enabled: !!eventId,
  });

  const {
    data: eventInfo,
    isLoading: eventInfoLoading,
  } = useQuery({
    queryKey: ["event-info", eventId],
    queryFn: () => eventGateway.getEventInfo(Number(eventId)),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const managementSections = [
    { id: "overview", label: t("eventManagement.tabs.overview"), icon: BarChart3 },
    { id: "edit", label: t("eventManagement.tabs.edit"), icon: Edit },
    { id: "analytics", label: t("eventManagement.tabs.analytics"), icon: TrendingUp },
    { id: "participants", label: t("eventManagement.tabs.participants"), icon: Users },
    { id: "tickets", label: t("eventManagement.tabs.tickets"), icon: Ticket },
    { id: "coupons", label: t("eventManagement.tabs.coupons"), icon: Gift },
    { id: "staff", label: t("eventManagement.tabs.staff"), icon: UsersRound },
    { id: "send-tickets", label: t("eventManagement.tabs.sendTickets"), icon: Send },
    { id: "validate", label: t("eventManagement.tabs.validate"), icon: CheckCircle2 },
    { id: "requests", label: t("eventManagement.tabs.requests"), icon: UserPlus },
  ];

  // Filter management sections based on user role
  const getFilteredSections = (userRole: string) => {
    switch (userRole.toLowerCase()) {
      case 'host':
      case 'manager':
        return managementSections; // All sections
      case 'coordinator':
        return managementSections.filter(section =>
          ['validate', 'participants', 'requests'].includes(section.id)
        );
      case 'validator':
        return managementSections.filter(section => section.id === 'validate');
      default:
        return managementSections; // Default to all sections
    }
  };

  // Get user role from API response
  const userRole = eventInfo?.user_role || 'validator'; // Default to validator (least privileges)
  const filteredSections = getFilteredSections(userRole);

  if (eventLoading || eventInfoLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (eventError || !eventData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load event</p>
            <Button onClick={() => navigate("/")}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const { event } = eventData;

  if (isMobile) {
    // Show specific management page content when on a non-overview management route
    if (currentSection && currentSection !== 'overview' && filteredSections.find(s => s.id === currentSection)) {
      return (
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/event-management/${eventId}/overview`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold">
                {filteredSections.find((s) => s.id === currentSection)?.label}
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

    // Show main menu (when on overview route - treat as main menu on mobile)
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-events")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoLight} alt="Tikko" className="h-6" />
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Event Header */}
        <EventInfoHeader
          status="upcoming"
          id={event.id}
          title={event.name}
          date={formatDate(event.start_date)}
          time={formatTime(event.start_date, event.end_date)}
          location={event.address_name || event.location}
        />

        {/* Management Grid Menu */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{t("eventManagement.header.eventManagement")}</h2>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {filteredSections.filter(section => section.id !== 'overview').map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => navigate(`/event-management/${eventId}/${section.id}`)}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/my-events")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("eventManagement.header.backToDashboard")}
            </Button>
            <img src={logoLight} alt="Tikko" className="h-8" />
          </div>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            {t("eventManagement.buttons.viewParticipantList")}
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r bg-card/50 backdrop-blur-sm">
          {/* Event Info */}
          <EventInfoHeader
            status="upcoming"
            id={event.id}
            title={event.name}
            date={formatDate(event.start_date)}
            time={formatTime(event.start_date, event.end_date)}
            location={event.address_name || event.location}
          />

          <nav className="p-4 space-y-2">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = currentSection === section.id;
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(`/event-management/${eventId}/${section.id}`)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {section.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Desktop Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{t("eventManagement.header.eventManagement")}</h1>
            <p className="text-muted-foreground">
              {t("eventManagement.header.description")}
            </p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
