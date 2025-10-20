import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { toast } from "sonner";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  // Mock data - replace with real API call
  const ticket = {
    id: ticketId,
    eventTitle: "Summer Music Festival 2024",
    eventDescription: "Join us for an unforgettable night of live music featuring top artists from around the world.",
    ticketType: "VIP Access",
    date: "Jun 15, 2024",
    time: "6:00 PM",
    location: "Central Park, NY",
    fullAddress: "Central Park, 59th to 110th Street, Manhattan, NY 10022",
    status: "active",
    qrCode: "QR_123456789",
    price: "$125.00",
    orderNumber: "ORD-2024-001234",
    purchaseDate: "May 10, 2024",
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
    },
  };

  const handleDownloadPDF = () => {
    setShowDownloadDialog(false);
    toast.success(t("myTickets.downloadSuccess"));
    // TODO: Implement actual PDF download
  };

  const handleShowQR = () => {
    navigate(`/ticket/${ticketId}/qr`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/my-tickets")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("myTickets.backToDashboard")}
          </Button>
          <h1 className="text-lg font-semibold hidden md:block">
            {t("myTickets.ticketDetails")}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
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
          <span className="text-sm text-muted-foreground">
            {t("myTickets.orderNumber")}: {ticket.orderNumber}
          </span>
        </div>

        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("myTickets.eventInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{ticket.eventTitle}</h2>
              <p className="text-muted-foreground">{ticket.eventDescription}</p>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.date")}</p>
                  <p className="text-sm text-muted-foreground">{ticket.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.time")}</p>
                  <p className="text-sm text-muted-foreground">{ticket.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.location")}</p>
                  <p className="text-sm text-muted-foreground">{ticket.fullAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {t("myTickets.ticketInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">{t("myTickets.ticketType")}</p>
                <p className="text-sm text-muted-foreground">{ticket.ticketType}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("myTickets.price")}</p>
                <p className="text-sm text-muted-foreground">{ticket.price}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("myTickets.purchaseDate")}</p>
                <p className="text-sm text-muted-foreground">{ticket.purchaseDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("myTickets.ticketCode")}</p>
                <p className="text-sm text-muted-foreground font-mono">{ticket.qrCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("myTickets.userInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.name")}</p>
                  <p className="text-sm text-muted-foreground">{ticket.user.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.email")}</p>
                  <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("myTickets.phone")}</p>
                  <p className="text-sm text-muted-foreground">{ticket.user.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={`flex gap-3 ${isMobile ? "flex-col" : ""}`}>
          <Button
            onClick={handleShowQR}
            className="flex-1"
            size={isMobile ? "lg" : "default"}
          >
            <QrCode className="h-4 w-4 mr-2" />
            {t("myTickets.actions.showQR")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDownloadDialog(true)}
            className="flex-1"
            size={isMobile ? "lg" : "default"}
          >
            <Download className="h-4 w-4 mr-2" />
            {t("myTickets.downloadPDF")}
          </Button>
        </div>
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

export default TicketDetails;
