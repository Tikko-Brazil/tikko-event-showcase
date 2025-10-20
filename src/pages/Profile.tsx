import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/DashboardLayout";

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">John Doe</h2>
            <p className="text-muted-foreground">Event enthusiast</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span>
                <strong>12</strong> Events
              </span>
              <span>
                <strong>48</strong> Tickets
              </span>
              <span>
                <strong>156</strong> Following
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Events Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tickets Bought</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,240</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
