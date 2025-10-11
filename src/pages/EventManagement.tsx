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

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);

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
  const [salesTimeWindow, setSalesTimeWindow] = useState("24h");
  const [validationTimeWindow, setValidationTimeWindow] = useState("5h");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Coupon states
  const [couponFilter, setCouponFilter] = useState("all");
  const [couponSearch, setCouponSearch] = useState("");
  const [couponPage, setCouponPage] = useState(1);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: 10,
    maxUsage: 100,
    isActive: true,
    isTicketSpecific: false,
    ticketType: "",
  });

  // Join Requests states
  const [requestFilter, setRequestFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const requestsPerPage = 6;

  // Ticket Types states
  const [ticketTypeFilter, setTicketTypeFilter] = useState("all");
  const [ticketTypeSearch, setTicketTypeSearch] = useState("");
  const [ticketTypePage, setTicketTypePage] = useState(1);
  const [editingTicketType, setEditingTicketType] = useState<any>(null);
  const [isCreateTicketTypeOpen, setIsCreateTicketTypeOpen] = useState(false);
  const [newTicketType, setNewTicketType] = useState({
    name: "",
    gender: "all",
    value: 50,
    isActive: true,
  });

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

  // Mock participants data
  const participantsData = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      instagram: "@sarah_j",
      ticketType: "VIP",
      paidValue: 80,
      coupon: "EARLY20",
      validated: true,
      status: "approved",
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@gmail.com",
      instagram: "@mike_chen",
      ticketType: "General",
      paidValue: 50,
      coupon: null,
      validated: false,
      status: "approved",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@yahoo.com",
      instagram: "@emily_d",
      ticketType: "Student",
      paidValue: 30,
      coupon: "STUDENT50",
      validated: true,
      status: "approved",
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      email: "alex.rodriguez@hotmail.com",
      instagram: "@alex_rod",
      ticketType: "VIP",
      paidValue: 80,
      coupon: null,
      validated: false,
      status: "rejected",
    },
    {
      id: 5,
      name: "Jessica Wang",
      email: "jessica.wang@outlook.com",
      instagram: "@jess_wang",
      ticketType: "General",
      paidValue: 45,
      coupon: "FRIEND10",
      validated: true,
      status: "approved",
    },
    {
      id: 6,
      name: "David Smith",
      email: "david.smith@email.com",
      instagram: "@david_s",
      ticketType: "Student",
      paidValue: 30,
      coupon: "STUDENT50",
      validated: false,
      status: "approved",
    },
    {
      id: 7,
      name: "Maria Garcia",
      email: "maria.garcia@gmail.com",
      instagram: "@maria_g",
      ticketType: "VIP",
      paidValue: 80,
      coupon: null,
      validated: true,
      status: "approved",
    },
    {
      id: 8,
      name: "James Wilson",
      email: "james.wilson@yahoo.com",
      instagram: "@james_w",
      ticketType: "General",
      paidValue: 50,
      coupon: null,
      validated: false,
      status: "rejected",
    },
    {
      id: 9,
      name: "Lisa Brown",
      email: "lisa.brown@hotmail.com",
      instagram: "@lisa_b",
      ticketType: "Student",
      paidValue: 25,
      coupon: "EARLY20",
      validated: true,
      status: "approved",
    },
    {
      id: 10,
      name: "Tom Anderson",
      email: "tom.anderson@outlook.com",
      instagram: "@tom_a",
      ticketType: "VIP",
      paidValue: 80,
      coupon: null,
      validated: false,
      status: "approved",
    },
  ];

  // Mock join requests data
  const joinRequestsData = [
    {
      id: 11,
      name: "Anna Martinez",
      email: "anna.martinez@email.com",
      instagram: "@anna_m",
      ticketType: "VIP",
      paidValue: 80,
      coupon: null,
      validated: false,
      status: "pending",
    },
    {
      id: 12,
      name: "Chris Johnson",
      email: "chris.johnson@gmail.com",
      instagram: "@chris_j",
      ticketType: "General",
      paidValue: 50,
      coupon: "FRIEND10",
      validated: false,
      status: "pending",
    },
    {
      id: 13,
      name: "Sofia Rodriguez",
      email: "sofia.rodriguez@yahoo.com",
      instagram: "@sofia_r",
      ticketType: "Student",
      paidValue: 30,
      coupon: "STUDENT50",
      validated: false,
      status: "pending",
    },
    {
      id: 14,
      name: "Mark Thompson",
      email: "mark.thompson@hotmail.com",
      instagram: "@mark_t",
      ticketType: "VIP",
      paidValue: 80,
      coupon: null,
      validated: false,
      status: "pending",
    },
    {
      id: 15,
      name: "Elena Popov",
      email: "elena.popov@outlook.com",
      instagram: "@elena_p",
      ticketType: "General",
      paidValue: 45,
      coupon: "EARLY20",
      validated: false,
      status: "pending",
    },
    {
      id: 16,
      name: "Ryan Lee",
      email: "ryan.lee@email.com",
      instagram: "@ryan_l",
      ticketType: "Student",
      paidValue: 25,
      coupon: "STUDENT50",
      validated: false,
      status: "pending",
    },
    {
      id: 17,
      name: "Ryan Lee",
      email: "ryan.lee@email.com",
      instagram: "@ryan_l",
      ticketType: "Student",
      paidValue: 25,
      coupon: "STUDENT50",
      validated: false,
      status: "pending",
    },
    {
      id: 18,
      name: "Ryan Lee",
      email: "ryan.lee@email.com",
      instagram: "@ryan_l",
      ticketType: "Student",
      paidValue: 25,
      coupon: "STUDENT50",
      validated: false,
      status: "pending",
    },
    {
      id: 19,
      name: "Ryan Lee",
      email: "ryan.lee@email.com",
      instagram: "@ryan_l",
      ticketType: "Student",
      paidValue: 25,
      coupon: "STUDENT50",
      validated: false,
      status: "pending",
    },
  ];

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

  const renderOverview = () => <EventOverview eventData={mockEventData} />;

  const renderAnalytics = () => (
    <EventAnalytics eventId={parseInt(eventId!)} />
  );

  // Mock coupons data
  const allCoupons = [
    {
      id: 1,
      code: "EARLY20",
      type: "percentage",
      value: 20,
      usage: 45,
      maxUsage: 100,
      isActive: true,
      isTicketSpecific: false,
      ticketType: null,
    },
    {
      id: 2,
      code: "STUDENT50",
      type: "fixed",
      value: 50,
      usage: 23,
      maxUsage: 50,
      isActive: true,
      isTicketSpecific: true,
      ticketType: "Student",
    },
    {
      id: 3,
      code: "NEWUSER15",
      type: "percentage",
      value: 15,
      usage: 67,
      maxUsage: 200,
      isActive: true,
      isTicketSpecific: false,
      ticketType: null,
    },
    {
      id: 4,
      code: "VIP100",
      type: "fixed",
      value: 100,
      usage: 12,
      maxUsage: 25,
      isActive: false,
      isTicketSpecific: true,
      ticketType: "VIP",
    },
    {
      id: 5,
      code: "FLASH25",
      type: "percentage",
      value: 25,
      usage: 89,
      maxUsage: 100,
      isActive: false,
      isTicketSpecific: false,
      ticketType: null,
    },
    {
      id: 6,
      code: "GROUP30",
      type: "fixed",
      value: 30,
      usage: 34,
      maxUsage: 75,
      isActive: true,
      isTicketSpecific: true,
      ticketType: "Group",
    },
    {
      id: 7,
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      usage: 156,
      maxUsage: 300,
      isActive: true,
      isTicketSpecific: false,
      ticketType: null,
    },
    {
      id: 8,
      code: "LASTMIN40",
      type: "fixed",
      value: 40,
      usage: 8,
      maxUsage: 20,
      isActive: true,
      isTicketSpecific: true,
      ticketType: "Last Minute",
    },
  ];

  const ticketTypes = [
    "Early Bird",
    "Regular",
    "VIP",
    "Student",
    "Group",
    "Last Minute",
    "Premium",
    "Corporate",
  ];

  // Mock ticket types data
  const allTicketTypes = [
    {
      id: 1,
      name: "Early Bird",
      gender: "all",
      value: 40,
      totalSold: 25,
      isActive: true,
    },
    {
      id: 2,
      name: "Regular",
      gender: "all",
      value: 60,
      totalSold: 48,
      isActive: true,
    },
    {
      id: 3,
      name: "VIP",
      gender: "all",
      value: 120,
      totalSold: 12,
      isActive: true,
    },
    {
      id: 4,
      name: "Student",
      gender: "all",
      value: 30,
      totalSold: 18,
      isActive: true,
    },
    {
      id: 5,
      name: "Female Only",
      gender: "female",
      value: 50,
      totalSold: 22,
      isActive: true,
    },
    {
      id: 6,
      name: "Male Only",
      gender: "male",
      value: 50,
      totalSold: 19,
      isActive: false,
    },
    {
      id: 7,
      name: "Group",
      gender: "all",
      value: 45,
      totalSold: 30,
      isActive: true,
    },
    {
      id: 8,
      name: "Last Minute",
      gender: "all",
      value: 80,
      totalSold: 8,
      isActive: false,
    },
  ];

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
              onClick={() => navigate("/dashboard")}
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
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
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
