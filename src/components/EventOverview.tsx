import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Ticket, TrendingUp, Edit, Gift, CheckCircle2 } from "lucide-react";

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

export const EventOverview = ({ eventData }: EventOverviewProps) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Attendees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventData.attendees}</div>
          <p className="text-xs text-muted-foreground">
            {eventData.capacity - eventData.attendees} spots remaining
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${eventData.revenue}</div>
          <p className="text-xs text-muted-foreground">+12% from last week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Tickets Sold
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventData.ticketsSold}</div>
          <p className="text-xs text-muted-foreground">
            {eventData.ticketsAvailable} available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Conversion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78%</div>
          <p className="text-xs text-muted-foreground">+5% increase</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              action: "Ticket purchased",
              user: "Sarah Johnson",
              time: "2 minutes ago",
            },
            {
              action: "Event shared",
              user: "Mike Chen",
              time: "15 minutes ago",
            },
            {
              action: "Ticket purchased",
              user: "Emily Davis",
              time: "1 hour ago",
            },
            {
              action: "Join request",
              user: "Alex Rodriguez",
              time: "2 hours ago",
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
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Event Details
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            View Participant List
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Gift className="h-4 w-4 mr-2" />
            Create Discount Code
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Validate Tickets
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);
