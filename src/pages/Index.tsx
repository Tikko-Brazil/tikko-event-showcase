import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventGateway } from "@/lib/EventGateway";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import heroImage from "@/assets/hero-event-image.jpg";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
const geocodingGateway = new GeocodingGateway();

const Index = () => {
  // Fetch events
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventGateway.getAllEvents(),
  });

  // Fetch addresses for events with coordinates
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses", events],
    queryFn: async () => {
      if (!events) return {};

      const addressPromises = events.map(async (event) => {
        try {
          if (event.latitude && event.longitude) {
            const address = await geocodingGateway.reverseGeocode(
              event.latitude,
              event.longitude
            );
            return { [event.id]: address };
          }
          return { [event.id]: null };
        } catch (error) {
          console.error(`Failed to geocode event ${event.id}:`, error);
          return { [event.id]: null };
        }
      });

      const addressResults = await Promise.all(addressPromises);
      return addressResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: !!events && events.length > 0,
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

  const getEventAddress = (event: any) => {
    const address = addresses?.[event.id];
    if (address) {
      return `${address.city}, ${address.state}`;
    }
    return event.location || "Localização não disponível";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Tikko</h1>
            <p className="text-muted-foreground hidden md:block">
              Seu evento, seu momento, nossa plataforma
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Descubra, crie e viva
            <br />
            <span className="text-primary">experiências inesquecíveis</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tikko é a plataforma moderna para gerenciar e vender ingressos para
            diversos eventos, simplificando o processo para você descobrir e
            participar de eventos únicos.
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">
              Próximos eventos
            </h3>
            <Button variant="outline">Ver todos os eventos</Button>
          </div>

          {/* Loading State */}
          {eventsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Carregando eventos...
              </span>
            </div>
          )}

          {/* Error State */}
          {eventsError && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar eventos. Tente novamente mais tarde.
              </AlertDescription>
            </Alert>
          )}

          {/* Events Grid */}
          {events && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={event.image_url || heroImage}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {event.name}
                      </h4>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(event.start_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {formatTime(event.start_date, event.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {addressesLoading ? (
                            <span className="flex items-center">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              Carregando...
                            </span>
                          ) : (
                            getEventAddress(event)
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Ver detalhes
                        </p>
                      </div>
                      <Link to={`/event/${event.id}`}>
                        <Button className="group">
                          Saiba mais
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {events && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum evento encontrado.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/30 border-t mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h4 className="text-lg font-bold text-primary mb-4">Tikko</h4>
              <p className="text-muted-foreground mb-4">
                Plataforma moderna para gerenciar e vender ingressos para
                diversos eventos. Descubra, crie e viva experiências
                inesquecíveis.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">
                Informações
              </h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>Contato</li>
                <li>Empresa</li>
                <li>Termos</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Contato</h5>
              <div className="space-y-2 text-muted-foreground">
                <p>Telefone: +55 (47) 9712-1190</p>
                <p>E-mail: contato@tikko.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2025 Tikko. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
