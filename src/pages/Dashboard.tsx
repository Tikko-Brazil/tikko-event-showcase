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
  Clock
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import logoLight from '@/assets/logoLight.png';

type TabType = 'explore' | 'my-events' | 'my-tickets' | 'profile';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const isMobile = useIsMobile();

  const tabs = [
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
            <h2 className="text-2xl font-bold">My Events</h2>
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No events created yet</h3>
              <p className="text-muted-foreground mb-4">Start organizing your first event!</p>
              <Button>Create Event</Button>
            </div>
          </div>
        );
      case 'my-tickets':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Tickets</h2>
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tickets purchased yet</h3>
              <p className="text-muted-foreground mb-4">Explore events and get your tickets!</p>
              <Button onClick={() => setActiveTab('explore')}>Explore Events</Button>
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