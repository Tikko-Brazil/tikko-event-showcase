import { Navigate, useParams } from "react-router-dom";

export const EventManagementRedirect = () => {
  const { eventId } = useParams();
  
  // Always redirect to overview - mobile layout will handle showing menu instead
  return <Navigate to={`/event-management/${eventId}/overview`} replace />;
};
