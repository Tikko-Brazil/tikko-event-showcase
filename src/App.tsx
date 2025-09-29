import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import EnhancedIndex from "./pages/EnhancedIndex";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EventManagement from "./pages/EventManagement";
import EventDetails from "./pages/EventDetails";
import NotFound from "./pages/NotFound";
import ProfileCompletion from "./components/auth/ProfileCompletion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />
          <Route
            path="/profile-completion"
            element={<ProfileCompletion />}
          />
          <Route
            path="/dashboard"
            element={
              // <PrivateRoute>
              <Dashboard />
              // </PrivateRoute>
            }
          />
          <Route
            path="/event-management/:eventId"
            element={
              // <PrivateRoute>
              <EventManagement />
              // </PrivateRoute>
            }
          />
          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
