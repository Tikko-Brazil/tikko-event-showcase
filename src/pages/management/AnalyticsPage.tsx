import { useParams } from "react-router-dom";
import { EventAnalytics } from "@/components/EventAnalytics";

export const AnalyticsPage = () => {
  const { eventId } = useParams();
  return <EventAnalytics eventId={parseInt(eventId!)} />;
};
