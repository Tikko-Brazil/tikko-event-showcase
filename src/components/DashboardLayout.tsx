import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ChevronDown,
} from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import SearchModal from "@/components/SearchModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { UserGateway } from "@/lib/UserGateway";
import generateSlug from "@/helpers/generateSlug";
import logoLight from "@/assets/logoLight.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = () => {
    // Remove tokens from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect to login page
    navigate("/login");
  };

  const userGateway = new UserGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => userGateway.getDashboard(),
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    gcTime: 24 * 60 * 60 * 1000, // 1 day
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    // { id: "feed", label: t("dashboard.tabs.feed"), icon: Activity, path: "/feed" },
    { id: "explore", label: t("dashboard.tabs.explore"), icon: Home, path: "/explore" },
    { id: "my-events", label: t("dashboard.tabs.myEvents"), icon: Calendar, path: "/my-events" },
    { id: "my-tickets", label: t("dashboard.tabs.myTickets"), icon: Ticket, path: "/my-tickets" },
    // { id: "profile", label: t("dashboard.tabs.profile"), icon: User, path: "/profile" },
  ];

  const currentPath = location.pathname;

  // Prepare events for SearchModal
  const searchModalEvents = dashboardData?.top_events?.slice(0, 3).map((topEvent) => ({
    id: topEvent.event.id,
    name: topEvent.event.name,
    address_name: topEvent.event.address_name,
    time: topEvent.event.start_date,
  })) || [];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <img src={logoLight} alt="Tikko" className="h-8" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full gap-1 pr-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {dashboardData?.user ? getInitials(dashboardData.user.username) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-base">
                          {dashboardData?.user ? getInitials(dashboardData.user.username) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-none truncate">
                          {dashboardData?.user?.username || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {dashboardData?.user?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate("/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t("dashboard.menu.viewProfile")}
                    </Button>
                  </div>

                  <div className="p-2">
                    <DropdownMenuItem
                      onClick={() => navigate("/settings")}
                      className="cursor-pointer rounded-md px-3 py-2"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      <span>{t("dashboard.menu.settings")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2">
                      <HelpCircle className="mr-3 h-4 w-4" />
                      <span>{t("dashboard.menu.help")}</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md px-3 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setShowSignOutDialog(true)}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>{t("dashboard.menu.signOut")}</span>
                    </DropdownMenuItem>
                  </div>
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
                  className={`flex flex-col gap-1 h-auto py-2 px-3 ${isActive ? "text-primary" : "text-muted-foreground"
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

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          initialEvents={searchModalEvents}
        />

        {/* Sign Out Confirmation Dialog */}
        <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dashboard.signOutDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("dashboard.signOutDialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("dashboard.signOutDialog.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignOut}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("dashboard.signOutDialog.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          </div>

          {/* Centered Search Bar */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 w-96 rounded-md border border-input bg-background hover:bg-accent transition-colors text-left"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("dashboard.search.placeholder") || "Search events..."}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full gap-1 pr-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {dashboardData?.user ? getInitials(dashboardData.user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground text-base">
                        {dashboardData?.user ? getInitials(dashboardData.user.username) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-none truncate">
                        {dashboardData?.user?.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {dashboardData?.user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t("dashboard.menu.viewProfile")}
                  </Button>
                </div>

                <div className="p-2">
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer rounded-md px-3 py-2"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>{t("dashboard.menu.settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2">
                    <HelpCircle className="mr-3 h-4 w-4" />
                    <span>{t("dashboard.menu.help")}</span>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                  <DropdownMenuItem
                    className="cursor-pointer rounded-md px-3 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => setShowSignOutDialog(true)}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{t("dashboard.menu.signOut")}</span>
                  </DropdownMenuItem>
                </div>
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

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          initialEvents={searchModalEvents}
        />

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
                {dashboardData?.top_events?.slice(0, 3).map((topEvent, i) => (
                  <Link
                    key={topEvent.event.id}
                    to={`/event/${generateSlug(topEvent.event.name, topEvent.event.id)}`}
                    className="flex items-center gap-3 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{topEvent.event.name}</span>
                  </Link>
                )) || ["Music Festival", "Tech Conference", "Art Exhibition"].map(
                  (event, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{event}</span>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {false && (<Card>
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
            </Card>)}
          </div>
        </aside>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.signOutDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.signOutDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dashboard.signOutDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("dashboard.signOutDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardLayout;
