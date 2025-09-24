import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import logoLight from '@/assets/logoLight.png';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mock event data - replace with actual data fetching
  const [eventData, setEventData] = useState({
    name: 'Festa de Ano Novo 2025',
    image: '/placeholder.svg',
    description: 'Uma celebração inesquecível para receber o novo ano com muito estilo, música e diversão.',
    startDate: new Date(2024, 11, 31, 22, 0), // Dec 31, 2024, 10:00 PM
    endDate: new Date(2025, 0, 1, 4, 0), // Jan 1, 2025, 4:00 AM
    locationName: 'Casa de Shows Aurora',
    location: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    autoAcceptRequests: true,
    isActive: true
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(eventData.image);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [locationSuggestions] = useState([
    'Rua das Flores, 123 - Centro, São Paulo - SP',
    'Avenida Paulista, 456 - Bela Vista, São Paulo - SP',
    'Rua Augusta, 789 - Consolação, São Paulo - SP',
    'Rua Oscar Freire, 321 - Jardins, São Paulo - SP'
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

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving event data:', eventData);
    // Navigate back or show success message
    navigate(`/event-management/${eventId}`);
  };

  const handleLocationSelect = (location: string) => {
    setEventData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/event-management/${eventId}`)}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <img src={logoLight} alt="Tikko" className="h-8 w-8" />
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Editar Evento</h1>
                  <p className="text-sm text-muted-foreground">ID: {eventId}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Informações do Evento</CardTitle>
              <CardDescription className="text-muted-foreground">
                Edite as informações básicas do seu evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-sm font-medium text-foreground">
                  Nome do Evento *
                </Label>
                <Input
                  id="eventName"
                  value={eventData.name}
                  onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do evento"
                  className="w-full"
                />
              </div>

              {/* Event Image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Imagem do Evento
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
                      <span>Selecionar Imagem</span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva seu evento..."
                  className="min-h-[100px] resize-y"
                />
              </div>

              {/* Date and Time Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Start Date and Time */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-foreground">
                    Data e Hora de Início *
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
                          {eventData.startDate ? format(eventData.startDate, "dd/MM/yyyy") : "Selecionar data"}
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
                    Data e Hora de Término *
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
                          {eventData.endDate ? format(eventData.endDate, "dd/MM/yyyy") : "Selecionar data"}
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
                    Nome do Local *
                  </Label>
                  <Input
                    id="locationName"
                    value={eventData.locationName}
                    onChange={(e) => setEventData(prev => ({ ...prev, locationName: e.target.value }))}
                    placeholder="Ex: Casa de Shows Aurora"
                    className="w-full"
                  />
                </div>

                {/* Location Address */}
                <div className="space-y-2 relative">
                  <Label htmlFor="location" className="text-sm font-medium text-foreground">
                    Endereço *
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
                      placeholder="Digite o endereço completo"
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
                <h3 className="text-lg font-medium text-foreground">Configurações</h3>
                
                {/* Auto Accept Requests */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="autoAccept"
                    checked={eventData.autoAcceptRequests}
                    onCheckedChange={(checked) => 
                      setEventData(prev => ({ ...prev, autoAcceptRequests: checked as boolean }))
                    }
                  />
                  <Label htmlFor="autoAccept" className="text-sm font-medium text-foreground">
                    Aceitar solicitações de participação automaticamente
                  </Label>
                </div>

                {/* Event Active Status */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isActive"
                    checked={eventData.isActive}
                    onCheckedChange={(checked) => 
                      setEventData(prev => ({ ...prev, isActive: checked as boolean }))
                    }
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium text-foreground">
                    Evento ativo (visível para participantes)
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/event-management/${eventId}`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;