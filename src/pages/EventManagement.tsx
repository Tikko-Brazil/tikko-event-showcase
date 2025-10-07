import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EventInfoHeader } from "@/components/EventInfoHeader";
import { EventOverview } from "@/components/EventOverview";
import { EventEditForm } from "@/components/EventEditForm";
import { EventAnalytics } from "@/components/EventAnalytics";
import { EventParticipants } from "@/components/EventParticipants";
import { EventTicketTypes } from "@/components/EventTicketTypes";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

  const renderCoupons = () => {
    // Filter coupons based on search and filter
    const filteredCoupons = allCoupons.filter((coupon) => {
      const matchesSearch = coupon.code
        .toLowerCase()
        .includes(couponSearch.toLowerCase());
      const matchesFilter =
        couponFilter === "all" ||
        (couponFilter === "active" && coupon.isActive) ||
        (couponFilter === "inactive" && !coupon.isActive);
      return matchesSearch && matchesFilter;
    });

    // Pagination for coupons
    const totalCouponPages = Math.ceil(filteredCoupons.length / itemsPerPage);
    const startIndex = (couponPage - 1) * itemsPerPage;
    const paginatedCoupons = filteredCoupons.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    const handleEditCoupon = (coupon: any) => {
      setEditingCoupon({ ...coupon });
    };

    const handleSaveEdit = () => {
      // In a real app, this would save to backend
      console.log("Saving coupon:", editingCoupon);
      setEditingCoupon(null);
    };

    const handleCreateCoupon = () => {
      // In a real app, this would save to backend
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
    };

    return (
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold">Coupons Management</h2>

          <Dialog
            open={isCreateCouponOpen}
            onOpenChange={setIsCreateCouponOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogDescription>
                  Configure your new discount coupon settings.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="DISCOUNT20"
                    className="uppercase"
                  />
                </div>

                <div>
                  <Label>Discount Type</Label>
                  <Select
                    value={newCoupon.type}
                    onValueChange={(value) =>
                      setNewCoupon({ ...newCoupon, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Percentage Discount
                      </SelectItem>
                      <SelectItem value="fixed">Fixed Amount (BRL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newCoupon.type === "percentage" ? (
                  <div>
                    <Label>Discount Percentage: {newCoupon.value}%</Label>
                    <Slider
                      value={[newCoupon.value]}
                      onValueChange={(value) =>
                        setNewCoupon({ ...newCoupon, value: value[0] })
                      }
                      max={100}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="value">Fixed Amount (BRL)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newCoupon.value}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          value: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="50"
                    />
                  </div>
                )}

                <div>
                  <Label>Max Usage: {newCoupon.maxUsage}</Label>
                  <Slider
                    value={[newCoupon.maxUsage]}
                    onValueChange={(value) =>
                      setNewCoupon({ ...newCoupon, maxUsage: value[0] })
                    }
                    max={1000}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={newCoupon.isActive}
                    onCheckedChange={(checked) =>
                      setNewCoupon({ ...newCoupon, isActive: !!checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ticketSpecific"
                    checked={newCoupon.isTicketSpecific}
                    onCheckedChange={(checked) =>
                      setNewCoupon({
                        ...newCoupon,
                        isTicketSpecific: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="ticketSpecific">
                    Apply to specific ticket type only
                  </Label>
                </div>

                {newCoupon.isTicketSpecific && (
                  <div>
                    <Label>Ticket Type</Label>
                    <Select
                      value={newCoupon.ticketType}
                      onValueChange={(value) =>
                        setNewCoupon({ ...newCoupon, ticketType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateCouponOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCoupon}>Create Coupon</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search coupons..."
              value={couponSearch}
              onChange={(e) => setCouponSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={couponFilter} onValueChange={setCouponFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coupons</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle>Coupons List</CardTitle>
            <CardDescription>
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredCoupons.length)} of{" "}
              {filteredCoupons.length} coupons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Desktop Header - Hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <span className="col-span-4">Code</span>
                <span className="col-span-2">Value</span>
                <span className="col-span-3">Usage</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-1">Actions</span>
              </div>

              <div className="space-y-2">
                {paginatedCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="grid grid-cols-12 gap-2 md:gap-4 text-sm py-3 border-b border-border/50 last:border-0 items-center"
                  >
                    {/* Code - Takes majority of width on mobile */}
                    <div className="col-span-6 md:col-span-4">
                      <span className="font-mono font-medium text-xs md:text-sm break-all">
                        {coupon.code}
                      </span>
                      {coupon.isTicketSpecific && (
                        <div className="text-xs text-muted-foreground mt-1">
                          → {coupon.ticketType}
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div className="col-span-2 md:col-span-2">
                      <span className="text-xs md:text-sm">
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : `R$ ${coupon.value}`}
                      </span>
                    </div>

                    {/* Usage */}
                    <div className="col-span-2 md:col-span-3">
                      <div className="text-xs md:text-sm">
                        {coupon.usage}/{coupon.maxUsage}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1 mt-1">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{
                            width: `${(coupon.usage / coupon.maxUsage) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Status - Different for mobile vs desktop */}
                    <div className="col-span-1 md:col-span-2">
                      {/* Mobile: Visual indicator only */}
                      <div className="md:hidden">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            coupon.isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                          title={coupon.isActive ? "Active" : "Inactive"}
                        />
                      </div>
                      {/* Desktop: Badge with text */}
                      <div className="hidden md:block">
                        <Badge
                          variant={coupon.isActive ? "default" : "secondary"}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 md:col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCoupon(coupon)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalCouponPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {startIndex + 1}-
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredCoupons.length
                    )}{" "}
                    of {filteredCoupons.length}
                  </p>

                  <div className="flex items-center gap-2">
                    {/* Desktop pagination with labels */}
                    <div className="hidden md:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (couponPage > 1) setCouponPage(couponPage - 1);
                        }}
                        disabled={couponPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (couponPage < totalCouponPages)
                            setCouponPage(couponPage + 1);
                        }}
                        disabled={couponPage >= totalCouponPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    {/* Mobile pagination with icons only */}
                    <div className="flex md:hidden items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (couponPage > 1) setCouponPage(couponPage - 1);
                        }}
                        disabled={couponPage <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (couponPage < totalCouponPages)
                            setCouponPage(couponPage + 1);
                        }}
                        disabled={couponPage >= totalCouponPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Coupon Dialog */}
        {editingCoupon && (
          <Dialog
            open={!!editingCoupon}
            onOpenChange={() => setEditingCoupon(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Coupon: {editingCoupon.code}</DialogTitle>
                <DialogDescription>
                  Modify coupon settings and restrictions.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Max Usage: {editingCoupon.maxUsage}</Label>
                  <Slider
                    value={[editingCoupon.maxUsage]}
                    onValueChange={(value) =>
                      setEditingCoupon({ ...editingCoupon, maxUsage: value[0] })
                    }
                    max={1000}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="editActive"
                    checked={editingCoupon.isActive}
                    onCheckedChange={(checked) =>
                      setEditingCoupon({ ...editingCoupon, isActive: checked })
                    }
                  />
                  <Label htmlFor="editActive">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="editTicketSpecific"
                    checked={editingCoupon.isTicketSpecific}
                    onCheckedChange={(checked) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        isTicketSpecific: checked,
                      })
                    }
                  />
                  <Label htmlFor="editTicketSpecific">
                    Apply to specific ticket type only
                  </Label>
                </div>

                {editingCoupon.isTicketSpecific && (
                  <div>
                    <Label>Ticket Type</Label>
                    <Select
                      value={editingCoupon.ticketType || ""}
                      onValueChange={(value) =>
                        setEditingCoupon({
                          ...editingCoupon,
                          ticketType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingCoupon(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

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

  const renderJoinRequests = () => {
    // Filter join requests based on status and search
    const filteredRequests = joinRequestsData.filter((request) => {
      const matchesSearch =
        requestSearch === "" ||
        request.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
        request.email.toLowerCase().includes(requestSearch.toLowerCase()) ||
        request.instagram.toLowerCase().includes(requestSearch.toLowerCase());

      return matchesSearch;
    });

    // Pagination
    const totalRequests = filteredRequests.length;
    const totalPages = Math.ceil(totalRequests / requestsPerPage);
    const startIndex = (requestPage - 1) * requestsPerPage;
    const endIndex = Math.min(startIndex + requestsPerPage, totalRequests);
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    const handleAcceptRequest = (requestId: number) => {
      // Mock accept logic
      console.log(`Accepting join request ${requestId}`);
    };

    const handleRejectRequest = (requestId: number) => {
      // Mock reject logic
      console.log(`Rejecting join request ${requestId}`);
    };

    return (
      <div className="space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Join Requests</h2>
            <p className="text-muted-foreground">
              Review and approve pending join requests from ticket purchasers
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search join requests..."
              value={requestSearch}
              onChange={(e) => setRequestSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Join Requests Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedRequests.map((request) => (
            <Card key={request.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-yellow-500 text-yellow-50">
                        {request.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">
                        {request.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {request.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Instagram:</span>
                    <span className="font-medium">{request.instagram}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ticket Type:</span>
                    <Badge variant="outline">{request.ticketType}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paid Value:</span>
                    <span className="font-medium">R${request.paidValue}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coupon:</span>
                    <span className="font-medium">
                      {request.coupon ? (
                        <Badge variant="secondary">{request.coupon}</Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Join Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject {request.name}'s join
                          request? They will be notified of this decision.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Accept Join Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to accept {request.name}'s join
                          request? They will be added to the approved
                          participants list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No join requests</h3>
            <p className="text-muted-foreground">
              {requestSearch
                ? "No requests match your search."
                : "All join requests have been processed."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              {startIndex + 1}-{endIndex} of {totalRequests} requests
            </p>

            <div className="flex items-center gap-2">
              {/* Desktop pagination with labels */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (requestPage > 1) setRequestPage(requestPage - 1);
                  }}
                  disabled={requestPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (requestPage < totalPages)
                      setRequestPage(requestPage + 1);
                  }}
                  disabled={requestPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Mobile pagination with icons only */}
              <div className="flex md:hidden items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (requestPage > 1) setRequestPage(requestPage - 1);
                  }}
                  disabled={requestPage <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (requestPage < totalPages)
                      setRequestPage(requestPage + 1);
                  }}
                  disabled={requestPage >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
