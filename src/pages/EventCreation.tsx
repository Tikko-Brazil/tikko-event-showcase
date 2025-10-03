import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ImageIcon,
  X,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import logoLight from '@/assets/logoLight.png';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface TicketType {
  id: string;
  name: string;
  gender: 'all' | 'male' | 'female';
  price: number;
}

const EventCreation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Event form state
  const [eventData, setEventData] = useState({
    name: '',
    image: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    locationName: '',
    location: '',
    autoAcceptRequests: true,
    isActive: true
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const [locationSuggestions] = useState([
    'Madison Square Garden, NYC',
    'Brooklyn Bowl, NYC',
    'Terminal 5, NYC',
    'Webster Hall, NYC'
  ]);

  // Ticket types state
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [newTicketType, setNewTicketType] = useState({
    name: '',
    gender: 'all' as 'all' | 'male' | 'female',
    price: 0
  });

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
    const newDate = new Date(eventData.startDate);
    if (field === 'hours') {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setEventData(prev => ({ ...prev, startDate: newDate }));
  };

  const handleEndTimeChange = (field: 'hours' | 'minutes', value: number) => {
    const newDate = new Date(eventData.endDate);
    if (field === 'hours') {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setEventData(prev => ({ ...prev, endDate: newDate }));
  };

  const handleLocationSelect = (location: string) => {
    setEventData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  const handleAddTicketType = () => {
    if (!newTicketType.name || newTicketType.price <= 0) return;

    const ticketType: TicketType = {
      id: Date.now().toString(),
      ...newTicketType
    };

    setTicketTypes([...ticketTypes, ticketType]);
    setNewTicketType({ name: '', gender: 'all', price: 0 });
  };

  const handleRemoveTicketType = (id: string) => {
    setTicketTypes(ticketTypes.filter(tt => tt.id !== id));
  };

  const handleCreateEvent = () => {
    // TODO: Implement event creation logic with EventGateway
    console.log('Creating event:', { eventData, ticketTypes });
    // Navigate to event management or dashboard after creation
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {!isMobile && (
              <div className="flex items-center gap-3">
                <img src={logoLight} alt="Logo" className="h-8" />
                <div className="h-6 w-px bg-border" />
                <h1 className="text-xl font-bold">Create Event</h1>
              </div>
            )}
          </div>

          <Button onClick={handleCreateEvent} size={isMobile ? 'sm' : 'default'}>
            <Save className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Event Information Card */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Event Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Basic details about your event
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
                  value={eventData.name}
                  onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
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
                  value={eventData.description}
                  onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
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
                            !eventData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventData.startDate ? format(eventData.startDate, "MM/dd/yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventData.startDate}
                          onSelect={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              newDate.setHours(eventData.startDate.getHours());
                              newDate.setMinutes(eventData.startDate.getMinutes());
                              setEventData(prev => ({ ...prev, startDate: newDate }));
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
                          value={eventData.startDate.getHours()}
                          onChange={(e) => handleStartTimeChange('hours', parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={eventData.startDate.getMinutes()}
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
                            !eventData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventData.endDate ? format(eventData.endDate, "MM/dd/yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventData.endDate}
                          onSelect={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              newDate.setHours(eventData.endDate.getHours());
                              newDate.setMinutes(eventData.endDate.getMinutes());
                              setEventData(prev => ({ ...prev, endDate: newDate }));
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
                          value={eventData.endDate.getHours()}
                          onChange={(e) => handleEndTimeChange('hours', parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={eventData.endDate.getMinutes()}
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
                    value={eventData.locationName}
                    onChange={(e) => setEventData(prev => ({ ...prev, locationName: e.target.value }))}
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
                      value={eventData.location}
                      onChange={(e) => {
                        setEventData(prev => ({ ...prev, location: e.target.value }));
                        setShowLocationSuggestions(e.target.value.length > 2);
                      }}
                      onFocus={() => setShowLocationSuggestions(eventData.location.length > 2)}
                      placeholder="Enter full address"
                      className="w-full pr-10"
                    />
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  {showLocationSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                      {locationSuggestions
                        .filter(suggestion => 
                          suggestion.toLowerCase().includes(eventData.location.toLowerCase())
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
                    checked={eventData.autoAcceptRequests}
                    onCheckedChange={(checked) => 
                      setEventData(prev => ({ ...prev, autoAcceptRequests: checked as boolean }))
                    }
                  />
                  <div className="flex flex-col">
                    <Label htmlFor="autoAccept" className="text-sm font-medium text-foreground cursor-pointer">
                      Auto-accept join requests
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Automatically approve all ticket purchase requests
                    </span>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <Switch
                    id="isActive"
                    checked={eventData.isActive}
                    onCheckedChange={(checked) => setEventData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
                    Event is active
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Types Card */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Ticket Types</CardTitle>
              <CardDescription className="text-muted-foreground">
                Define different ticket types for your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Ticket Type Form */}
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground">Add Ticket Type</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketName">Name *</Label>
                    <Input
                      id="ticketName"
                      value={newTicketType.name}
                      onChange={(e) => setNewTicketType(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: VIP, General, Student"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <div className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender-all"
                          name="gender"
                          value="all"
                          checked={newTicketType.gender === 'all'}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, gender: e.target.value as 'all' }))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="gender-all" className="text-sm font-normal cursor-pointer">All</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender-male"
                          name="gender"
                          value="male"
                          checked={newTicketType.gender === 'male'}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, gender: e.target.value as 'male' }))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="gender-male" className="text-sm font-normal cursor-pointer">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender-female"
                          name="gender"
                          value="female"
                          checked={newTicketType.gender === 'female'}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, gender: e.target.value as 'female' }))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="gender-female" className="text-sm font-normal cursor-pointer">Female</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Price (BRL) *</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newTicketType.price}
                      onChange={(e) => setNewTicketType(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddTicketType} 
                  className="w-full md:w-auto"
                  disabled={!newTicketType.name || newTicketType.price <= 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ticket Type
                </Button>
              </div>

              {/* Ticket Types List */}
              {ticketTypes.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Added Ticket Types</h3>
                  <div className="grid gap-3">
                    {ticketTypes.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{ticket.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">
                                {ticket.gender === 'all' ? 'All Genders' : 
                                 ticket.gender === 'male' ? 'Male Only' : 'Female Only'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm font-medium text-foreground">R$ {ticket.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTicketType(ticket.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No ticket types added yet. Add at least one ticket type to continue.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Button (Mobile) */}
          {isMobile && (
            <Button 
              onClick={handleCreateEvent} 
              size="lg" 
              className="w-full"
              disabled={!eventData.name || !eventData.description || ticketTypes.length === 0}
            >
              <Save className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventCreation;
