import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { Share2, MapPin, Briefcase, Calendar, Link as LinkIcon, Mail, Users, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import profileBanner from "@/assets/profile-banner.jpg";
import profileAvatar from "@/assets/profile-avatar.jpg";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("timeline");

  // Fake user data
  const user = {
    name: "Rachel Rose",
    username: "@rachelrose",
    bio: "Creative designer & digital artist 🎨 | Coffee enthusiast ☕ | Always learning something new 📚",
    location: "San Francisco, CA",
    occupation: "Senior Product Designer at TechCorp",
    joinedDate: "January 2022",
    website: "rachelrose.design",
    email: "rachel@example.com",
    stats: {
      posts: 127,
      followers: 1842,
      following: 392
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user.name}'s Profile`,
          text: `Check out ${user.name}'s profile!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Mock friends data
  const friends = [
    { id: 1, name: "John Doe", avatar: "/placeholder.svg", mutualFriends: 15 },
    { id: 2, name: "Sarah Smith", avatar: "/placeholder.svg", mutualFriends: 23 },
    { id: 3, name: "Mike Johnson", avatar: "/placeholder.svg", mutualFriends: 8 },
    { id: 4, name: "Emma Wilson", avatar: "/placeholder.svg", mutualFriends: 12 },
    { id: 5, name: "David Brown", avatar: "/placeholder.svg", mutualFriends: 19 },
    { id: 6, name: "Lisa Anderson", avatar: "/placeholder.svg", mutualFriends: 7 }
  ];

  // Mock photos
  const photos = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: "/placeholder.svg"
  }));

  // Mock timeline posts
  const posts = [
    {
      id: 1,
      content: "Just finished an amazing design project! Can't wait to share the results with everyone. 🎨✨",
      timestamp: "2 hours ago",
      likes: 42,
      comments: 8
    },
    {
      id: 2,
      content: "Coffee and creativity go hand in hand. What's your favorite creative fuel? ☕",
      timestamp: "1 day ago",
      likes: 89,
      comments: 15
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-6">
        {/* Banner Section */}
        <div className="relative w-full h-48 md:h-80 rounded-lg overflow-hidden mb-4">
          <img
            src={profileBanner}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
          
          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-12 md:translate-y-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              {/* Profile Picture */}
              <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-background">
                <AvatarImage src={profileAvatar} alt={user.name} />
                <AvatarFallback className="text-2xl">RR</AvatarFallback>
              </Avatar>
              
              {/* Name and Username */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{user.name}</h1>
                <p className="text-sm md:text-base text-muted-foreground">{user.username}</p>
              </div>
              
              {/* Share Button */}
              <Button 
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Bio and Stats */}
        <Card className="mb-4 mt-12 md:mt-16">
          <CardContent className="pt-6">
            <p className="text-foreground mb-4">{user.bio}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {user.occupation}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {user.joinedDate}
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold text-foreground">{user.stats.posts}</span>
                <span className="text-muted-foreground ml-1">Posts</span>
              </div>
              <div>
                <span className="font-bold text-foreground">{user.stats.followers}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-foreground">{user.stats.following}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={profileAvatar} alt={user.name} />
                      <AvatarFallback>RR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-foreground mb-4">{post.content}</p>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work
                  </h3>
                  <p className="text-muted-foreground">{user.occupation}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h3>
                  <p className="text-muted-foreground">{user.location}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Website
                  </h3>
                  <a href={`https://${user.website}`} className="text-primary hover:underline">
                    {user.website}
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </h3>
                  <p className="text-muted-foreground">{user.joinedDate}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Friends ({friends.length})
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{friend.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {friend.mutualFriends} mutual friends
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Photos ({photos.length})
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div 
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
