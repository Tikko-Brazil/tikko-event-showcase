import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Search,
  Calendar,
  Ticket,
  User,
  Bell,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import logoLight from "@/assets/logoLight.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "feed", label: t("dashboard.tabs.feed"), icon: Activity, path: "/feed" },
    { id: "explore", label: t("dashboard.tabs.explore"), icon: Home, path: "/explore" },
    { id: "my-events", label: t("dashboard.tabs.myEvents"), icon: Calendar, path: "/my-events" },
    { id: "my-tickets", label: t("dashboard.tabs.myTickets"), icon: Ticket, path: "/my-tickets" },
    { id: "profile", label: t("dashboard.tabs.profile"), icon: User, path: "/profile" },
  ];

  const currentPath = location.pathname;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <img src={logoLight} alt="Tikko" className="h-8" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>
              <LanguageSelector />
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        john.doe@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("dashboard.menu.viewProfile")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("dashboard.menu.settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>{t("dashboard.menu.help")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("dashboard.menu.signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="pb-20 px-4 py-6">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPath === tab.path;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`flex flex-col gap-1 h-auto py-2 px-3 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => navigate(tab.path)}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "fill-primary/10" : ""}`}
                  />
                  <span className="text-xs">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <img src={logoLight} alt="Tikko" className="h-8" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("dashboard.search.placeholder")}
                className="pl-10 w-80"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john.doe@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("dashboard.menu.viewProfile")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("dashboard.menu.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>{t("dashboard.menu.help")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("dashboard.menu.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r bg-card/50 backdrop-blur-sm">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPath === tab.path;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(tab.path)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Desktop Main Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>

        {/* Desktop Right Sidebar */}
        <aside className="w-80 border-l bg-card/50 backdrop-blur-sm p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("dashboard.trending.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Music Festival", "Tech Conference", "Art Exhibition"].map(
                  (event, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{event}</span>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("dashboard.suggestions.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Event Organizer Pro", type: "Organization" },
                  { name: "Music Venue NYC", type: "Venue" },
                  { name: "Tech Meetup Group", type: "Community" },
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{suggestion.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.type}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;
