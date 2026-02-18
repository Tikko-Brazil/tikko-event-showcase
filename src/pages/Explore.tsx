import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination } from "@/components/Pagination";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { EventGateway } from "@/lib/EventGateway";
import { useGetEvents } from "@/api/event/api";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import generateSlug from "@/helpers/generateSlug";
import DashboardLayout from "@/components/DashboardLayout";
import heroEventImage from "@/assets/hero-event-image.jpg";

const eventGateway = new EventGateway(import.meta.env.VITE_API_BASE_URL);
const geocodingGateway = new GeocodingGateway();

const Explore = () => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch events with pagination and ordering by participants
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useGetEvents({
    page: currentPage,
    limit: itemsPerPage,
    active: "true",
    order_by_participants: true,
    only_ongoing: true,
  });

  // Fetch addresses for events with coordinates
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: [
      "addresses",
      eventsData?.events?.map((e) => `${e.latitude},${e.longitude}`).join("|"),
    ],
    queryFn: async () => {
      if (!eventsData?.events) return {};

      const addressMap: Record<string, any> = {};

      for (const event of eventsData.events) {
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
    enabled: !!eventsData?.events && eventsData.events.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const getEventAddress = (event: any) => {
    const cacheKey = `${event.latitude},${event.longitude}`;
    const address = addresses?.[cacheKey];
    if (address) {
      return `${address.city}, ${address.state}`;
    }
    return event.location || t("home.events.locationNotAvailable");
  };

  const totalPages = eventsData ? Math.ceil(eventsData.total / itemsPerPage) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with title and pagination */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("dashboard.tabs.explore")}</h2>

          {/* Pagination */}
          {eventsData && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={(currentPage - 1) * itemsPerPage + 1}
              endIndex={Math.min(currentPage * itemsPerPage, eventsData.total)}
              totalItems={eventsData.total}
            />
          )}
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
            <AlertDescription>
              {t("home.events.error")}
            </AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        {eventsData?.events && eventsData.events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsData.events.map((event) => (
              <Card
                key={event.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={event.image || heroEventImage}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background"></div>
                  {false &&
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {event.participant_count} {event.participant_count === 1 ? 'participant' : 'participants'}
                      </Badge>
                    </div>
                  }
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {event.name}
                    </h4>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatEventDate(event.start_date, "EEEE, d 'de' MMMM 'de' yyyy")}
                      <Clock className="mr-2 h-4 w-4 ml-4" />
                      {formatEventTime(event.start_date)}
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
        )}

        {/* Empty State */}
        {eventsData?.events && eventsData.events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("home.events.noEvents")}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Explore;
