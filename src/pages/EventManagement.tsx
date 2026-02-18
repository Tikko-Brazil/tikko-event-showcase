import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EventInfoHeader } from "@/components/EventInfoHeader";
import { EventOverview } from "@/components/EventOverview";
import { EventEditForm } from "@/components/EventEditForm";
import { EventAnalytics } from "@/components/EventAnalytics";
import { EventParticipants } from "@/components/EventParticipants";
import { EventTicketTypes } from "@/components/EventTicketTypes";
import { EventCoupons } from "@/components/EventCoupons";
import { EventJoinRequests } from "@/components/EventJoinRequests";
import { EventStaff } from "@/components/EventStaff";
import SendTickets from "@/components/SendTickets";
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
  FileText,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoLight from "@/assets/logoLight.png";

import { EventGateway } from "@/lib/EventGateway";

const eventGateway = new EventGateway(import.meta.env.VITE_API_BASE_URL);

const EventManagement = () => {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch event data
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
  } = useQuery({
    queryKey: ["event-with-pricing", eventId],
    queryFn: () => eventGateway.getEventWithTicketPricing(Number(eventId)),
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
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileOverlay, setMobileOverlay] = useState<string | null>(null);

  if (eventLoading) {
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

  // Mock event data for components that still need it
  const mockEventData = {
    id: eventId,
    title: event.name,
    date: formatDate(event.start_date),
    time: formatTime(event.start_date, event.end_date),
    location: event.address_name || event.location,
    status: "upcoming",
    description: event.description,
    attendees: 45,
    capacity: 100,
    revenue: 2250,
    ticketsSold: 45,
    ticketsAvailable: 55,
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

  const renderOverview = () => <EventOverview eventId={parseInt(eventId!)} />;

  const renderAnalytics = () => (
    <EventAnalytics eventId={parseInt(eventId!)} />
  );


  const renderCoupons = () => <EventCoupons eventId={parseInt(eventId!)} />;

  const renderParticipants = () => (
    <EventParticipants eventId={parseInt(eventId!)} />
  );

  const renderJoinRequests = () => (
    <EventJoinRequests eventId={parseInt(eventId!)} />
  );

  const renderTicketTypes = () => (
    <EventTicketTypes eventId={parseInt(eventId!)} />
  );

  const renderStaff = () => <EventStaff eventId={parseInt(eventId!)} />;

  const renderSendTickets = () => <SendTickets eventId={parseInt(eventId!)} />;

  const renderEditEvent = () => <EventEditForm event={event} />;

  const renderPlaceholderSection = (title: string, description: string) => (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button>Coming Soon</Button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "edit":
        return renderEditEvent();
      case "analytics":
        return renderAnalytics();
      case "participants":
        return renderParticipants();
      case "tickets":
        return renderTicketTypes();
      case "coupons":
        return renderCoupons();
      case "staff":
        return renderStaff();
      case "send-tickets":
        return renderSendTickets();
      case "validate":
        return renderPlaceholderSection(
          "Validate Tickets",
          "Scan and validate tickets at the event entrance."
        );
      case "requests":
        return renderJoinRequests();
      default:
        return renderOverview();
    }
  };

  if (isMobile) {
    // Full-screen overlay for mobile management sections
    if (mobileOverlay) {
      return (
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOverlay(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold">
                {managementSections.find((s) => s.id === mobileOverlay)?.label}
              </h1>
              <div className="w-10" />
            </div>
          </header>

          <main className="p-4">
            {mobileOverlay === "overview"
              ? renderOverview()
              : mobileOverlay === "edit"
                ? renderEditEvent()
                : mobileOverlay === "analytics"
                  ? renderAnalytics()
                  : mobileOverlay === "participants"
                    ? renderParticipants()
                    : mobileOverlay === "tickets"
                      ? renderTicketTypes()
                      : mobileOverlay === "coupons"
                        ? renderCoupons()
                        : mobileOverlay === "staff"
                          ? renderStaff()
                          : mobileOverlay === "send-tickets"
                            ? renderSendTickets()
                            : mobileOverlay === "requests"
                              ? renderJoinRequests()
                              : renderPlaceholderSection(
                                managementSections.find((s) => s.id === mobileOverlay)
                                  ?.label || "",
                                `Manage your event ${mobileOverlay}.`
                              )}
          </main>
        </div>
      );
    }

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

        {/* Quick Stats */}
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">133</p>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      R$ 400,33
                    </p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Grid Menu */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{t("eventManagement.header.eventManagement")}</h2>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {managementSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setMobileOverlay(section.id)}
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
            {managementSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(section.id)}
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EventManagement;
