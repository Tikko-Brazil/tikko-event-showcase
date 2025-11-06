import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowRight,
  Search,
} from "lucide-react";
import { EventGateway } from "@/lib/EventGateway";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import generateSlug from "@/helpers/generateSlug";
import heroEventImage from "@/assets/hero-event-image.jpg";
import DashboardLayout from "@/components/DashboardLayout";
import { Pagination } from "@/components/Pagination";
import { debounce } from "lodash";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
const geocodingGateway = new GeocodingGateway();

const ITEMS_PER_PAGE = 9;

const Events = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch events with pagination and search
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["events", currentPage, searchQuery],
    queryFn: () =>
      eventGateway.getEvents({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        order_by_participants: true,
      }),
  });

  // Fetch addresses for events with coordinates
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: [
      "addresses",
      events?.events?.map((e) => `${e.latitude},${e.longitude}`).join("|"),
    ],
    queryFn: async () => {
      if (!events?.events) return {};

      const addressMap: Record<string, any> = {};

      for (const event of events.events) {
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
    enabled: !!events?.events && events.events.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
  });

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, events?.total || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{t("home.events.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("home.events.subtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("dashboard.search.placeholder")}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Loading State */}
        {eventsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {t("home.events.loading")}
            </span>
          </div>
        )}

        {/* Error State */}
        {eventsError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t("home.events.error")}</AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        {!eventsLoading && events?.events && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.events.map((event) => (
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
            </div>

            {/* Empty State */}
            {events.events.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t("home.events.noEvents")}
                </p>
              </div>
            )}

            {/* Pagination */}
            {events.total_pages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={events.total_pages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={events.total}
                itemName={t("home.events.title").toLowerCase()}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
