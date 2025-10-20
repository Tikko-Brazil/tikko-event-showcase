import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Heart, MessageCircle, Share2, Clock, MapPin } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const Explore = () => {
  const mockEvents = [
    {
      id: 1,
      title: "Summer Music Festival 2024",
      date: "Jun 15, 2024",
      time: "6:00 PM",
      location: "Central Park, NY",
      price: "$45",
      image: "/placeholder.svg",
      attendees: 234,
      liked: false,
    },
    {
      id: 2,
      title: "Tech Conference 2024",
      date: "Jun 20, 2024",
      time: "9:00 AM",
      location: "Convention Center, SF",
      price: "$125",
      image: "/placeholder.svg",
      attendees: 567,
      liked: true,
    },
    {
      id: 3,
      title: "Art Gallery Opening",
      date: "Jun 25, 2024",
      time: "7:00 PM",
      location: "Downtown Gallery, LA",
      price: "Free",
      image: "/placeholder.svg",
      attendees: 89,
      liked: false,
    },
  ];

  const renderEventCard = (event: (typeof mockEvents)[0]) => (
    <Card
      key={event.id}
      className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm"
    >
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <Badge variant="secondary" className="mb-2">
            {event.price}
          </Badge>
          <h3 className="font-semibold text-lg">{event.title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Clock className="h-4 w-4" />
          <span>
            {event.date} • {event.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8">
              <Heart
                className={`h-4 w-4 mr-1 ${
                  event.liked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              {event.attendees}
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <MessageCircle className="h-4 w-4 mr-1" />
              12
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm">Buy Tickets</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Discover Events</h2>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map(renderEventCard)}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Explore;
