import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Ticket,
  Calendar,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TicketGateway } from "@/lib/TicketGateway";
import { toast } from "sonner";
import QRCodeCanvas from "react-qrcode-logo";
import markLogo from "@/assets/mark.png";
import { QrcodeSVG } from "react-qrcode-pretty";

const TicketQRCode = ({
  ticketId: propTicketId,
  onClose,
}: {
  ticketId?: string;
  onClose?: () => void;
}) => {
  const { ticketId: paramTicketId } = useParams();
  const ticketId = propTicketId || paramTicketId;
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  // Check if user came from dashboard or ticket details
  const cameFromDashboard = location.state?.from === "dashboard";

  const handleBackClick = () => {
    if (onClose) {
      onClose();
    } else if (cameFromDashboard) {
      navigate("/my-tickets");
    } else {
      navigate(`/ticket/${ticketId}`);
    }
  };

  const ticketGateway = new TicketGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );

  const { data: userTicketsResponse, isLoading } = useQuery({
    queryKey: ["userTickets"],
    queryFn: () => ticketGateway.getUserTickets(),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const ticketData = userTicketsResponse?.tickets?.find(
    (t) => t.ticket.uuid === ticketId
  );

  // PDF Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!ticketData) throw new Error("Ticket data not found");
      // Try different possible locations for user_id
      const userId = ticketData.user_id || ticketData.ticket.user_id;
      if (!userId) {
        console.error("User ID not found in ticket data:", ticketData);
        throw new Error("User ID not found");
      }
      return ticketGateway.getTicketDownloadUrl(userId, ticketData.event.id);
    },
    onSuccess: (response) => {
      // Open download URL in new tab
      window.open(response.download_url, '_blank');

      toast.success(t("myTickets.downloadSuccess"));
      setShowDownloadDialog(false);
    },
    onError: (error) => {
      console.error('Download error:', error);
      toast.error(t("common.error"));
      setShowDownloadDialog(false);
    }
  });

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

  const handleDownloadPDF = () => {
    downloadMutation.mutate();
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

  const { ticket, event, user_name, user_email } = ticketData;
  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Button variant="ghost" onClick={handleBackClick} className="gap-2">
            {onClose ? (
              <X className="h-4 w-4" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            {onClose ? "Close" : t("myTickets.backToDetails")}
          </Button>
          <h1 className="text-lg font-semibold hidden md:block">
            {t("myTickets.qrCode")}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl md:text-2xl">
              {t("myTickets.scanQR")}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {t("myTickets.qrInstructions")}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge
                variant={ticket.already_validated ? "secondary" : "default"}
                className="text-sm"
              >
                {ticket.already_validated
                  ? t("myTickets.status.used")
                  : t("myTickets.status.active")}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <QrcodeSVG
                value={ticket.uuid}
                variant={{
                  eyes: "italic",
                  body: "italic",
                }}
                color={{
                  eyes: "#6b26d9",
                  body: "#241f31",
                }}
                colorEffect={{
                  eyes: "gradient-light-diagonal",
                  body: "none",
                }}
                padding={12}
                margin={0}
                size={250}
                bgColor="#f6f5f4"
                bgRounded
                divider
                image={markLogo}
              />
            </div>

            {/* Event Information */}
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" />
                  <span>{formatTicketName(ticket)}</span>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {eventDate.toLocaleDateString(
                      i18n.language === "pt" ? "pt-BR" : "en-US"
                    )}
                  </span>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>
                    {eventDate.toLocaleTimeString(
                      i18n.language === "pt" ? "pt-BR" : "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="break-words text-center">
                    {event.address_name}
                  </span>
                </div>
              </div>

              {/* Ticket Code */}
              {false && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("myTickets.ticketCode")}
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {ticket.uuid}
                  </p>
                </div>
              )}

              {/* User Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>{user_name}</p>
                <p className="break-all">{user_email}</p>
              </div>
            </div>

            {/* Download Button */}
            <Button
              variant="outline"
              onClick={() => setShowDownloadDialog(true)}
              className="w-full"
              size={isMobile ? "lg" : "default"}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("myTickets.downloadPDF")}
            </Button>

            {/* Warning Message */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {t("myTickets.qrWarning")}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Download Confirmation Dialog */}
      <AlertDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("myTickets.downloadDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("myTickets.downloadDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("myTickets.downloadDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDownloadPDF}
              disabled={downloadMutation.isPending}
            >
              {downloadMutation.isPending ? t("common.loading") : t("myTickets.downloadDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketQRCode;
