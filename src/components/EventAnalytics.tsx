import React, { useState } from "react";
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

interface EventAnalyticsProps {
  eventId: number;
}

export const EventAnalytics = ({ eventId }: EventAnalyticsProps) => {
  const [salesTimeWindow, setSalesTimeWindow] = useState("7d");
  const [validationTimeWindow, setValidationTimeWindow] = useState("7d");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);

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

  // Fetch event stats from backend
  const {
    data: eventStats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-stats", eventId],
    queryFn: () => eventGateway.getEventStats(eventId),
    enabled: !!eventId,
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
  });

  // Console log the fetched data
  React.useEffect(() => {
    if (eventStats) {
      console.log("Event Stats:", eventStats);
    }
  }, [eventStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading analytics data</div>
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
    if (!dailySales) {
      return [
        { time: "Day 7", tickets: 1 },
        { time: "Day 6", tickets: 1 },
        { time: "Day 5", tickets: 1 },
        { time: "Day 4", tickets: 1 },
        { time: "Day 3", tickets: 1 },
        { time: "Day 2", tickets: 1 },
        { time: "Day 1", tickets: 1 },
      ];
    }

    const days = getDaysFromTimeWindow(salesTimeWindow);
    const today = new Date();
    const salesMap = new Map();

    // Create map of existing sales data
    dailySales.forEach((sale) => {
      const date = sale.date.split('T')[0]; // Extract YYYY-MM-DD from ISO string
      salesMap.set(date, sale.total_sales);
    });

    // Generate complete date range with 0 for missing days
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const formattedDate = date.toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
      });

      result.push({
        time: formattedDate,
        tickets: salesMap.get(dateKey) || 0,
      });
    }

    return result;
  };

  const salesData = getSalesData();

  // Validation data based on selected time window
  const validationDataSets = {
    "15m": [
      { time: "15m", validated: 5 },
      { time: "12m", validated: 8 },
      { time: "9m", validated: 12 },
      { time: "6m", validated: 15 },
      { time: "3m", validated: 18 },
    ],
    "30m": [
      { time: "30m", validated: 12 },
      { time: "25m", validated: 18 },
      { time: "20m", validated: 25 },
      { time: "15m", validated: 32 },
      { time: "10m", validated: 28 },
      { time: "5m", validated: 35 },
    ],
    "1h": [
      { time: "60m", validated: 15 },
      { time: "50m", validated: 22 },
      { time: "40m", validated: 28 },
      { time: "30m", validated: 35 },
      { time: "20m", validated: 41 },
      { time: "10m", validated: 45 },
    ],
    "2h": [
      { time: "2h", validated: 25 },
      { time: "100m", validated: 32 },
      { time: "80m", validated: 38 },
      { time: "60m", validated: 45 },
      { time: "40m", validated: 52 },
      { time: "20m", validated: 58 },
    ],
    "5h": [
      { time: "5h", validated: 35 },
      { time: "4h", validated: 45 },
      { time: "3h", validated: 55 },
      { time: "2h", validated: 65 },
      { time: "1h", validated: 75 },
      { time: "30m", validated: 89 },
    ],
  };

  // Calculate gender data from event stats
  const calculateGenderData = () => {
    if (!eventStats?.total_tickets_sold_by_gender) {
      return [
        { name: "Male", value: 55, count: 82, fill: "hsl(var(--primary))" },
        {
          name: "Female",
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
        { name: "Male", value: 50, count: 0, fill: "hsl(var(--primary))" },
        {
          name: "Female",
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
        name: "Male",
        value: malePercentage,
        count: maleCount,
        fill: "hsl(var(--primary))",
      },
      {
        name: "Female",
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
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            selected === option
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option}
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
            <CardTitle className="text-sm">Total Tickets Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventStats.total_tickets_sold}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Liquid Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {eventStats.total_revenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validated Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventStats.total_validated_tickets}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (100 * eventStats.total_validated_tickets) /
                eventStats.total_tickets_sold
              ).toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventStats.conversion_rate.toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {eventStats.total_visits} page visits
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
                <CardTitle>Tickets Sold</CardTitle>
                {dailySales && dailySales.length > 0 && dailySales[dailySales.length - 1].percentage_change !== null && (
                  <div className={`text-sm font-medium ${
                    dailySales[dailySales.length - 1].percentage_change! >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dailySales[dailySales.length - 1].percentage_change! >= 0 ? '+' : ''}
                    {dailySales[dailySales.length - 1].percentage_change!.toLocaleString("pt-BR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}%
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
                  Loading sales data...
                </div>
              ) : dailySalesError ? (
                <div className="text-red-500">Error loading sales data</div>
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
              <CardTitle>Ticket Validations</CardTitle>
              <TimeWindowSelector
                options={["15m", "30m", "1h", "2h", "5h"]}
                selected={validationTimeWindow}
                onSelect={setValidationTimeWindow}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    validationDataSets[
                      validationTimeWindow as keyof typeof validationDataSets
                    ]
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
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
                      name,
                    ]}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
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
            <CardTitle>Age Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Age</span>
              <span className="text-sm font-medium">
                {eventStats.age_stats.average_age_all}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg Male Age
              </span>
              <span className="text-sm font-medium">
                {eventStats.age_stats.average_age_male}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg Female Age
              </span>
              <span className="text-sm font-medium">
                {eventStats.age_stats.average_age_female}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Join Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Join Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Badge variant="outline">
                {eventStats.total_pending_invites}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Approved</span>
              <Badge variant="default">
                {eventStats.total_accepted_invites}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rejected</span>
              <Badge variant="destructive">
                {eventStats.total_rejected_invites}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
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
          <CardTitle>Tickets by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header - Visible on all devices */}
            <div className="grid grid-cols-12 gap-2 md:gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <span className="col-span-4 md:col-span-4">Type</span>
              <span className="col-span-2">Lot</span>
              <span className="col-span-3 md:col-span-3">Amount</span>
              <span className="col-span-3">Revenue</span>
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
                    <span className="text-xs md:text-sm">{ticket.amount}</span>
                  </div>

                  {/* Revenue */}
                  <div className="col-span-3 md:col-span-3">
                    <span className="text-xs md:text-sm font-medium">
                      R${" "}
                      {ticket.revenue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
                  of {allTicketTypes.length}
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
                      Previous
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
                      Next
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
            <CardTitle>Ticket Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Paid Tickets</span>
                </div>
                <span className="text-sm font-medium">
                  {eventStats.paid_tickets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Free Tickets</span>
                </div>
                <span className="text-sm font-medium">
                  {eventStats.free_tickets}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Analytics Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Charts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
