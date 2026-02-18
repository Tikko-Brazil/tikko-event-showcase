import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { EventGateway } from "@/lib/EventGateway";
import { formatCurrency as formatCurrencyHelper } from "@/helpers/currency";
import {
  Users,
  DollarSign,
  Ticket,
  TrendingUp,
  Edit,
  Gift,
  CheckCircle2,
} from "lucide-react";

interface EventOverviewProps {
  eventId: number;
}

interface EventStatsOverview {
  total_sold_tickets: number;
  liquid_revenue: number;
  conversion_rate: number;
  average_age: number;
  recent_activity: {
    action: number;
    user_name: string;
    time_ago: number;
  }[];
}

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);

export const EventOverview = ({ eventId }: EventOverviewProps) => {
  const { t, i18n } = useTranslation();

  const {
    data: statsData,
    isLoading,
    error,
  } = useQuery<EventStatsOverview>({
    queryKey: ["eventStatsOverview", eventId],
    queryFn: () => eventGateway.getEventStatsOverview(eventId),
    enabled: !!eventId && !isNaN(eventId),
  });

  const formatNumber = (num: number) => {
    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";
    return num.toLocaleString(locale);
  };

  const formatCurrency = (cents: number) => {
    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";
    return formatCurrencyHelper(cents, locale);
  };

  const getActionText = (actionCode: number) => {
    if (actionCode === 1) {
      return i18n.language === "pt"
        ? "Solicitou Participar"
        : "Requested to Join";
    }
    return i18n.language === "pt" ? "Aceito" : "Accepted";
  };

  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) {
      return i18n.language === "pt" ? "agora mesmo" : "just now";
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return i18n.language === "pt"
        ? minutes === 1
          ? "1 minuto atrás"
          : `${minutes} minutos atrás`
        : minutes === 1
        ? "1 minute ago"
        : `${minutes} minutes ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return i18n.language === "pt"
        ? hours === 1
          ? "1 hora atrás"
          : `${hours} horas atrás`
        : hours === 1
        ? "1 hour ago"
        : `${hours} hours ago`;
    } else {
      const days = Math.floor(seconds / 86400);
      return i18n.language === "pt"
        ? days === 1
          ? "1 dia atrás"
          : `${days} dias atrás`
        : days === 1
        ? "1 day ago"
        : `${days} days ago`;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!statsData) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              {t("eventManagement.overview.cards.issuedTickets")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(statsData?.total_sold_tickets || 0)}
            </div>
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
            <div className="text-2xl font-bold">
              {formatCurrency(statsData?.liquid_revenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("eventManagement.overview.cards.averageAge")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(statsData?.average_age || 0)}
            </div>
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
            <div className="text-2xl font-bold">
              {formatNumber(statsData?.conversion_rate || 0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("eventManagement.overview.recentActivity.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsData?.recent_activity?.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {activity.user_name
                        .split("_")
                        .map((n) => n[0].toUpperCase())
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getActionText(activity.action)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user_name} • {formatTimeAgo(activity.time_ago)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {t("eventManagement.overview.quickActions.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Edit className="mr-2 h-4 w-4" />
              {t("eventManagement.overview.quickActions.editEvent")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              {t("eventManagement.overview.quickActions.viewParticipantList")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Gift className="mr-2 h-4 w-4" />
              {t("eventManagement.overview.quickActions.createDiscountCode")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t("eventManagement.overview.quickActions.validateTickets")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
