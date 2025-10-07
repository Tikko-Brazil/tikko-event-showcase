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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckoutOverlay } from "@/components/CheckoutOverlay";
import { EventGateway } from "@/lib/EventGateway";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import heroImage from "@/assets/hero-event-image.jpg";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
const geocodingGateway = new GeocodingGateway();

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
      return `${road || ""}${road && suburb ? ", " : ""}${suburb || ""}${
        (road || suburb) && city ? ", " : ""
      }${city}${state ? ` - ${state}` : ""}`;
    }
    return eventData?.event.location || "Localização não disponível";
  };

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

  const handleShare = async () => {
    const shareData = {
      title: `${event.name} - Tikko`,
      text: `${event.name} - ${formatDate(event.start_date)} em ${
        event.location
      }`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      } catch (err) {
        alert(`Compartilhe este link: ${window.location.href}`);
      }
    }
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground"
            title="Compartilhar evento"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        {/* Mobile: Full width image with overlay */}
        <div className="absolute inset-0 md:hidden">
          <img
            src={event.image || heroImage}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background"></div>
        </div>
        <div className="hidden md:block absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
          <div className="h-full flex items-center justify-center">
            <div className="relative max-w-4xl w-full mx-8 h-[80%] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={event.image || heroImage}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
            </div>
          </div>
        </div>
      </section>
      <div className="relative z-10 h-full flex items-end">
        <div className="container mx-auto px-4 pb-1 md:pb-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">
              {event.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-lg">
                  {formatDate(event.start_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-lg">
                  {formatTime(event.start_date, event.end_date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Location Section */}
        <Card className="bg-tikko-card-light text-gray-900 shadow-lg mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <MapPin className="w-5 h-5 text-tikko-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-lg text-gray-900">
                    {event.address_name || event.location}
                  </p>
                  <p className="text-gray-600">
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
                className="text-tikko-orange hover:text-tikko-orange hover:bg-tikko-orange/10 flex-shrink-0"
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
                      className={`border rounded-lg p-3 md:p-4 transition-all duration-200 ${
                        selectedTicket === ticket.id.toString()
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
            <Card className="bg-tikko-card-light text-gray-900 shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl text-gray-900">
                  {event.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(event.start_date)} •{" "}
                    {formatTime(event.start_date, event.end_date)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-4 md:p-6 pt-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Sobre o evento
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
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
      />
    </div>
  );
}
