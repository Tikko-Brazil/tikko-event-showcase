import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Heart, MessageCircle, Share2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const Feed = () => {
  const mockFeedPosts = [
    {
      id: 1,
      type: "attendance",
      user: { name: "Sarah Johnson", avatar: "/placeholder.svg" },
      content: "Just got tickets for the Summer Music Festival! 🎵",
      event: "Summer Music Festival 2024",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 5,
    },
    {
      id: 2,
      type: "news",
      title: "New Venue Opening in Downtown",
      content:
        "The Grand Theater announces its opening with a spectacular lineup of events this fall.",
      timestamp: "4 hours ago",
      likes: 89,
      comments: 12,
    },
    {
      id: 3,
      type: "post",
      user: { name: "Mike Chen", avatar: "/placeholder.svg" },
      content:
        "Amazing performance at the Jazz Club last night! The energy was incredible. Already looking forward to next week's show.",
      timestamp: "1 day ago",
      likes: 45,
      comments: 8,
    },
    {
      id: 4,
      type: "attendance",
      user: { name: "Emily Davis", avatar: "/placeholder.svg" },
      content: "Who else is going to the Tech Conference next week?",
      event: "Tech Conference 2024",
      timestamp: "1 day ago",
      likes: 15,
      comments: 3,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Feed</h2>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        <div className="space-y-4">
          {mockFeedPosts.map((post) => (
            <Card
              key={post.id}
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                {post.type === "attendance" && (
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.user?.avatar} />
                      <AvatarFallback>{post.user?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{post.user?.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {post.event}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.timestamp}</span>
                        <Button variant="ghost" size="sm" className="h-8 p-0">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 p-0">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 p-0">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {post.type === "news" && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">News</Badge>
                      <span className="text-sm text-muted-foreground">
                        {post.timestamp}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2">{post.title}</h4>
                    <p className="text-muted-foreground mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-8 p-0">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 p-0">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {post.type === "post" && (
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.user?.avatar} />
                      <AvatarFallback>{post.user?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{post.user?.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {post.timestamp}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="h-8 p-0">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 p-0">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 p-0">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Feed;
