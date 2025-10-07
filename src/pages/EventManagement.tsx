import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EventInfoHeader } from "@/components/EventInfoHeader";
import { EventOverview } from "@/components/EventOverview";
import { EventEditForm } from "@/components/EventEditForm";
import { EventAnalytics } from "@/components/EventAnalytics";
import { EventParticipants } from "@/components/EventParticipants";
import { EventTicketTypes } from "@/components/EventTicketTypes";
import { EventCoupons } from "@/components/EventCoupons";
import { EventJoinRequests } from "@/components/EventJoinRequests";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Ticket,
  CheckCircle2,
  UserPlus,
  Gift,
  Edit,
  Eye,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Filter,
  X,
  Save,
  Calendar as CalendarIcon,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoLight from "@/assets/logoLight.png";

const EventManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // Participants states
  const [participantFilter, setParticipantFilter] = useState("all");
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantPage, setParticipantPage] = useState(1);
  const participantsPerPage = 6;

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

  // Edit Event states
  const [editEventData, setEditEventData] = useState({
    name: "My Music Showcase 2024",
    image: "/placeholder.svg",
    description:
      "An intimate evening featuring emerging artists and local musicians.",
    startDate: new Date(2024, 6, 10, 20, 0), // Jul 10, 2024, 8:00 PM
    endDate: new Date(2024, 6, 10, 23, 30), // Jul 10, 2024, 11:30 PM
    locationName: "The Underground",
    location: "The Underground, NYC",
    autoAcceptRequests: true,
    isActive: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editEventData.image);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [locationSuggestions] = useState([
    "The Underground, NYC",
    "Madison Square Garden, NYC",
    "Brooklyn Bowl, NYC",
    "Terminal 5, NYC",
  ]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartTimeChange = (field: "hours" | "minutes", value: number) => {
    const newDate = new Date(editEventData.startDate);
    if (field === "hours") {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setEditEventData((prev) => ({ ...prev, startDate: newDate }));
  };

  const handleEndTimeChange = (field: "hours" | "minutes", value: number) => {
    const newDate = new Date(editEventData.endDate);
    if (field === "hours") {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setEditEventData((prev) => ({ ...prev, endDate: newDate }));
  };

  const handleSaveEvent = () => {
    // Handle save logic here
    console.log("Saving event data:", editEventData);
    // Show success message or handle the save
  };

  const handleLocationSelect = (location: string) => {
    setEditEventData((prev) => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  // Mock event data
  const eventData = {
    id: eventId,
    title: "My Music Showcase 2024",
    date: "Jul 10, 2024",
    time: "8:00 PM",
    location: "The Underground, NYC",
    status: "upcoming",
    description:
      "An intimate evening featuring emerging artists and local musicians.",
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
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "edit", label: "Edit Event", icon: Edit },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "participants", label: "Participants", icon: Users },
    { id: "tickets", label: "Ticket Types", icon: Ticket },
    { id: "coupons", label: "Coupons", icon: Gift },
    { id: "validate", label: "Validate Tickets", icon: CheckCircle2 },
    { id: "requests", label: "Join Requests", icon: UserPlus },
  ];

  const renderOverview = () => <EventOverview eventData={eventData} />;

  const renderAnalytics = () => (
    <EventAnalytics
      salesTimeWindow={salesTimeWindow}
      setSalesTimeWindow={setSalesTimeWindow}
      validationTimeWindow={validationTimeWindow}
      setValidationTimeWindow={setValidationTimeWindow}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      itemsPerPage={itemsPerPage}
    />
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

  const renderCoupons = () => (
    <EventCoupons
      allCoupons={allCoupons}
      couponSearch={couponSearch}
      setCouponSearch={setCouponSearch}
      couponFilter={couponFilter}
      setCouponFilter={setCouponFilter}
      couponPage={couponPage}
      setCouponPage={setCouponPage}
      itemsPerPage={itemsPerPage}
      isCreateCouponOpen={isCreateCouponOpen}
      setIsCreateCouponOpen={setIsCreateCouponOpen}
      newCoupon={newCoupon}
      setNewCoupon={setNewCoupon}
      editingCoupon={editingCoupon}
      setEditingCoupon={setEditingCoupon}
      ticketTypes={ticketTypes}
      onCreateCoupon={() => {
        console.log("Creating coupon:", newCoupon);
        setIsCreateCouponOpen(false);
        setNewCoupon({
          code: "",
          type: "percentage",
          value: 10,
          maxUsage: 100,
          isActive: true,
          isTicketSpecific: false,
          ticketType: "",
        });
      }}
      onEditCoupon={(coupon) => {
        setEditingCoupon({ ...coupon });
      }}
      onSaveEdit={() => {
        console.log("Saving coupon:", editingCoupon);
        setEditingCoupon(null);
      }}
    />
  );

  const renderParticipants = () => (
    <EventParticipants
      participantsData={participantsData}
      participantSearch={participantSearch}
      setParticipantSearch={setParticipantSearch}
      participantFilter={participantFilter}
      setParticipantFilter={setParticipantFilter}
      participantPage={participantPage}
      setParticipantPage={setParticipantPage}
      participantsPerPage={participantsPerPage}
      onRefund={(participantId) => {
        console.log(`Refunding participant ${participantId}`);
      }}
    />
  );

  const renderJoinRequests = () => (
    <EventJoinRequests
      joinRequestsData={joinRequestsData}
      requestSearch={requestSearch}
      setRequestSearch={setRequestSearch}
      requestPage={requestPage}
      setRequestPage={setRequestPage}
      requestsPerPage={requestsPerPage}
      onAcceptRequest={(requestId) => {
        console.log(`Accepting join request ${requestId}`);
      }}
      onRejectRequest={(requestId) => {
        console.log(`Rejecting join request ${requestId}`);
      }}
    />
  );

  const renderTicketTypes = () => (
    <EventTicketTypes
      allTicketTypes={allTicketTypes}
      ticketTypeSearch={ticketTypeSearch}
      setTicketTypeSearch={setTicketTypeSearch}
      ticketTypeFilter={ticketTypeFilter}
      setTicketTypeFilter={setTicketTypeFilter}
      ticketTypePage={ticketTypePage}
      setTicketTypePage={setTicketTypePage}
      itemsPerPage={itemsPerPage}
      isCreateTicketTypeOpen={isCreateTicketTypeOpen}
      setIsCreateTicketTypeOpen={setIsCreateTicketTypeOpen}
      newTicketType={newTicketType}
      setNewTicketType={setNewTicketType}
      editingTicketType={editingTicketType}
      setEditingTicketType={setEditingTicketType}
      onCreateTicketType={() => {
        console.log("Creating ticket type:", newTicketType);
        setIsCreateTicketTypeOpen(false);
        setNewTicketType({
          name: "",
          gender: "all",
          value: 50,
          isActive: true,
        });
      }}
      onEditTicketType={(ticketType) => {
        setEditingTicketType({ ...ticketType });
      }}
      onSaveEdit={() => {
        console.log("Saving ticket type:", editingTicketType);
        setEditingTicketType(null);
      }}
      onDeleteTicketType={(id) => {
        console.log("Deleting ticket type:", id);
      }}
    />
  );

  const renderEditEvent = () => (
    <EventEditForm
      editEventData={editEventData}
      onSave={(values) => {
        console.log("Saving event data:", values);
        // Handle save logic here
      }}
      locationSuggestions={locationSuggestions}
    />
  );

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
          status={eventData.status}
          id={eventData.id}
          title={eventData.title}
          date={eventData.date}
          time={eventData.time}
          location={eventData.location}
        />

        {/* Quick Stats */}
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {eventData.attendees}
                    </p>
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
                      ${eventData.revenue}
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
          <h2 className="text-lg font-semibold mb-4">Event Management</h2>
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
              Back to Dashboard
            </Button>
            <img src={logoLight} alt="Tikko" className="h-8" />
          </div>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            View Participant List
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r bg-card/50 backdrop-blur-sm">
          {/* Event Info */}
          <EventInfoHeader
            status={eventData.status}
            id={eventData.id}
            title={eventData.title}
            date={eventData.date}
            time={eventData.time}
            location={eventData.location}
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
            <h1 className="text-3xl font-bold mb-2">Event Management</h1>
            <p className="text-muted-foreground">
              Manage your event settings, view analytics, and interact with
              participants.
            </p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EventManagement;
