import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Image as ImageIcon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Legend
} from 'recharts';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import logoLight from '@/assets/logoLight.png';

const EventManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileOverlay, setMobileOverlay] = useState<string | null>(null);
  const [salesTimeWindow, setSalesTimeWindow] = useState('24h');
  const [validationTimeWindow, setValidationTimeWindow] = useState('5h');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Coupon states
  const [couponFilter, setCouponFilter] = useState('all');
  const [couponSearch, setCouponSearch] = useState('');
  const [couponPage, setCouponPage] = useState(1);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    maxUsage: 100,
    isActive: true,
    isTicketSpecific: false,
    ticketType: ''
  });

  // Participants states
  const [participantFilter, setParticipantFilter] = useState('all');
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantPage, setParticipantPage] = useState(1);
  const participantsPerPage = 6;

  // Join Requests states
  const [requestFilter, setRequestFilter] = useState('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestPage, setRequestPage] = useState(1);
  const requestsPerPage = 6;

  // Ticket Types states
  const [ticketTypeFilter, setTicketTypeFilter] = useState('all');
  const [ticketTypeSearch, setTicketTypeSearch] = useState('');
  const [ticketTypePage, setTicketTypePage] = useState(1);
  const [editingTicketType, setEditingTicketType] = useState<any>(null);
  const [isCreateTicketTypeOpen, setIsCreateTicketTypeOpen] = useState(false);
  const [newTicketType, setNewTicketType] = useState({
    name: '',
    gender: 'all',
    value: 50,
    isActive: true
  });

  // Edit Event states
  const [editEventData, setEditEventData] = useState({
    name: 'My Music Showcase 2024',
    image: '/placeholder.svg',
    description: 'An intimate evening featuring emerging artists and local musicians.',
    startDate: new Date(2024, 6, 10, 20, 0), // Jul 10, 2024, 8:00 PM
    endDate: new Date(2024, 6, 10, 23, 30), // Jul 10, 2024, 11:30 PM
    locationName: 'The Underground',
    location: 'The Underground, NYC',
    autoAcceptRequests: true,
    isActive: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editEventData.image);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [locationSuggestions] = useState([
    'The Underground, NYC',
    'Madison Square Garden, NYC',
    'Brooklyn Bowl, NYC',
    'Terminal 5, NYC'
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

  const handleStartTimeChange = (field: 'hours' | 'minutes', value: number) => {
    const newDate = new Date(editEventData.startDate);
    if (field === 'hours') {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setEditEventData(prev => ({ ...prev, startDate: newDate }));
  };

  const handleEndTimeChange = (field: 'hours' | 'minutes', value: number) => {
    const newDate = new Date(editEventData.endDate);
    if (field === 'hours') {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setEditEventData(prev => ({ ...prev, endDate: newDate }));
  };

  const handleSaveEvent = () => {
    // Handle save logic here
    console.log('Saving event data:', editEventData);
    // Show success message or handle the save
  };

  const handleLocationSelect = (location: string) => {
    setEditEventData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  // Mock event data
  const eventData = {
    id: eventId,
    title: 'My Music Showcase 2024',
    date: 'Jul 10, 2024',
    time: '8:00 PM',
    location: 'The Underground, NYC',
    status: 'upcoming',
    description: 'An intimate evening featuring emerging artists and local musicians.',
    attendees: 45,
    capacity: 100,
    revenue: 2250,
    ticketsSold: 45,
    ticketsAvailable: 55
  };

  // Mock participants data
  const participantsData = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      instagram: '@sarah_j',
      ticketType: 'VIP',
      paidValue: 80,
      coupon: 'EARLY20',
      validated: true,
      status: 'approved'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.chen@gmail.com',
      instagram: '@mike_chen',
      ticketType: 'General',
      paidValue: 50,
      coupon: null,
      validated: false,
      status: 'approved'
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@yahoo.com',
      instagram: '@emily_d',
      ticketType: 'Student',
      paidValue: 30,
      coupon: 'STUDENT50',
      validated: true,
      status: 'approved'
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@hotmail.com',
      instagram: '@alex_rod',
      ticketType: 'VIP',
      paidValue: 80,
      coupon: null,
      validated: false,
      status: 'rejected'
    },
    {
      id: 5,
      name: 'Jessica Wang',
      email: 'jessica.wang@outlook.com',
      instagram: '@jess_wang',
      ticketType: 'General',
      paidValue: 45,
      coupon: 'FRIEND10',
      validated: true,
      status: 'approved'
    },
    {
      id: 6,
      name: 'David Smith',
      email: 'david.smith@email.com',
      instagram: '@david_s',
      ticketType: 'Student',
      paidValue: 30,
      coupon: 'STUDENT50',
      validated: false,
      status: 'approved'
    },
    {
      id: 7,
      name: 'Maria Garcia',
      email: 'maria.garcia@gmail.com',
      instagram: '@maria_g',
      ticketType: 'VIP',
      paidValue: 80,
      coupon: null,
      validated: true,
      status: 'approved'
    },
    {
      id: 8,
      name: 'James Wilson',
      email: 'james.wilson@yahoo.com',
      instagram: '@james_w',
      ticketType: 'General',
      paidValue: 50,
      coupon: null,
      validated: false,
      status: 'rejected'
    },
    {
      id: 9,
      name: 'Lisa Brown',
      email: 'lisa.brown@hotmail.com',
      instagram: '@lisa_b',
      ticketType: 'Student',
      paidValue: 25,
      coupon: 'EARLY20',
      validated: true,
      status: 'approved'
    },
    {
      id: 10,
      name: 'Tom Anderson',
      email: 'tom.anderson@outlook.com',
      instagram: '@tom_a',
      ticketType: 'VIP',
      paidValue: 80,
      coupon: null,
      validated: false,
      status: 'approved'
    }
  ];

  // Mock join requests data
  const joinRequestsData = [
    {
      id: 11,
      name: 'Anna Martinez',
      email: 'anna.martinez@email.com',
      instagram: '@anna_m',
      ticketType: 'VIP',
      paidValue: 80,
      coupon: null,
      validated: false,
      status: 'pending'
    },
    {
      id: 12,
      name: 'Chris Johnson',
      email: 'chris.johnson@gmail.com',
      instagram: '@chris_j',
      ticketType: 'General',
      paidValue: 50,
      coupon: 'FRIEND10',
      validated: false,
      status: 'pending'
    },
    {
      id: 13,
      name: 'Sofia Rodriguez',
      email: 'sofia.rodriguez@yahoo.com',
      instagram: '@sofia_r',
      ticketType: 'Student',
      paidValue: 30,
      coupon: 'STUDENT50',
      validated: false,
      status: 'pending'
    },
    {
      id: 14,
      name: 'Mark Thompson',
      email: 'mark.thompson@hotmail.com',
      instagram: '@mark_t',
      ticketType: 'VIP',
      paidValue: 80,
      coupon: null,
      validated: false,
      status: 'pending'
    },
    {
      id: 15,
      name: 'Elena Popov',
      email: 'elena.popov@outlook.com',
      instagram: '@elena_p',
      ticketType: 'General',
      paidValue: 45,
      coupon: 'EARLY20',
      validated: false,
      status: 'pending'
    },
    {
      id: 16,
      name: 'Ryan Lee',
      email: 'ryan.lee@email.com',
      instagram: '@ryan_l',
      ticketType: 'Student',
      paidValue: 25,
      coupon: 'STUDENT50',
      validated: false,
      status: 'pending'
    }
  ];

  const managementSections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'edit', label: 'Edit Event', icon: Edit },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'tickets', label: 'Ticket Types', icon: Ticket },
    { id: 'coupons', label: 'Coupons', icon: Gift },
    { id: 'validate', label: 'Validate Tickets', icon: CheckCircle2 },
    { id: 'requests', label: 'Join Requests', icon: UserPlus }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventData.attendees}</div>
            <p className="text-xs text-muted-foreground">
              {eventData.capacity - eventData.attendees} spots remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${eventData.revenue}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventData.ticketsSold}</div>
            <p className="text-xs text-muted-foreground">
              {eventData.ticketsAvailable} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% increase
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'Ticket purchased', user: 'Sarah Johnson', time: '2 minutes ago' },
              { action: 'Event shared', user: 'Mike Chen', time: '15 minutes ago' },
              { action: 'Ticket purchased', user: 'Emily Davis', time: '1 hour ago' },
              { action: 'Join request', user: 'Alex Rodriguez', time: '2 hours ago' }
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{activity.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Event Details
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              View Participant List
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Create Discount Code
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Validate Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    // Fake analytics data
    const analyticsData = {
      totalTickets: 150,
      liquidRevenue: 7500,
      validatedTickets: 89,
      validatedPercentage: 59,
      pageVisits: 2340,
      conversionRate: 6.4,
      avgAge: 28,
      avgMaleAge: 29,
      avgFemaleAge: 27,
      pendingRequests: 12,
      approvedRequests: 45,
      rejectedRequests: 8,
      freeTickets: 15,
      paidTickets: 135
    };

    // Sales data based on selected time window
    const salesDataSets = {
      '1h': [
        { time: '60m', tickets: 1 },
        { time: '50m', tickets: 0 },
        { time: '40m', tickets: 2 },
        { time: '30m', tickets: 1 },
        { time: '20m', tickets: 3 },
        { time: '10m', tickets: 2 }
      ],
      '3h': [
        { time: '3h', tickets: 5 },
        { time: '2.5h', tickets: 8 },
        { time: '2h', tickets: 12 },
        { time: '1.5h', tickets: 15 },
        { time: '1h', tickets: 18 },
        { time: '30m', tickets: 9 }
      ],
      '6h': [
        { time: '6h', tickets: 8 },
        { time: '5h', tickets: 12 },
        { time: '4h', tickets: 15 },
        { time: '3h', tickets: 22 },
        { time: '2h', tickets: 18 },
        { time: '1h', tickets: 25 }
      ],
      '12h': [
        { time: '12h', tickets: 15 },
        { time: '10h', tickets: 22 },
        { time: '8h', tickets: 28 },
        { time: '6h', tickets: 35 },
        { time: '4h', tickets: 42 },
        { time: '2h', tickets: 48 }
      ],
      '24h': [
        { time: '24h', tickets: 25 },
        { time: '20h', tickets: 35 },
        { time: '16h', tickets: 42 },
        { time: '12h', tickets: 55 },
        { time: '8h', tickets: 68 },
        { time: '4h', tickets: 75 }
      ]
    };

    // Validation data based on selected time window
    const validationDataSets = {
      '15m': [
        { time: '15m', validated: 5 },
        { time: '12m', validated: 8 },
        { time: '9m', validated: 12 },
        { time: '6m', validated: 15 },
        { time: '3m', validated: 18 }
      ],
      '30m': [
        { time: '30m', validated: 12 },
        { time: '25m', validated: 18 },
        { time: '20m', validated: 25 },
        { time: '15m', validated: 32 },
        { time: '10m', validated: 28 },
        { time: '5m', validated: 35 }
      ],
      '1h': [
        { time: '60m', validated: 15 },
        { time: '50m', validated: 22 },
        { time: '40m', validated: 28 },
        { time: '30m', validated: 35 },
        { time: '20m', validated: 41 },
        { time: '10m', validated: 45 }
      ],
      '2h': [
        { time: '2h', validated: 25 },
        { time: '100m', validated: 32 },
        { time: '80m', validated: 38 },
        { time: '60m', validated: 45 },
        { time: '40m', validated: 52 },
        { time: '20m', validated: 58 }
      ],
      '5h': [
        { time: '5h', validated: 35 },
        { time: '4h', validated: 45 },
        { time: '3h', validated: 55 },
        { time: '2h', validated: 65 },
        { time: '1h', validated: 75 },
        { time: '30m', validated: 89 }
      ]
    };

    const genderData = [
      { name: 'Male', value: 55, fill: 'hsl(var(--primary))' },
      { name: 'Female', value: 45, fill: 'hsl(var(--chart-2))' }
    ];

    const ageDistribution = [
      { age: '0-17', count: 5 },
      { age: '18-24', count: 45 },
      { age: '25-34', count: 62 },
      { age: '35-44', count: 28 },
      { age: '45-54', count: 8 },
      { age: '55+', count: 2 }
    ];

    const allTicketTypes = [
      { type: 'Early Bird', lot: 'Lot 1', amount: 50, revenue: 2000 },
      { type: 'Regular', lot: 'Lot 2', amount: 80, revenue: 4000 },
      { type: 'VIP', lot: 'Lot 3', amount: 20, revenue: 1500 },
      { type: 'Student', lot: 'Lot 4', amount: 30, revenue: 900 },
      { type: 'Group', lot: 'Lot 5', amount: 25, revenue: 1250 },
      { type: 'Last Minute', lot: 'Lot 6', amount: 15, revenue: 900 },
      { type: 'Premium', lot: 'Lot 7', amount: 10, revenue: 800 },
      { type: 'Corporate', lot: 'Lot 8', amount: 12, revenue: 960 }
    ];

    // Pagination logic
    const totalPages = Math.ceil(allTicketTypes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const ticketTypes = allTicketTypes.slice(startIndex, startIndex + itemsPerPage);

    const TimeWindowSelector = ({ 
      options, 
      selected, 
      onSelect, 
      className = "" 
    }: { 
      options: string[], 
      selected: string, 
      onSelect: (value: string) => void, 
      className?: string 
    }) => (
      <div className={`flex bg-muted rounded-lg p-1 ${className}`}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selected === option 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Tickets Issued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalTickets}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Liquid Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analyticsData.liquidRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Validated Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.validatedTickets}</div>
              <p className="text-xs text-muted-foreground">{analyticsData.validatedPercentage}% of total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">{analyticsData.pageVisits} page visits</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Ticket Sales Chart */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Tickets Sold</CardTitle>
                <TimeWindowSelector 
                  options={['1h', '3h', '6h', '12h', '24h']}
                  selected={salesTimeWindow}
                  onSelect={setSalesTimeWindow}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesDataSets[salesTimeWindow as keyof typeof salesDataSets]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="tickets" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Validation Chart */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Ticket Validations</CardTitle>
                <TimeWindowSelector 
                  options={['15m', '30m', '1h', '2h', '5h']}
                  selected={validationTimeWindow}
                  onSelect={setValidationTimeWindow}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={validationDataSets[validationTimeWindow as keyof typeof validationDataSets]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="validated" 
                      fill="hsl(var(--chart-2))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demographics Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Age Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Age Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Age</span>
                <span className="text-sm font-medium">{analyticsData.avgAge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Male Age</span>
                <span className="text-sm font-medium">{analyticsData.avgMaleAge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Female Age</span>
                <span className="text-sm font-medium">{analyticsData.avgFemaleAge}</span>
              </div>
            </CardContent>
          </Card>

          {/* Join Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Join Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <Badge variant="outline">{analyticsData.pendingRequests}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Approved</span>
                <Badge variant="default">{analyticsData.approvedRequests}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <Badge variant="destructive">{analyticsData.rejectedRequests}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Age Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="age" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--chart-3))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Types Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <span>Type</span>
                <span>Lot</span>
                <span>Amount</span>
                <span>Revenue</span>
              </div>
              <div className="space-y-2">
                {ticketTypes.map((ticket, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium">{ticket.type}</span>
                    <span className="text-muted-foreground">{ticket.lot}</span>
                    <span>{ticket.amount}</span>
                    <span className="font-medium">${ticket.revenue}</span>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allTicketTypes.length)} of {allTicketTypes.length} entries
                </p>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Distribution */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Paid Tickets</span>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.paidTickets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Free Tickets</span>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.freeTickets}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Analytics Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Detailed Charts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Mock coupons data
  const allCoupons = [
    { id: 1, code: 'EARLY20', type: 'percentage', value: 20, usage: 45, maxUsage: 100, isActive: true, isTicketSpecific: false, ticketType: null },
    { id: 2, code: 'STUDENT50', type: 'fixed', value: 50, usage: 23, maxUsage: 50, isActive: true, isTicketSpecific: true, ticketType: 'Student' },
    { id: 3, code: 'NEWUSER15', type: 'percentage', value: 15, usage: 67, maxUsage: 200, isActive: true, isTicketSpecific: false, ticketType: null },
    { id: 4, code: 'VIP100', type: 'fixed', value: 100, usage: 12, maxUsage: 25, isActive: false, isTicketSpecific: true, ticketType: 'VIP' },
    { id: 5, code: 'FLASH25', type: 'percentage', value: 25, usage: 89, maxUsage: 100, isActive: false, isTicketSpecific: false, ticketType: null },
    { id: 6, code: 'GROUP30', type: 'fixed', value: 30, usage: 34, maxUsage: 75, isActive: true, isTicketSpecific: true, ticketType: 'Group' },
    { id: 7, code: 'WELCOME10', type: 'percentage', value: 10, usage: 156, maxUsage: 300, isActive: true, isTicketSpecific: false, ticketType: null },
    { id: 8, code: 'LASTMIN40', type: 'fixed', value: 40, usage: 8, maxUsage: 20, isActive: true, isTicketSpecific: true, ticketType: 'Last Minute' }
  ];

  const ticketTypes = ['Early Bird', 'Regular', 'VIP', 'Student', 'Group', 'Last Minute', 'Premium', 'Corporate'];

  // Mock ticket types data
  const allTicketTypes = [
    { id: 1, name: 'Early Bird', gender: 'all', value: 40, totalSold: 25, isActive: true },
    { id: 2, name: 'Regular', gender: 'all', value: 60, totalSold: 48, isActive: true },
    { id: 3, name: 'VIP', gender: 'all', value: 120, totalSold: 12, isActive: true },
    { id: 4, name: 'Student', gender: 'all', value: 30, totalSold: 18, isActive: true },
    { id: 5, name: 'Female Only', gender: 'female', value: 50, totalSold: 22, isActive: true },
    { id: 6, name: 'Male Only', gender: 'male', value: 50, totalSold: 19, isActive: false },
    { id: 7, name: 'Group', gender: 'all', value: 45, totalSold: 30, isActive: true },
    { id: 8, name: 'Last Minute', gender: 'all', value: 80, totalSold: 8, isActive: false }
  ];

  const renderCoupons = () => {
    // Filter coupons based on search and filter
    const filteredCoupons = allCoupons.filter(coupon => {
      const matchesSearch = coupon.code.toLowerCase().includes(couponSearch.toLowerCase());
      const matchesFilter = couponFilter === 'all' || 
        (couponFilter === 'active' && coupon.isActive) ||
        (couponFilter === 'inactive' && !coupon.isActive);
      return matchesSearch && matchesFilter;
    });

    // Pagination for coupons
    const totalCouponPages = Math.ceil(filteredCoupons.length / itemsPerPage);
    const startIndex = (couponPage - 1) * itemsPerPage;
    const paginatedCoupons = filteredCoupons.slice(startIndex, startIndex + itemsPerPage);

    const handleEditCoupon = (coupon: any) => {
      setEditingCoupon({ ...coupon });
    };

    const handleSaveEdit = () => {
      // In a real app, this would save to backend
      console.log('Saving coupon:', editingCoupon);
      setEditingCoupon(null);
    };

    const handleCreateCoupon = () => {
      // In a real app, this would save to backend
      console.log('Creating coupon:', newCoupon);
      setIsCreateCouponOpen(false);
      setNewCoupon({
        code: '',
        type: 'percentage',
        value: 10,
        maxUsage: 100,
        isActive: true,
        isTicketSpecific: false,
        ticketType: ''
      });
    };

    return (
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold">Coupons Management</h2>
          
          <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
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
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="DISCOUNT20"
                    className="uppercase"
                  />
                </div>

                <div>
                  <Label>Discount Type</Label>
                  <Select value={newCoupon.type} onValueChange={(value) => setNewCoupon({ ...newCoupon, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Discount</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (BRL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newCoupon.type === 'percentage' ? (
                  <div>
                    <Label>Discount Percentage: {newCoupon.value}%</Label>
                    <Slider
                      value={[newCoupon.value]}
                      onValueChange={(value) => setNewCoupon({ ...newCoupon, value: value[0] })}
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
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: parseInt(e.target.value) || 0 })}
                      placeholder="50"
                    />
                  </div>
                )}

                <div>
                  <Label>Max Usage: {newCoupon.maxUsage}</Label>
                  <Slider
                    value={[newCoupon.maxUsage]}
                    onValueChange={(value) => setNewCoupon({ ...newCoupon, maxUsage: value[0] })}
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
                    onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, isActive: !!checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ticketSpecific"
                    checked={newCoupon.isTicketSpecific}
                    onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, isTicketSpecific: !!checked })}
                  />
                  <Label htmlFor="ticketSpecific">Apply to specific ticket type only</Label>
                </div>

                {newCoupon.isTicketSpecific && (
                  <div>
                    <Label>Ticket Type</Label>
                    <Select value={newCoupon.ticketType} onValueChange={(value) => setNewCoupon({ ...newCoupon, ticketType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateCouponOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCoupon}>
                  Create Coupon
                </Button>
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCoupons.length)} of {filteredCoupons.length} coupons
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
                  <div key={coupon.id} className="grid grid-cols-12 gap-2 md:gap-4 text-sm py-3 border-b border-border/50 last:border-0 items-center">
                    {/* Code - Takes majority of width on mobile */}
                    <div className="col-span-6 md:col-span-4">
                      <span className="font-mono font-medium text-xs md:text-sm break-all">{coupon.code}</span>
                      {coupon.isTicketSpecific && (
                        <div className="text-xs text-muted-foreground mt-1">→ {coupon.ticketType}</div>
                      )}
                    </div>
                    
                    {/* Value */}
                    <div className="col-span-2 md:col-span-2">
                      <span className="text-xs md:text-sm">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value}`}
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
                          style={{ width: `${(coupon.usage / coupon.maxUsage) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Status - Different for mobile vs desktop */}
                    <div className="col-span-1 md:col-span-2">
                      {/* Mobile: Visual indicator only */}
                      <div className="md:hidden">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            coupon.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          title={coupon.isActive ? 'Active' : 'Inactive'}
                        />
                      </div>
                      {/* Desktop: Badge with text */}
                      <div className="hidden md:block">
                        <Badge variant={coupon.isActive ? "default" : "secondary"}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
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
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCoupons.length)} of {filteredCoupons.length}
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
                          if (couponPage < totalCouponPages) setCouponPage(couponPage + 1);
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
                          if (couponPage < totalCouponPages) setCouponPage(couponPage + 1);
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
          <Dialog open={!!editingCoupon} onOpenChange={() => setEditingCoupon(null)}>
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
                    onValueChange={(value) => setEditingCoupon({ ...editingCoupon, maxUsage: value[0] })}
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
                    onCheckedChange={(checked) => setEditingCoupon({ ...editingCoupon, isActive: checked })}
                  />
                  <Label htmlFor="editActive">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="editTicketSpecific"
                    checked={editingCoupon.isTicketSpecific}
                    onCheckedChange={(checked) => setEditingCoupon({ ...editingCoupon, isTicketSpecific: checked })}
                  />
                  <Label htmlFor="editTicketSpecific">Apply to specific ticket type only</Label>
                </div>

                {editingCoupon.isTicketSpecific && (
                  <div>
                    <Label>Ticket Type</Label>
                    <Select 
                      value={editingCoupon.ticketType || ''} 
                      onValueChange={(value) => setEditingCoupon({ ...editingCoupon, ticketType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingCoupon(null)}>
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

  const renderParticipants = () => {
    // Filter participants based on status and search
    const filteredParticipants = participantsData.filter(participant => {
      const matchesStatus = participantFilter === 'all' || participant.status === participantFilter;
      const matchesSearch = participantSearch === '' || 
        participant.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
        participant.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
        participant.instagram.toLowerCase().includes(participantSearch.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });

    // Pagination
    const totalParticipants = filteredParticipants.length;
    const totalPages = Math.ceil(totalParticipants / participantsPerPage);
    const startIndex = (participantPage - 1) * participantsPerPage;
    const endIndex = Math.min(startIndex + participantsPerPage, totalParticipants);
    const paginatedParticipants = filteredParticipants.slice(startIndex, endIndex);

    const handleRefund = (participantId: number) => {
      // Mock refund logic
      console.log(`Refunding participant ${participantId}`);
    };

    return (
      <div className="space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Participants</h2>
            <p className="text-muted-foreground">
              Manage event participants and their ticket information
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={participantFilter} onValueChange={setParticipantFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Participants</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Participants Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedParticipants.map((participant) => (
            <Card key={participant.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">{participant.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{participant.email}</p>
                    </div>
                  </div>
                  <Badge variant={participant.status === 'approved' ? 'default' : 'destructive'}>
                    {participant.status}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Instagram:</span>
                    <span className="font-medium">{participant.instagram}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ticket Type:</span>
                    <Badge variant="outline">{participant.ticketType}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paid Value:</span>
                    <span className="font-medium">R${participant.paidValue}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coupon:</span>
                    <span className="font-medium">
                      {participant.coupon ? (
                        <Badge variant="secondary">{participant.coupon}</Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Validated:</span>
                    <div className="flex items-center gap-1">
                      {participant.validated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className="text-xs">
                        {participant.validated ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Refund Ticket
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to refund the ticket for {participant.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRefund(participant.id)}
                        >
                          Refund
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              {startIndex + 1}-{endIndex} of {totalParticipants} participants
            </p>
            
            <div className="flex items-center gap-2">
              {/* Desktop pagination with labels */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (participantPage > 1) setParticipantPage(participantPage - 1);
                  }}
                  disabled={participantPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (participantPage < totalPages) setParticipantPage(participantPage + 1);
                  }}
                  disabled={participantPage >= totalPages}
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
                    if (participantPage > 1) setParticipantPage(participantPage - 1);
                  }}
                  disabled={participantPage <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (participantPage < totalPages) setParticipantPage(participantPage + 1);
                  }}
                  disabled={participantPage >= totalPages}
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

  const renderJoinRequests = () => {
    // Filter join requests based on status and search
    const filteredRequests = joinRequestsData.filter(request => {
      const matchesSearch = requestSearch === '' || 
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
                        {request.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">{request.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{request.email}</p>
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
                          Are you sure you want to reject {request.name}'s join request? They will be notified of this decision.
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
                          Are you sure you want to accept {request.name}'s join request? They will be added to the approved participants list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleAcceptRequest(request.id)}>
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
              {requestSearch ? 'No requests match your search.' : 'All join requests have been processed.'}
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
                    if (requestPage < totalPages) setRequestPage(requestPage + 1);
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
                    if (requestPage < totalPages) setRequestPage(requestPage + 1);
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

  const renderTicketTypes = () => {
    console.log('renderTicketTypes called - allTicketTypes:', allTicketTypes.length);
    // Filter ticket types based on search and filter
    const filteredTicketTypes = allTicketTypes.filter(ticketType => {
      const matchesSearch = ticketType.name.toLowerCase().includes(ticketTypeSearch.toLowerCase());
      const matchesFilter = ticketTypeFilter === 'all' || 
        (ticketTypeFilter === 'active' && ticketType.isActive) ||
        (ticketTypeFilter === 'inactive' && !ticketType.isActive);
      return matchesSearch && matchesFilter;
    });

    // Pagination for ticket types
    const totalTicketTypePages = Math.ceil(filteredTicketTypes.length / itemsPerPage);
    const startIndex = (ticketTypePage - 1) * itemsPerPage;
    const paginatedTicketTypes = filteredTicketTypes.slice(startIndex, startIndex + itemsPerPage);

    const handleEditTicketType = (ticketType: any) => {
      setEditingTicketType({ ...ticketType });
    };

    const handleSaveEdit = () => {
      // In a real app, this would save to backend
      console.log('Saving ticket type:', editingTicketType);
      setEditingTicketType(null);
    };

    const handleCreateTicketType = () => {
      // In a real app, this would save to backend
      console.log('Creating ticket type:', newTicketType);
      setIsCreateTicketTypeOpen(false);
      setNewTicketType({
        name: '',
        gender: 'all',
        value: 50,
        isActive: true
      });
    };

    const handleDeleteTicketType = (id: number) => {
      // In a real app, this would delete from backend
      console.log('Deleting ticket type:', id);
    };

    return (
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold">Ticket Types Management</h2>
          
          <Dialog open={isCreateTicketTypeOpen} onOpenChange={setIsCreateTicketTypeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket Type  
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Ticket Type</DialogTitle>
                <DialogDescription>
                  Configure your new ticket type settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Ticket Type Name</Label>
                  <Input
                    id="name"
                    value={newTicketType.name}
                    onChange={(e) => setNewTicketType({ ...newTicketType, name: e.target.value })}
                    placeholder="Early Bird"
                  />
                </div>

                <div>
                  <Label>Gender</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender-all"
                          name="gender"
                          value="all"
                          checked={newTicketType.gender === 'all'}
                          onChange={(e) => setNewTicketType({ ...newTicketType, gender: e.target.value })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="gender-all" className="text-sm font-normal">All</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender-male"
                          name="gender"
                          value="male"
                          checked={newTicketType.gender === 'male'}
                          onChange={(e) => setNewTicketType({ ...newTicketType, gender: e.target.value })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="gender-male" className="text-sm font-normal">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender-female"
                          name="gender"
                          value="female"
                          checked={newTicketType.gender === 'female'}
                          onChange={(e) => setNewTicketType({ ...newTicketType, gender: e.target.value })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="gender-female" className="text-sm font-normal">Female</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="value">Ticket Value (BRL)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newTicketType.value}
                    onChange={(e) => setNewTicketType({ ...newTicketType, value: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={newTicketType.isActive}
                    onCheckedChange={(checked) => setNewTicketType({ ...newTicketType, isActive: !!checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTicketTypeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicketType}>
                  Create Ticket Type
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search ticket types..."
              value={ticketTypeSearch}
              onChange={(e) => setTicketTypeSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={ticketTypeFilter} onValueChange={setTicketTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ticket Types</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ticket Types Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedTicketTypes.map((ticketType) => (
            <Card key={ticketType.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{ticketType.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={ticketType.isActive ? "default" : "secondary"}>
                        {ticketType.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {ticketType.gender === 'all' ? 'All Genders' : 
                         ticketType.gender === 'male' ? 'Male Only' : 'Female Only'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTicketType(ticketType)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTicketType(ticketType.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-lg font-bold">R$ {ticketType.value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Sold</span>
                    <span className="text-sm font-medium">{ticketType.totalSold}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalTicketTypePages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTicketTypes.length)} of {filteredTicketTypes.length} ticket types
            </p>
            
            <div className="flex items-center gap-2">
              {/* Desktop pagination with labels */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (ticketTypePage > 1) setTicketTypePage(ticketTypePage - 1);
                  }}
                  disabled={ticketTypePage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (ticketTypePage < totalTicketTypePages) setTicketTypePage(ticketTypePage + 1);
                  }}
                  disabled={ticketTypePage >= totalTicketTypePages}
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
                    if (ticketTypePage > 1) setTicketTypePage(ticketTypePage - 1);
                  }}
                  disabled={ticketTypePage <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (ticketTypePage < totalTicketTypePages) setTicketTypePage(ticketTypePage + 1);
                  }}
                  disabled={ticketTypePage >= totalTicketTypePages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Ticket Type Dialog */}
        {editingTicketType && (
          <Dialog open={!!editingTicketType} onOpenChange={() => setEditingTicketType(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Ticket Type: {editingTicketType.name}</DialogTitle>
                <DialogDescription>
                  Modify ticket type settings and pricing.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editName">Ticket Type Name</Label>
                  <Input
                    id="editName"
                    value={editingTicketType.name}
                    onChange={(e) => setEditingTicketType({ ...editingTicketType, name: e.target.value })}
                    placeholder="Early Bird"
                  />
                </div>

                <div>
                  <Label>Gender</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="edit-gender-all"
                          name="edit-gender"
                          value="all"
                          checked={editingTicketType.gender === 'all'}
                          onChange={(e) => setEditingTicketType({ ...editingTicketType, gender: e.target.value })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="edit-gender-all" className="text-sm font-normal">All</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="edit-gender-male"
                          name="edit-gender"
                          value="male"
                          checked={editingTicketType.gender === 'male'}
                          onChange={(e) => setEditingTicketType({ ...editingTicketType, gender: e.target.value })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="edit-gender-male" className="text-sm font-normal">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="edit-gender-female"
                          name="edit-gender"
                          value="female"
                          checked={editingTicketType.gender === 'female'}
                          onChange={(e) => setEditingTicketType({ ...editingTicketType, gender: e.target.value })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="edit-gender-female" className="text-sm font-normal">Female</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="editValue">Ticket Value (BRL)</Label>
                  <Input
                    id="editValue"
                    type="number"
                    value={editingTicketType.value}
                    onChange={(e) => setEditingTicketType({ ...editingTicketType, value: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="editActive"
                    checked={editingTicketType.isActive}
                    onCheckedChange={(checked) => setEditingTicketType({ ...editingTicketType, isActive: checked })}
                  />
                  <Label htmlFor="editActive">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingTicketType(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  const renderEditEvent = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Event Information</CardTitle>
          <CardDescription className="text-muted-foreground">
            Edit your event's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-sm font-medium text-foreground">
              Event Name *
            </Label>
            <Input
              id="eventName"
              value={editEventData.name}
              onChange={(e) => setEditEventData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter event name"
              className="w-full"
            />
          </div>

          {/* Event Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Event Image
            </Label>
            <div className="flex flex-col space-y-4">
              {imagePreview && (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview('');
                      setSelectedImage(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="eventImage"
                />
                <Label
                  htmlFor="eventImage"
                  className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Select Image</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description *
            </Label>
            <Textarea
              id="description"
              value={editEventData.description}
              onChange={(e) => setEditEventData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your event..."
              className="min-h-[100px] resize-y"
            />
          </div>

          {/* Date and Time Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start Date and Time */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">
                Start Date and Time *
              </Label>
              <div className="space-y-3">
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editEventData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editEventData.startDate ? format(editEventData.startDate, "MM/dd/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editEventData.startDate}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(editEventData.startDate.getHours());
                          newDate.setMinutes(editEventData.startDate.getMinutes());
                          setEditEventData(prev => ({ ...prev, startDate: newDate }));
                        }
                        setStartDateOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={editEventData.startDate.getHours()}
                      onChange={(e) => handleStartTimeChange('hours', parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                    />
                    <span className="text-muted-foreground">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={editEventData.startDate.getMinutes()}
                      onChange={(e) => handleStartTimeChange('minutes', parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* End Date and Time */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">
                End Date and Time *
              </Label>
              <div className="space-y-3">
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editEventData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editEventData.endDate ? format(editEventData.endDate, "MM/dd/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editEventData.endDate}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(editEventData.endDate.getHours());
                          newDate.setMinutes(editEventData.endDate.getMinutes());
                          setEditEventData(prev => ({ ...prev, endDate: newDate }));
                        }
                        setEndDateOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={editEventData.endDate.getHours()}
                      onChange={(e) => handleEndTimeChange('hours', parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                    />
                    <span className="text-muted-foreground">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={editEventData.endDate.getMinutes()}
                      onChange={(e) => handleEndTimeChange('minutes', parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Name */}
            <div className="space-y-2">
              <Label htmlFor="locationName" className="text-sm font-medium text-foreground">
                Location Name *
              </Label>
              <Input
                id="locationName"
                value={editEventData.locationName}
                onChange={(e) => setEditEventData(prev => ({ ...prev, locationName: e.target.value }))}
                placeholder="Ex: Aurora Concert Hall"
                className="w-full"
              />
            </div>

            {/* Location Address */}
            <div className="space-y-2 relative">
              <Label htmlFor="location" className="text-sm font-medium text-foreground">
                Address *
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  value={editEventData.location}
                  onChange={(e) => {
                    setEditEventData(prev => ({ ...prev, location: e.target.value }));
                    setShowLocationSuggestions(e.target.value.length > 2);
                  }}
                  onFocus={() => setShowLocationSuggestions(editEventData.location.length > 2)}
                  placeholder="Enter full address"
                  className="w-full pr-10"
                />
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              {showLocationSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                  {locationSuggestions
                    .filter(suggestion => 
                      suggestion.toLowerCase().includes(editEventData.location.toLowerCase())
                    )
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-accent cursor-pointer text-sm text-foreground"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-medium text-foreground">Settings</h3>
            
            {/* Auto Accept Requests */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="autoAccept"
                checked={editEventData.autoAcceptRequests}
                onCheckedChange={(checked) => 
                  setEditEventData(prev => ({ ...prev, autoAcceptRequests: !!checked }))
                }
              />
              <Label htmlFor="autoAccept" className="text-sm text-foreground cursor-pointer">
                Join requests will be accepted automatically
              </Label>
            </div>

            {/* Event Active Status */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isActive"
                checked={editEventData.isActive}
                onCheckedChange={(checked) => 
                  setEditEventData(prev => ({ ...prev, isActive: !!checked }))
                }
              />
              <Label htmlFor="isActive" className="text-sm text-foreground cursor-pointer">
                Event is active
              </Label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveEvent} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
      case 'overview':
        return renderOverview();
      case 'edit':
        return renderEditEvent();
      case 'analytics':
        return renderAnalytics();
      case 'participants':
        return renderParticipants();
      case 'tickets':
        return renderTicketTypes();
      case 'coupons':
        return renderCoupons();
      case 'validate':
        return renderPlaceholderSection('Validate Tickets', 'Scan and validate tickets at the event entrance.');
      case 'requests':
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
              <Button variant="ghost" size="sm" onClick={() => setMobileOverlay(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold">
                {managementSections.find(s => s.id === mobileOverlay)?.label}
              </h1>
              <div className="w-10" />
            </div>
          </header>
          
           <main className="p-4">
              {mobileOverlay === 'overview' ? renderOverview() : 
               mobileOverlay === 'edit' ? renderEditEvent() :
               mobileOverlay === 'analytics' ? renderAnalytics() :
               mobileOverlay === 'participants' ? renderParticipants() :
               mobileOverlay === 'tickets' ? renderTicketTypes() :
               mobileOverlay === 'coupons' ? renderCoupons() :
               mobileOverlay === 'requests' ? renderJoinRequests() :
               renderPlaceholderSection(
                 managementSections.find(s => s.id === mobileOverlay)?.label || '',
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoLight} alt="Tikko" className="h-6" />
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Event Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline">{eventData.status}</Badge>
            <span className="text-sm text-muted-foreground">Event ID: {eventData.id}</span>
          </div>
          <h1 className="text-xl font-bold mb-2">{eventData.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{eventData.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{eventData.location}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{eventData.attendees}</p>
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
                    <p className="text-2xl font-bold text-green-600">${eventData.revenue}</p>
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
                  <span className="text-sm font-medium text-center">{section.label}</span>
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
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
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
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{eventData.status}</Badge>
              <span className="text-xs text-muted-foreground">ID: {eventData.id}</span>
            </div>
            <h2 className="font-semibold mb-2">{eventData.title}</h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{eventData.date} • {eventData.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{eventData.location}</span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {managementSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <Button
                  key={section.id}
                  variant={isActive ? 'default' : 'ghost'}
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
              Manage your event settings, view analytics, and interact with participants.
            </p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EventManagement;