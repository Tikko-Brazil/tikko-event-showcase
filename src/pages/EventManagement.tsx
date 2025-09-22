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
  TrendingUp
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import logoLight from '@/assets/logoLight.png';

const EventManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('overview');

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
        return renderPlaceholderSection('Edit Event', 'Modify event details, description, and settings.');
      case 'analytics':
        return renderPlaceholderSection('Analytics', 'View detailed analytics and insights about your event.');
      case 'participants':
        return renderPlaceholderSection('Participants', 'Manage event participants and attendees.');
      case 'tickets':
        return renderPlaceholderSection('Ticket Types', 'Configure different ticket types and pricing.');
      case 'coupons':
        return renderPlaceholderSection('Coupons', 'Create and manage discount codes and promotions.');
      case 'validate':
        return renderPlaceholderSection('Validate Tickets', 'Scan and validate tickets at the event entrance.');
      case 'requests':
        return renderPlaceholderSection('Join Requests', 'Review and approve pending join requests.');
      default:
        return renderOverview();
    }
  };

  if (isMobile) {
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

        {/* Mobile Navigation */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-2">
            {managementSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <Button
                  key={section.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start"
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Mobile Content */}
        <main className="p-4">
          {renderContent()}
        </main>
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
            <Settings className="h-4 w-4 mr-2" />
            Event Settings
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