import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { CheckoutOverlay } from "@/components/CheckoutOverlay";
import { EventGateway } from "@/lib/EventGateway";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import getEventIdFromSlug from "@/helpers/getEventIdFromSlug";
import heroImage from "@/assets/hero-event-image.jpg";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
const geocodingGateway = new GeocodingGateway();

export default function EventDetails() {
  const { slug } = useParams<{ slug: string }>();
  const eventId = slug ? getEventIdFromSlug(slug) : null;
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch event with ticket pricing
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
  } = useQuery({
    queryKey: ["event-with-pricing", eventId],
    queryFn: () => eventGateway.getEventWithTicketPricing(Number(eventId)),
    enabled: !!eventId,
  });

  // Fetch address for event coordinates
  const { data: address, isLoading: addressLoading } = useQuery({
    queryKey: [
      "geocode",
      eventData?.event.latitude,
      eventData?.event.longitude,
    ],
    queryFn: () =>
      geocodingGateway.reverseGeocode(
        eventData!.event.latitude,
        eventData!.event.longitude
      ),
    enabled: !!(eventData?.event.latitude && eventData?.event.longitude),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const formatTicketName = (ticket: any) => {
    const genderText =
      ticket?.gender === "male"
        ? "Masculino"
        : ticket?.gender === "female"
          ? "Feminino"
          : "Unissex";
    const lotText = ticket?.lot === 0 ? "Pré-venda" : `Lote ${ticket?.lot}`;
    return `${ticket?.ticket_type} - ${genderText} - ${lotText}`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getEventAddress = () => {
    if (address) {
      const { road, suburb, city, state } = address;
      return `${road || ""}${road && suburb ? ", " : ""}${suburb || ""}${(road || suburb) && city ? ", " : ""
        }${city}${state ? ` - ${state}` : ""}`;
    }
    return eventData?.event.location || "Localização não disponível";
  };

  if (!eventId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              URL do evento inválida.
            </AlertDescription>
          </Alert>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos eventos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Carregando evento...</span>
        </div>
      </div>
    );
  }

  if (eventError || !eventData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar evento. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos eventos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { event, ticket_pricing } = eventData;
  const selectedTicketData = ticket_pricing.find(
    (t) => t.id.toString() === selectedTicket
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link do evento foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const shareToWhatsApp = () => {
    const text = `${event.name} - ${formatDate(event.start_date)} em ${event.location}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`;
    window.open(url, "_blank");
  };

  const shareToTelegram = () => {
    const text = `${event.name} - ${formatDate(event.start_date)}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  };

  const shareToTwitter = () => {
    const text = `${event.name} - ${formatDate(event.start_date)}`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareToInstagram = () => {
    toast({
      title: "Instagram",
      description: "Link copiado! Cole-o em sua história ou post do Instagram.",
    });
    handleCopyLink();
  };

  const openGoogleMaps = () => {
    const addressText = address
      ? `${address.displayName}`
      : `${event.location}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      addressText
    )}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Bar with Back Button and Share */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos eventos
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title="Compartilhar evento"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <LinkIcon className="w-4 h-4 mr-2" />
                )}
                Copiar link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToWhatsApp}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToTelegram}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToFacebook}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToTwitter}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToInstagram}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
                Instagram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Hero Section */}
      {/* Mobile: Full width image with overlay */}
      <div className="md:hidden overflow-hidden">
        <section className="relative h-[50vh] w-full">
          <div className="absolute inset-0">
            <img
              src={event.image || heroImage}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background"></div>
          </div>
        </section>
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-1">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold text-white mb-2">
                {event.name}
              </h1>
              <div className="flex flex-col gap-2 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDate(event.start_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formatTime(event.start_date, event.end_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Image on left, info on right */}
      <section className="hidden md:block container mx-auto px-4 py-8">
        <div className="flex gap-8 items-start max-w-6xl mx-auto">
          {/* Event Image - Left Side */}
          <div className="w-[400px] flex-shrink-0">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={event.image || heroImage}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Event Info - Right Side */}
          <div className="flex-1 pt-4">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {event.name}
            </h1>
            <div className="flex flex-col gap-4 text-lg mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span>
                  {formatDate(event.start_date)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>
                  {formatTime(event.start_date, event.end_date)}
                </span>
              </div>
            </div>

            {/* Location Card - Desktop Only */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg">
                        {event.address_name || event.location}
                      </p>
                      <p className="text-muted-foreground">
                        {addressLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Carregando endereço...
                          </span>
                        ) : (
                          getEventAddress()
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openGoogleMaps}
                    className="text-primary hover:bg-primary/10 flex-shrink-0"
                    title="Ver no Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Location Section - Mobile Only */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg mb-6 md:hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-lg">
                    {event.address_name || event.location}
                  </p>
                  <p className="text-muted-foreground">
                    {addressLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        Carregando endereço...
                      </span>
                    ) : (
                      getEventAddress()
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={openGoogleMaps}
                className="text-primary hover:bg-primary/10 flex-shrink-0"
                title="Ver no Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Ticket Selection Section */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <Card className="bg-card shadow-lg lg:sticky lg:top-24">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">
                  Obter ingressos
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Por favor, escolha o tipo de ingresso desejado:
                </p>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
                <RadioGroup
                  value={selectedTicket}
                  onValueChange={setSelectedTicket}
                  className="space-y-1"
                >
                  {ticket_pricing.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border rounded-lg p-3 md:p-4 transition-all duration-200 ${selectedTicket === ticket.id.toString()
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <RadioGroupItem
                            value={ticket.id.toString()}
                            id={ticket.id.toString()}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={ticket.id.toString()}
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <p className="font-medium text-sm md:text-base">
                                {formatTicketName(ticket)}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                Requer aprovação
                              </p>
                            </div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base md:text-lg">
                            {formatPrice(ticket.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {/* Quantity selector - hidden but kept for future use */}
                {selectedTicket && false && (
                  <div className="space-y-4 pt-4 border-t">...</div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (!selectedTicket) return;
                    setIsCheckoutOpen(true);
                  }}
                  disabled={!selectedTicket}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Continuar para pagamento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Event Description Section */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">
                  {event.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(event.start_date)} •{" "}
                    {formatTime(event.start_date, event.end_date)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-4 md:p-6 pt-0">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Sobre o evento
                  </h3>
                  <div className="text-foreground/90 whitespace-pre-line leading-relaxed text-sm md:text-base">
                    {event.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-lg font-bold text-primary">
                Tikko
              </Link>
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar aos eventos
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 Tikko. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Checkout Overlay */}
      <CheckoutOverlay
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        ticketPrice={selectedTicketData?.price || 0}
        ticketType={formatTicketName(selectedTicketData) || ""}
        eventId={event.id}
        ticketPricingId={selectedTicketData?.id || 0}
        autoAccept={event.auto_accept}
      />
    </div>
  );
}
