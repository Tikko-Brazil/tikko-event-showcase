import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Edit } from "lucide-react";
import { EventGateway } from "@/lib/EventGateway";
import { useNavigate } from "react-router-dom";
import generateSlug from "@/helpers/generateSlug";
import DashboardLayout from "@/components/DashboardLayout";

const MyEvents = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  const { data: userEventsResponse, isLoading: isLoadingUserEvents } = useQuery({
    queryKey: ["userEvents"],
    queryFn: () => eventGateway.getUserEvents(),
  });

  const userEvents = userEventsResponse?.events || [];
  const hasAdminPrivileges = userEvents.some(
    (userEvent) => userEvent.is_admin === true
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {t("dashboard.myEvents.title")}
          </h2>
          {hasAdminPrivileges && (
            <Button onClick={() => navigate("/create-event")}>
              {t("dashboard.myEvents.createEvent")}
            </Button>
          )}
        </div>

        {isLoadingUserEvents ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created or joined any events yet.
            </p>
            {hasAdminPrivileges && (
              <Button onClick={() => navigate("/create-event")}>
                Create Your First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {userEvents.map((userEvent) => {
              const event = userEvent.event;
              const eventDate = new Date(event.start_date);
              const isUpcoming = eventDate > new Date();

              return (
                <Card
                  key={event.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer"
                  onClick={() => navigate(`/event/${generateSlug(event.name, event.id)}`)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={event.image || "/placeholder-event.jpg"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge variant={isUpcoming ? "default" : "secondary"}>
                        {isUpcoming
                          ? t("dashboard.myEvents.tags.upcoming")
                          : t("dashboard.myEvents.tags.past")}
                      </Badge>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">{userEvent.role}</Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {event.name}
                      </h4>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {eventDate.toLocaleDateString(
                              i18n.language === "pt" ? "pt-BR" : "en-US"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {eventDate.toLocaleTimeString(
                              i18n.language === "pt" ? "pt-BR" : "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{event.address_name}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!event.is_paid && (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </div>
                      {userEvent.role !== "Guest" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/event-management/${event.id}`);
                          }}
                          className="group"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t("dashboard.myEvents.buttons.manage")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyEvents;
