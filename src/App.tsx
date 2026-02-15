import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import FirstAccessGuard from "./components/FirstAccessGuard";
import EnhancedIndex from "./pages/EnhancedIndex";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import MyEvents from "./pages/MyEvents";
import MyTickets from "./pages/MyTickets";
import Organizations from "./pages/Organizations";
import OrganizationCreation from "./pages/OrganizationCreation";
import OrganizationManagement from "./pages/OrganizationManagement";
import OrganizationManagementLayout from "./components/OrganizationManagementLayout";
import OrganizationManagementRedirect from "./components/OrganizationManagementRedirect";
import OrganizationEditPage from "./pages/organization-management/EditPage";
import PaymentPage from "./pages/organization-management/PaymentPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import EditProfile from "./pages/EditProfile";
import Language from "./pages/Language";
import EventManagement from "./pages/EventManagement";
import { EventManagementLayout } from "./components/EventManagementLayout";
import { EventManagementRedirect } from "./components/EventManagementRedirect";
import { OverviewPage } from "./pages/management/OverviewPage";
import { EditPage } from "./pages/management/EditPage";
import { AnalyticsPage } from "./pages/management/AnalyticsPage";
import { ParticipantsPage } from "./pages/management/ParticipantsPage";
import { TicketsPage } from "./pages/management/TicketsPage";
import { CouponsPage } from "./pages/management/CouponsPage";
import { StaffPage } from "./pages/management/StaffPage";
import { SendTicketsPage } from "./pages/management/SendTicketsPage";
import { RequestsPage } from "./pages/management/RequestsPage";
import { ValidatePage } from "./pages/management/ValidatePage";
import EventDetails from "./pages/EventDetails";
import EventCreation from "./pages/EventCreation";
import NotFound from "./pages/NotFound";
import ProfileCompletion from "./components/auth/ProfileCompletion";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Events from "./pages/Events";
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react'

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_API_KEY, {
  api_host: "https://us.i.posthog.com",
  defaults: '2025-05-24',
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PostHogProvider client={posthog}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FirstAccessGuard>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <EnhancedIndex />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Auth />
                  </PublicRoute>
                }
              />
              <Route path="/profile-completion" element={<ProfileCompletion />} />
              <Route
                path="/dashboard"
                element={<Navigate to="/explore" replace />}
              />
              <Route
                path="/feed"
                element={
                  <PrivateRoute>
                    <Feed />
                  </PrivateRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <PrivateRoute>
                    <Explore />
                  </PrivateRoute>
                }
              />
              <Route path="/events" element={<Events />} />
              <Route
                path="/my-events"
                element={
                  <PrivateRoute>
                    <MyEvents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <PrivateRoute>
                    <MyTickets />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizations"
                element={
                  <PrivateRoute>
                    <Organizations />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <PrivateRoute>
                    <EditProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/language"
                element={
                  <PrivateRoute>
                    <Language />
                  </PrivateRoute>
                }
              />
              {/* Event management routes */}
              <Route
                path="/event-management/:eventId"
                element={
                  <PrivateRoute>
                    <EventManagementLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<EventManagementRedirect />} />
                <Route path="overview" element={<OverviewPage />} />
                <Route path="edit" element={<EditPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="participants" element={<ParticipantsPage />} />
                <Route path="tickets" element={<TicketsPage />} />
                <Route path="coupons" element={<CouponsPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="send-tickets" element={<SendTicketsPage />} />
                <Route path="requests" element={<RequestsPage />} />
                <Route path="validate" element={<ValidatePage />} />
              </Route>
              <Route
                path="/create-event"
                element={
                  <PrivateRoute>
                    <EventCreation />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-organization"
                element={
                  <PrivateRoute>
                    <OrganizationCreation />
                  </PrivateRoute>
                }
              />
              {/* Organization management routes */}
              <Route
                path="/organization-management/:organizationId"
                element={
                  <PrivateRoute>
                    <OrganizationManagementLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<OrganizationManagementRedirect />} />
                <Route path="edit" element={<OrganizationEditPage />} />
                <Route path="members" element={<div className="text-center py-12"><p className="text-muted-foreground">Coming soon</p></div>} />
                <Route path="events" element={<div className="text-center py-12"><p className="text-muted-foreground">Coming soon</p></div>} />
                <Route path="payment" element={<PaymentPage />} />
                <Route path="meta-pixel" element={<div className="text-center py-12"><p className="text-muted-foreground">Coming soon</p></div>} />
              </Route>
              <Route path="/event/:slug" element={<EventDetails />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FirstAccessGuard>
        </BrowserRouter>
      </TooltipProvider>
    </PostHogProvider>
  </QueryClientProvider>
);

export default App;
