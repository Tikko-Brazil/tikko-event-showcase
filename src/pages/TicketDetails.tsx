import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Download,
  X,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TicketGateway } from "@/lib/TicketGateway";
import { toast } from "sonner";

const TicketDetails = ({
  ticketId: propTicketId,
  onClose,
  onShowQR,
}: {
  ticketId?: string;
  onClose?: () => void;
  onShowQR?: () => void;
}) => {
  const { ticketId: paramTicketId } = useParams();
  const ticketId = propTicketId || paramTicketId;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  const ticketGateway = new TicketGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );

  const { data: userTicketsResponse, isLoading } = useQuery({
    queryKey: ["userTickets"],
    queryFn: () => ticketGateway.getUserTickets(),
  });

  const ticketData = userTicketsResponse?.tickets?.find(
    (t) => t.ticket.uuid === ticketId
  );

  const formatTicketName = (ticket: any) => {
    const genderText =
      ticket?.gender === "male"
        ? "Masculino"
        : ticket?.gender === "female"
        ? "Feminino"
        : "";

    const lotText = ticket?.lot ? ` - Lote ${ticket.lot}` : "";
    const typeText = ticket?.ticket_type || "";

    return `${typeText}${genderText ? ` ${genderText}` : ""}${lotText}`;
  };

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";
    return value.toLocaleString(locale, options);
  };

  const formatCurrency = (value: number) => {
    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";
    return formatNumber(value, {
      style: "currency",
      currency: locale === "pt-BR" ? "BRL" : "USD",
    });
  };

  const handleDownloadPDF = () => {
    setShowDownloadDialog(false);
    toast.success(t("myTickets.downloadSuccess"));
    // TODO: Implement actual PDF download
  };

  const handleShowQR = () => {
    if (onShowQR) {
      onShowQR();
    } else {
      navigate(`/ticket/${ticketId}/qr`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">Ticket not found</div>
      </div>
    );
  }

  const { ticket, event, user_name, user_email, user_phone } = ticketData;
  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 w-full overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            onClick={() => (onClose ? onClose() : navigate("/my-tickets"))}
            className="gap-2"
          >
            {onClose ? (
              <X className="h-4 w-4" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            {t("myTickets.backToTickets")}
          </Button>
          <Badge variant={ticket.already_validated ? "secondary" : "default"}>
            {ticket.already_validated
              ? t("myTickets.status.used")
              : t("myTickets.status.active")}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 w-full max-w-2xl mx-auto space-y-6">
        {/* Event Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("myTickets.eventInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.date")}</p>
                  <p className="text-sm text-muted-foreground">
                    {eventDate.toLocaleDateString(
                      i18n.language === "pt" ? "pt-BR" : "en-US"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.time")}</p>
                  <p className="text-sm text-muted-foreground">
                    {eventDate.toLocaleTimeString(
                      i18n.language === "pt" ? "pt-BR" : "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {t("myTickets.location")}
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    {event.address_name}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {t("myTickets.ticketInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {t("myTickets.ticketType")}
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    {formatTicketName(ticket)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">$</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{t("myTickets.price")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(ticket.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {t("myTickets.purchaseDate")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.purchased_at
                      ? new Date(ticket.purchased_at).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US"
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("myTickets.holderInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {t("myTickets.holderName")}
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    {user_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t("myTickets.email")}</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {user_email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t("myTickets.phone")}</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {user_phone}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleShowQR} className="flex-1" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            {t("myTickets.actions.showQR")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDownloadDialog(true)}
            className="flex-1"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {t("myTickets.actions.downloadPDF")}
          </Button>
        </div>
      </div>

      {/* Download Confirmation Dialog */}
      <AlertDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("myTickets.downloadConfirmation.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("myTickets.downloadConfirmation.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDownloadPDF}>
              {t("myTickets.actions.download")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketDetails;
