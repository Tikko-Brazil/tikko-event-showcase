import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Users,
  DollarSign,
  Ticket,
  TrendingUp,
  Edit,
  Gift,
  CheckCircle2,
} from "lucide-react";

interface EventData {
  attendees: number;
  capacity: number;
  revenue: number;
  ticketsSold: number;
  ticketsAvailable: number;
}

interface EventOverviewProps {
  eventData: EventData;
}

export const EventOverview = ({ eventData }: EventOverviewProps) => {
  const { t } = useTranslation();
  
  return (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("eventManagement.overview.cards.attendees")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventData.attendees}</div>
          <p className="text-xs text-muted-foreground">
            {eventData.capacity - eventData.attendees} {t("eventManagement.overview.stats.spotsRemaining")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t("eventManagement.overview.cards.revenue")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${eventData.revenue}</div>
          <p className="text-xs text-muted-foreground">+12% {t("eventManagement.overview.stats.fromLastWeek")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            {t("eventManagement.overview.cards.soldTickets")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventData.ticketsSold}</div>
          <p className="text-xs text-muted-foreground">
            {eventData.ticketsAvailable} {t("eventManagement.overview.stats.available")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("eventManagement.overview.cards.conversionRate")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78%</div>
          <p className="text-xs text-muted-foreground">+5% {t("eventManagement.overview.stats.increase")}</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("eventManagement.overview.recentActivity.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              action: t("eventManagement.overview.recentActivity.ticketPurchased"),
              user: "Sarah Johnson",
              time: `2 ${t("eventManagement.overview.recentActivity.minutes")} ${t("eventManagement.overview.recentActivity.ago")}`,
            },
            {
              action: t("eventManagement.overview.recentActivity.newRegistration"),
              user: "Mike Chen",
              time: `15 ${t("eventManagement.overview.recentActivity.minutes")} ${t("eventManagement.overview.recentActivity.ago")}`,
            },
            {
              action: t("eventManagement.overview.recentActivity.ticketPurchased"),
              user: "Emily Davis",
              time: `1 ${t("eventManagement.overview.recentActivity.hours")} ${t("eventManagement.overview.recentActivity.ago")}`,
            },
            {
              action: t("eventManagement.overview.recentActivity.paymentReceived"),
              user: "Alex Rodriguez",
              time: `2 ${t("eventManagement.overview.recentActivity.hours")} ${t("eventManagement.overview.recentActivity.ago")}`,
            },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{activity.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("eventManagement.overview.quickActions.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            {t("eventManagement.overview.quickActions.editEvent")}
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            {t("eventManagement.overview.quickActions.viewParticipantList")}
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Gift className="h-4 w-4 mr-2" />
            {t("eventManagement.overview.quickActions.createDiscountCode")}
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t("eventManagement.overview.quickActions.validateTickets")}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};
