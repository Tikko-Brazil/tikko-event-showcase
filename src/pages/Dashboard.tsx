import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Calendar, 
  Ticket, 
  User, 
  Settings, 
  Bell,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Clock,
  Activity,
  QrCode,
  BarChart3,
  Edit,
  UserPlus,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import logoLight from '@/assets/logoLight.png';

type TabType = 'feed' | 'explore' | 'my-events' | 'my-tickets' | 'profile';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const tabs = [
    { id: 'feed' as TabType, label: 'Feed', icon: Activity },
    { id: 'explore' as TabType, label: 'Explore', icon: Home },
    { id: 'my-events' as TabType, label: 'My Events', icon: Calendar },
    { id: 'my-tickets' as TabType, label: 'My Tickets', icon: Ticket },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  const mockEvents = [
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      date: 'Jun 15, 2024',
      time: '6:00 PM',
      location: 'Central Park, NY',
      price: '$45',
      image: '/placeholder.svg',
      attendees: 234,
      liked: false
    },
    {
      id: 2,
      title: 'Tech Conference 2024',
      date: 'Jun 20, 2024',
      time: '9:00 AM',
      location: 'Convention Center, SF',
      price: '$125',
      image: '/placeholder.svg',
      attendees: 567,
      liked: true
    },
    {
      id: 3,
      title: 'Art Gallery Opening',
      date: 'Jun 25, 2024',
      time: '7:00 PM',
      location: 'Downtown Gallery, LA',
      price: 'Free',
      image: '/placeholder.svg',
      attendees: 89,
      liked: false
    }
  ];

  const mockMyEvents = [
    {
      id: 1,
      title: 'My Music Showcase 2024',
      date: 'Jul 10, 2024',
      time: '8:00 PM',
      location: 'The Underground, NYC',
      status: 'upcoming',
      attendees: 45,
      isOwner: true,
      type: 'owned'
    },
    {
      id: 2,
      title: 'Photography Workshop',
      date: 'Jul 20, 2024',
      time: '2:00 PM',
      location: 'Studio Space, LA',
      status: 'upcoming',
      attendees: 12,
      isOwner: true,
      type: 'owned'
    },
    {
      id: 3,
      title: 'Jazz Night',
      date: 'Jun 5, 2024',
      time: '9:00 PM',
      location: 'Blue Note, NYC',
      status: 'attended',
      attendees: 200,
      isOwner: false,
      type: 'attended'
    },
    {
      id: 4,
      title: 'Art Exhibition Opening',
      date: 'May 15, 2024',
      time: '6:00 PM',
      location: 'Modern Gallery, SF',
      status: 'past',
      attendees: 150,
      isOwner: false,
      type: 'attended'
    }
  ];

  const mockMyTickets = [
    {
      id: 1,
      eventTitle: 'Summer Music Festival 2024',
      ticketType: 'VIP Access',
      date: 'Jun 15, 2024',
      time: '6:00 PM',
      location: 'Central Park, NY',
      status: 'active',
      qrCode: 'QR_123456789'
    },
    {
      id: 2,
      eventTitle: 'Tech Conference 2024',
      ticketType: 'General Admission',
      date: 'Jun 20, 2024',
      time: '9:00 AM',
      location: 'Convention Center, SF',
      status: 'active',
      qrCode: 'QR_987654321'
    },
    {
      id: 3,
      eventTitle: 'Jazz Night',
      ticketType: 'Premium',
      date: 'Jun 5, 2024',
      time: '9:00 PM',
      location: 'Blue Note, NYC',
      status: 'used',
      qrCode: 'QR_456123789'
    },
    {
      id: 4,
      eventTitle: 'Food Festival',
      ticketType: 'Early Bird',
      date: 'May 20, 2024',
      time: '11:00 AM',
      location: 'City Square, Chicago',
      status: 'expired',
      qrCode: 'QR_789456123'
    }
  ];

  const mockFeedPosts = [
    {
      id: 1,
      type: 'attendance',
      user: { name: 'Sarah Johnson', avatar: '/placeholder.svg' },
      content: 'Just got tickets for the Summer Music Festival! 🎵',
      event: 'Summer Music Festival 2024',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 5
    },
    {
      id: 2,
      type: 'news',
      title: 'New Venue Opening in Downtown',
      content: 'The Grand Theater announces its opening with a spectacular lineup of events this fall.',
      timestamp: '4 hours ago',
      likes: 89,
      comments: 12
    },
    {
      id: 3,
      type: 'post',
      user: { name: 'Mike Chen', avatar: '/placeholder.svg' },
      content: 'Amazing performance at the Jazz Club last night! The energy was incredible. Already looking forward to next week\'s show.',
      timestamp: '1 day ago',
      likes: 45,
      comments: 8
    },
    {
      id: 4,
      type: 'attendance',
      user: { name: 'Emily Davis', avatar: '/placeholder.svg' },
      content: 'Who else is going to the Tech Conference next week?',
      event: 'Tech Conference 2024',
      timestamp: '1 day ago',
      likes: 15,
      comments: 3
    }
  ];

  const renderEventCard = (event: typeof mockEvents[0]) => (
    <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <Badge variant="secondary" className="mb-2">
            {event.price}
          </Badge>
          <h3 className="font-semibold text-lg">{event.title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Clock className="h-4 w-4" />
          <span>{event.date} • {event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8">
              <Heart className={`h-4 w-4 mr-1 ${event.liked ? 'fill-red-500 text-red-500' : ''}`} />
              {event.attendees}
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <MessageCircle className="h-4 w-4 mr-1" />
              12
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm">
            Buy Tickets
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Feed</h2>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
            <div className="space-y-4">
              {mockFeedPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    {post.type === 'attendance' && (
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.user?.avatar} />
                          <AvatarFallback>{post.user?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{post.user?.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {post.event}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{post.timestamp}</span>
                            <Button variant="ghost" size="sm" className="h-8 p-0">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 p-0">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 p-0">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {post.type === 'news' && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">News</Badge>
                          <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                        </div>
                        <h4 className="font-semibold mb-2">{post.title}</h4>
                        <p className="text-muted-foreground mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Button variant="ghost" size="sm" className="h-8 p-0">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 p-0">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 p-0">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {post.type === 'post' && (
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.user?.avatar} />
                          <AvatarFallback>{post.user?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{post.user?.name}</h4>
                            <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                          </div>
                          <p className="text-muted-foreground mb-3">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Button variant="ghost" size="sm" className="h-8 p-0">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 p-0">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 p-0">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'explore':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Discover Events</h2>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockEvents.map(renderEventCard)}
            </div>
          </div>
        );
      case 'my-events':
        return (
          <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Events</h2>
            <Button onClick={() => navigate('/create-event')}>Create Event</Button>
          </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockMyEvents.map((event) => (
                <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge variant={event.status === 'upcoming' ? 'default' : event.status === 'past' ? 'secondary' : 'outline'}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <Badge variant="secondary" className="mb-2">
                        {event.type === 'owned' ? 'Owned' : 'Attended'}
                      </Badge>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <UserPlus className="h-4 w-4" />
                        <span>{event.attendees} attendees</span>
                      </div>
                      {event.isOwner && (
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/event-management/${event.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'my-tickets':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Tickets</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockMyTickets.map((ticket) => (
                <Card key={ticket.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{ticket.eventTitle}</h3>
                        <Badge variant={
                          ticket.status === 'active' ? 'default' : 
                          ticket.status === 'used' ? 'secondary' : 'outline'
                        }>
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <QrCode className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        <span>{ticket.ticketType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{ticket.date} • {ticket.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{ticket.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      {ticket.status === 'active' && (
                        <Button size="sm" className="flex-1">
                          Show QR
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">John Doe</h2>
                <p className="text-muted-foreground">Event enthusiast</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span><strong>12</strong> Events</span>
                  <span><strong>48</strong> Tickets</span>
                  <span><strong>156</strong> Following</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Events Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tickets Bought</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,240</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <img src={logoLight} alt="Tikko" className="h-8" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="pb-20 px-4 py-6">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`flex flex-col gap-1 h-auto py-2 px-3 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'fill-primary/10' : ''}`} />
                  <span className="text-xs">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <img src={logoLight} alt="Tikko" className="h-8" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10 w-80"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r bg-card/50 backdrop-blur-sm">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Desktop Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>

        {/* Desktop Right Sidebar */}
        <aside className="w-80 border-l bg-card/50 backdrop-blur-sm p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Music Festival', 'Tech Conference', 'Art Exhibition'].map((event, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{event}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Event Organizer Pro', type: 'Organization' },
                  { name: 'Music Venue NYC', type: 'Venue' },
                  { name: 'Tech Meetup Group', type: 'Community' }
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{suggestion.name}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.type}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Follow</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;