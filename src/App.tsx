import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import FirstAccessGuard from "./components/FirstAccessGuard";
import EnhancedIndex from "./pages/EnhancedIndex";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EventManagement from "./pages/EventManagement";
import EventDetails from "./pages/EventDetails";
import EventCreation from "./pages/EventCreation";
import NotFound from "./pages/NotFound";
import ProfileCompletion from "./components/auth/ProfileCompletion";
import TicketDetails from "./pages/TicketDetails";
import TicketQRCode from "./pages/TicketQRCode";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/event-management/:eventId"
              element={
                <PrivateRoute>
                  <EventManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <PrivateRoute>
                  <EventCreation />
                </PrivateRoute>
              }
            />
            <Route path="/event/:eventId" element={<EventDetails />} />
            <Route
              path="/ticket/:ticketId"
              element={
                <PrivateRoute>
                  <TicketDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/ticket/:ticketId/qr"
              element={
                <PrivateRoute>
                  <TicketQRCode />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FirstAccessGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
