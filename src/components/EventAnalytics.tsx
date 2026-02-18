import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { EventGateway } from "@/lib/EventGateway";
import { formatCurrency as formatCurrencyHelper } from "@/helpers/currency";

interface EventAnalyticsProps {
  eventId: number;
}

export const EventAnalytics = ({ eventId }: EventAnalyticsProps) => {
  const { t, i18n } = useTranslation();
  const [salesTimeWindow, setSalesTimeWindow] = useState("7d");
  const [validationTimeWindow, setValidationTimeWindow] = useState("30m");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  // Helper function to format numbers according to current locale
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return value.toLocaleString(locale, options);
  };

  // Helper function to format currency (converts from cents)
  const formatCurrency = (cents: number) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return formatCurrencyHelper(cents, locale);
  };

  // Convert time window to days
  const getDaysFromTimeWindow = (timeWindow: string) => {
    switch (timeWindow) {
      case "7d":
        return 7;
      case "14d":
        return 14;
      case "30d":
        return 30;
      default:
        return 7;
    }
  };

  // Convert time window to minutes
  const getMinutesFromTimeWindow = (timeWindow: string) => {
    switch (timeWindow) {
      case "30m":
        return 30;
      case "2h":
        return 120;
      case "5h":
        return 300;
      default:
        return 30;
    }
  };

  // Fetch event stats from backend
  const {
    data: eventStats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-stats", eventId],
    queryFn: () => eventGateway.getEventStats(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000,
    gcTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Fetch daily sales data separately
  const {
    data: dailySales,
    isLoading: isDailySalesLoading,
    error: dailySalesError,
  } = useQuery({
    queryKey: ["event-daily-sales", eventId, salesTimeWindow],
    queryFn: () =>
      eventGateway.getEventDailySales(
        eventId,
        getDaysFromTimeWindow(salesTimeWindow)
      ),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Fetch validated tickets data
  const { data: validatedTickets } = useQuery({
    queryKey: ["event-validated-tickets", eventId, validationTimeWindow],
    queryFn: () =>
      eventGateway.getEventValidatedTickets(
        eventId,
        getMinutesFromTimeWindow(validationTimeWindow)
      ),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t("eventManagement.analytics.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{t("eventManagement.analytics.error")}</div>
      </div>
    );
  }

  // Fake analytics data
  const analyticsData = {
    totalTickets: 150,
    liquidRevenue: 7500,
    validatedTickets: 89,
    validatedPercentage: 59,
    pageVisits: 2340,
    conversionRate: 6.4,
    avgAge: 28,
    avgMaleAge: 29,
    avgFemaleAge: 27,
    pendingRequests: 12,
    approvedRequests: 45,
    rejectedRequests: 8,
    freeTickets: 15,
    paidTickets: 135,
  };

  // Get sales data from daily sales endpoint or fallback to mock data
  const getSalesData = () => {
    if (!dailySales || dailySales.length === 0) {
      return [];
    }

    return dailySales.map((sale) => ({
      time: new Date(sale.date.split("T")[0]).toLocaleDateString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
        month: "short",
        day: "numeric",
      }),
      tickets: sale.total_sales,
    }));
  };

  const salesData = getSalesData();

  // Get validation data from validated tickets endpoint or fallback to mock data
  const getValidationData = () => {
    if (!validatedTickets) {
      return [];
    }

    if (validatedTickets.length === 0) {
      return [];
    }

    return validatedTickets.map((ticket) => ({
      time: new Date(ticket.timestamp).toLocaleTimeString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
        hour: "2-digit",
        minute: "2-digit",
      }),
      validated: ticket.count,
    }));
  };

  const validationData = getValidationData();

  // Calculate gender data from event stats
  const calculateGenderData = () => {
    if (!eventStats?.total_tickets_sold_by_gender) {
      return [
        { name: t("eventManagement.analytics.labels.male"), value: 55, count: 82, fill: "hsl(var(--primary))" },
        {
          name: t("eventManagement.analytics.labels.female"),
          value: 45,
          count: 68,
          fill: "hsl(var(--tikko-orange))",
        },
      ];
    }

    const maleCount =
      eventStats.total_tickets_sold_by_gender.total_male_tickets_sold;
    const femaleCount =
      eventStats.total_tickets_sold_by_gender.total_female_tickets_sold;
    const totalCount = maleCount + femaleCount;

    if (totalCount === 0) {
      return [
        { name: t("eventManagement.analytics.labels.male"), value: 50, count: 0, fill: "hsl(var(--primary))" },
        {
          name: t("eventManagement.analytics.labels.female"),
          value: 50,
          count: 0,
          fill: "hsl(var(--tikko-orange))",
        },
      ];
    }

    const malePercentage = Math.round((maleCount / totalCount) * 100);
    const femalePercentage = Math.round((femaleCount / totalCount) * 100);

    return [
      {
        name: t("eventManagement.analytics.labels.male"),
        value: malePercentage,
        count: maleCount,
        fill: "hsl(var(--primary))",
      },
      {
        name: t("eventManagement.analytics.labels.female"),
        value: femalePercentage,
        count: femaleCount,
        fill: "hsl(var(--tikko-orange))",
      },
    ];
  };

  const genderData = calculateGenderData();

  // Get age distribution from event stats or fallback to mock data
  const getAgeDistribution = () => {
    if (!eventStats?.age_stats?.age_distribution) {
      return [
        { age: "0-17", count: 1 },
        { age: "18-24", count: 1 },
        { age: "25-34", count: 1 },
        { age: "35-44", count: 1 },
        { age: "45-54", count: 1 },
        { age: "55+", count: 1 },
      ];
    }

    return eventStats.age_stats.age_distribution.map((ageGroup) => ({
      age: ageGroup.age_range,
      count: ageGroup.count,
    }));
  };

  const ageDistribution = getAgeDistribution();

  // Get ticket types from event stats or fallback to mock data
  const getAllTicketTypes = () => {
    if (!eventStats?.tickets_sold_by_pricing) {
      return [
        { type: "Early Bird", lot: "Lot 1", amount: 50, revenue: 2000 },
        { type: "Regular", lot: "Lot 2", amount: 80, revenue: 4000 },
        { type: "VIP", lot: "Lot 3", amount: 20, revenue: 1500 },
        { type: "Student", lot: "Lot 4", amount: 30, revenue: 900 },
        { type: "Group", lot: "Lot 5", amount: 25, revenue: 1250 },
        { type: "Last Minute", lot: "Lot 6", amount: 15, revenue: 900 },
        { type: "Premium", lot: "Lot 7", amount: 10, revenue: 800 },
        { type: "Corporate", lot: "Lot 8", amount: 12, revenue: 960 },
      ];
    }

    return eventStats.tickets_sold_by_pricing.map((pricing) => ({
      type: pricing.ticket_type,
      lot: `${pricing.lot}`,
      amount: pricing.tickets_sold,
      revenue: pricing.total_revenue,
    }));
  };

  const allTicketTypes = getAllTicketTypes();

  // Pagination logic
  const totalPages = Math.ceil(allTicketTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const ticketTypes = allTicketTypes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const TimeWindowSelector = ({
    options,
    selected,
    onSelect,
    className = "",
  }: {
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
    className?: string;
  }) => (
    <div className={`flex bg-muted rounded-lg p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${selected === option
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {t(`eventManagement.analytics.timeWindows.${option}`)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("eventManagement.analytics.cards.ticketsIssued.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventStats.total_tickets_sold}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("eventManagement.analytics.cards.totalRevenue.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(eventStats.total_revenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("eventManagement.analytics.cards.validatedTickets.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventStats.total_validated_tickets}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(
                (100 * eventStats.total_validated_tickets) /
                eventStats.total_tickets_sold,
                {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }
              )}
              % {t("eventManagement.analytics.labels.ofTotal")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("eventManagement.analytics.cards.conversionRate.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(eventStats.conversion_rate, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(eventStats.total_visits)} {t("eventManagement.analytics.labels.pageVisits")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ticket Sales Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>{t("eventManagement.analytics.cards.dailySales.title")}</CardTitle>
                {dailySales &&
                  dailySales.length > 0 &&
                  dailySales[dailySales.length - 1].percentage_change !==
                  null &&
                  dailySales[dailySales.length - 1].percentage_change !==
                  undefined && (
                    <div
                      className={`text-sm font-medium ${dailySales[dailySales.length - 1].percentage_change! >=
                        0
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      {dailySales[dailySales.length - 1].percentage_change! >= 0
                        ? "+"
                        : ""}
                      {formatNumber(dailySales[
                        dailySales.length - 1
                      ].percentage_change!, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      %
                    </div>
                  )}
              </div>
              <TimeWindowSelector
                options={["7d", "14d", "30d"]}
                selected={salesTimeWindow}
                onSelect={setSalesTimeWindow}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              {isDailySalesLoading ? (
                <div className="text-muted-foreground">
                  {t("eventManagement.analytics.loading")}
                </div>
              ) : dailySalesError ? (
                <div className="text-red-500">{t("eventManagement.analytics.error")}</div>
              ) : salesData.length === 0 ? (
                <div className="text-muted-foreground">
                  {t("eventManagement.analytics.noData")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="tickets"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>{t("eventManagement.analytics.cards.validatedTickets.title")}</CardTitle>
              <TimeWindowSelector
                options={["30m", "2h", "5h"]}
                selected={validationTimeWindow}
                onSelect={setValidationTimeWindow}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              {validationData.length === 0 ? (
                <div className="text-muted-foreground">
                  {t("eventManagement.analytics.noData")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={validationData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="validated"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t("eventManagement.analytics.cards.genderDistribution.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${props.payload.count} people (${value}%)`,
                    ]}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--tikko-orange))",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                      paddingTop: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Statistics */}
            <div className="space-y-3 text-sm">
              {genderData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.count} people</div>
                    <div className="text-xs text-muted-foreground">
                      {item.value}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t("eventManagement.analytics.cards.ageStatistics.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("eventManagement.analytics.labels.averageAge")}</span>
              <span className="text-sm font-medium">
                {formatNumber(eventStats.age_stats.average_age_all)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {t("eventManagement.analytics.labels.avgMaleAge")}
              </span>
              <span className="text-sm font-medium">
                {formatNumber(eventStats.age_stats.average_age_male)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {t("eventManagement.analytics.labels.avgFemaleAge")}
              </span>
              <span className="text-sm font-medium">
                {formatNumber(eventStats.age_stats.average_age_female)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Join Requests */}
        <Card>
          <CardHeader>
            <CardTitle>{t("eventManagement.analytics.cards.joinRequests.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("eventManagement.analytics.labels.pending")}</span>
              <Badge variant="outline">
                {formatNumber(eventStats.total_pending_invites)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("eventManagement.analytics.labels.approved")}</span>
              <Badge variant="default">
                {formatNumber(eventStats.total_accepted_invites)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("eventManagement.analytics.labels.rejected")}</span>
              <Badge variant="destructive">
                {formatNumber(eventStats.total_rejected_invites)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("eventManagement.analytics.cards.ageDistribution.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="age"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("eventManagement.analytics.cards.ticketsByType.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header - Visible on all devices */}
            <div className="grid grid-cols-12 gap-2 md:gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <span className="col-span-4 md:col-span-4">{t("eventManagement.analytics.labels.type")}</span>
              <span className="col-span-2">{t("eventManagement.analytics.labels.lot")}</span>
              <span className="col-span-3 md:col-span-3">{t("eventManagement.analytics.labels.amount")}</span>
              <span className="col-span-3">{t("eventManagement.analytics.labels.revenue")}</span>
            </div>
            <div className="space-y-2">
              {ticketTypes.map((ticket, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 md:gap-4 text-sm py-3 border-b border-border/50 last:border-0 items-center"
                >
                  {/* Type - Takes majority of width on mobile */}
                  <div className="col-span-4 md:col-span-4">
                    <span className="font-medium text-xs md:text-sm">
                      {ticket.type}
                    </span>
                  </div>

                  {/* Lot */}
                  <div className="col-span-2 md:col-span-2">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {ticket.lot}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-3 md:col-span-3">
                    <span className="text-xs md:text-sm">{formatNumber(ticket.amount)}</span>
                  </div>

                  {/* Revenue */}
                  <div className="col-span-3 md:col-span-3">
                    <span className="text-xs md:text-sm font-medium">
                      {formatCurrency(ticket.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, allTicketTypes.length)}{" "}
                  {t("eventManagement.analytics.pagination.of")} {formatNumber(allTicketTypes.length)}
                </p>

                <div className="flex items-center gap-2">
                  {/* Desktop pagination with labels */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("eventManagement.analytics.pagination.previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      disabled={currentPage >= totalPages}
                    >
                      {t("eventManagement.analytics.pagination.next")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {/* Mobile pagination with icons only */}
                  <div className="flex md:hidden items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      disabled={currentPage <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      disabled={currentPage >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("eventManagement.analytics.cards.ticketDistribution.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">{t("eventManagement.analytics.labels.paidTickets")}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatNumber(eventStats.paid_tickets)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">{t("eventManagement.analytics.labels.freeTickets")}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatNumber(eventStats.free_tickets)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {
          false && (<Card>
            <CardHeader>
              <CardTitle>{t("eventManagement.analytics.cards.quickActions.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t("eventManagement.analytics.actions.exportReport")}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t("eventManagement.analytics.actions.viewDetailedCharts")}
              </Button>
            </CardContent>
          </Card>)
        }
      </div>
    </div>
  );
};
