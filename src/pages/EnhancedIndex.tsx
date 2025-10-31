import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Star,
  ArrowRight,
  Music,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { EventGateway } from "@/lib/EventGateway";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import generateSlug from "@/helpers/generateSlug";
import logoLight from "@/assets/logoLight.png";
import mark from "@/assets/mark.png";
import LanguageSelector from "@/components/LanguageSelector";
import heroEventImage from "@/assets/hero-event-image.jpg";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
const geocodingGateway = new GeocodingGateway();

const EnhancedIndex = () => {
  const { t } = useTranslation();
  // Fetch events
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventGateway.getAllEvents(),
  });

  // Fetch addresses for events with coordinates (cached by coordinates)
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: [
      "addresses",
      events?.map((e) => `${e.latitude},${e.longitude}`).join("|"),
    ],
    queryFn: async () => {
      if (!events) return {};

      const addressMap: Record<string, any> = {};

      for (const event of events) {
        if (event.latitude && event.longitude) {
          const cacheKey = `${event.latitude},${event.longitude}`;
          if (!addressMap[cacheKey]) {
            try {
              const address = await geocodingGateway.reverseGeocode(
                event.latitude,
                event.longitude
              );
              addressMap[cacheKey] = address;
            } catch (error) {
              console.error(`Failed to geocode ${cacheKey}:`, error);
              addressMap[cacheKey] = null;
            }
          }
        }
      }

      return addressMap;
    },
    enabled: !!events && events.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventAddress = (event: any) => {
    const cacheKey = `${event.latitude},${event.longitude}`;
    const address = addresses?.[cacheKey];
    if (address) {
      return `${address.city}, ${address.state}`;
    }
    return event.location || t("home.events.locationNotAvailable");
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logoLight} alt="Tikko" className="h-8" />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="#events"
                className="text-foreground hover:text-primary transition-smooth"
              >
                {t("home.nav.events")}
              </Link>
              <Link
                to="/about"
                className="text-foreground hover:text-primary transition-smooth"
              >
                {t("home.nav.about")}
              </Link>
              <Link
                to="/contact"
                className="text-foreground hover:text-primary transition-smooth"
              >
                {t("home.nav.contact")}
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="transition-smooth hover:shadow-glow"
                >
                  {t("home.nav.signIn")}
                </Button>
              </Link>
              <Link to="/login">
                <Button className="gradient-button hover:shadow-elegant transition-smooth">
                  {t("home.nav.getStarted")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 animate-float">
            <img src={mark} alt="Tikko Mark" className="h-12 opacity-20" />
          </div>
          <div
            className="absolute bottom-20 right-20 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <Sparkles className="h-16 w-16 text-primary opacity-30" />
          </div>
          <div className="absolute top-1/3 right-10 animate-pulse-slow">
            <Music className="h-8 w-8 text-primary/40" />
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              {t("home.hero.title")}
              <span className="block text-primary">{t("home.hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg gradient-button hover:shadow-elegant transition-bounce"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  {t("home.hero.startExploring")}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg hover:shadow-card transition-smooth"
              >
                <Users className="mr-2 h-5 w-5" />
                {t("home.hero.createEvent")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section id="events" className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("home.events.title").split(" ")[0]} <span className="text-primary">{t("home.events.title").split(" ")[1]}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.events.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Loading State */}
            {eventsLoading && (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  {t("home.events.loading")}
                </span>
              </div>
            )}

            {/* Error State */}
            {eventsError && (
              <div className="col-span-full">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("home.events.error")}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Events */}
            {events &&
              events.map((event) => (
                <Card
                  key={event.id}
                  className="group hover:shadow-elegant transition-smooth hover:-translate-y-2 gradient-card border-border/50 overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={event.image || heroEventImage}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant="secondary"
                        className="bg-background/80 backdrop-blur-sm"
                      >
                        Evento
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                      {event.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(event.start_date)}
                        <Clock className="mr-2 h-4 w-4 ml-4" />
                        {formatTime(event.start_date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {addressesLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            {t("home.events.loadingLocation")}
                          </span>
                        ) : (
                          getEventAddress(event)
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <Link to={`/event/${generateSlug(event.name, event.id)}`}>
                      <Button className="w-full group/btn hover:shadow-glow transition-smooth">
                        {t("home.events.learnMore")}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-smooth" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

            {/* Empty State */}
            {events && events.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  {t("home.events.noEvents")}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="hover:shadow-card transition-smooth"
            >
              {t("home.events.viewAll")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-background/80" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t("home.cta.title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg gradient-button hover:shadow-elegant transition-bounce"
                >
                  {t("home.cta.getStarted")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src={logoLight} alt="Tikko" className="h-8" />
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                {t("home.footer.description")}
              </p>
              <div className="flex items-center space-x-4">
                <img src={mark} alt="Tikko Mark" className="h-6 opacity-50" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("home.footer.information")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-foreground transition-smooth"
                  >
                    {t("home.nav.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-foreground transition-smooth"
                  >
                    {t("home.nav.contact")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-foreground transition-smooth"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("home.footer.contact")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t("home.footer.phone")}</li>
                <li>{t("home.footer.email")}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              {t("home.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedIndex;
