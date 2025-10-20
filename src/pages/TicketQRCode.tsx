import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { ArrowLeft, Download, Ticket, Calendar, Clock, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import QRCodeCanvas from "react-qrcode-logo";
import markLogo from "@/assets/mark.png";

const TicketQRCode = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  // Check if user came from dashboard or ticket details
  const cameFromDashboard = location.state?.from === 'dashboard';

  const handleBackClick = () => {
    if (cameFromDashboard) {
      navigate('/my-tickets');
    } else {
      navigate(`/ticket/${ticketId}`);
    }
  };

  // Mock data - replace with real API call
  const ticket = {
    id: ticketId,
    eventTitle: "Summer Music Festival 2024",
    ticketType: "VIP Access",
    date: "Jun 15, 2024",
    time: "6:00 PM",
    location: "Central Park, NY",
    status: "active",
    qrCode: "QR_123456789_TICKET_CHECKIN",
    orderNumber: "ORD-2024-001234",
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
    },
  };

  const handleDownloadPDF = () => {
    setShowDownloadDialog(false);
    toast.success(t("myTickets.downloadSuccess"));
    // TODO: Implement actual PDF download
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("myTickets.backToDetails")}
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
            <CardTitle className="text-xl md:text-2xl">{t("myTickets.scanQR")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {t("myTickets.qrInstructions")}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge
                variant={
                  ticket.status === "active"
                    ? "default"
                    : ticket.status === "used"
                    ? "secondary"
                    : "outline"
                }
                className="text-sm"
              >
                {t(`myTickets.status.${ticket.status}`)}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
                <QRCodeCanvas
                  value={ticket.qrCode}
                  size={isMobile ? 240 : 320}
                  logoImage={markLogo}
                  logoWidth={isMobile ? 48 : 64}
                  logoHeight={isMobile ? 48 : 64}
                  logoOpacity={1}
                  quietZone={0}
                  removeQrCodeBehindLogo={true}
                  qrStyle="squares"
                  eyeRadius={{ outer: 4, inner: 4 }}
                  eyeColor={{
                    outer: "hsl(215 28% 17%)",
                    inner: "hsl(263 70% 50%)",
                  }}
                />
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">{ticket.eventTitle}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" />
                  <span>{ticket.ticketType}</span>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{ticket.date}</span>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>{ticket.time}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{ticket.location}</span>
                </div>
              </div>

              {/* Ticket Code */}
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("myTickets.ticketCode")}
                </p>
                <p className="font-mono text-sm font-semibold">{ticket.qrCode}</p>
              </div>

              {/* User Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>{ticket.user.name}</p>
                <p>{ticket.user.email}</p>
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
      <AlertDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("myTickets.downloadDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("myTickets.downloadDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("myTickets.downloadDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDownloadPDF}>
              {t("myTickets.downloadDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketQRCode;
