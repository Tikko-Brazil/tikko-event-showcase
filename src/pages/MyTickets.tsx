import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, QrCode } from "lucide-react";
import { TicketGateway } from "@/lib/TicketGateway";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const MyTickets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ticketGateway = new TicketGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );

  const { data: userTicketsResponse, isLoading: isLoadingUserTickets } =
    useQuery({
      queryKey: ["userTickets"],
      queryFn: () => ticketGateway.getUserTickets(),
    });

  const userTickets = userTicketsResponse?.tickets || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t("myTickets.title")}</h2>
        {isLoadingUserTickets ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userTickets && userTickets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userTickets.map((ticketData) => (
              <Card
                key={ticketData.ticket.uuid}
                className="group hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {ticketData.event.name}
                      </h3>
                      <Badge
                        variant={
                          ticketData.ticket.already_validated
                            ? "secondary"
                            : "default"
                        }
                      >
                        {ticketData.ticket.already_validated ? "Used" : "Active"}
                      </Badge>
                    </div>
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      <span>{ticketData.ticket.ticket_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(ticketData.event.date).toLocaleDateString()}
                      </span>
                    </div>
                    {ticketData.ticket.validation_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Validated:{" "}
                          {new Date(
                            ticketData.ticket.validation_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        navigate(`/ticket/${ticketData.ticket.uuid}`)
                      }
                    >
                      {t("myTickets.actions.viewDetails")}
                    </Button>
                    {!ticketData.ticket.already_validated && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          navigate(`/ticket/${ticketData.ticket.uuid}/qr`, {
                            state: { from: "dashboard" },
                          })
                        }
                      >
                        {t("myTickets.actions.showQR")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
            <p className="text-muted-foreground">
              You haven't purchased any tickets yet.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTickets;
