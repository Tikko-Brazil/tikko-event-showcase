import { useParams } from "react-router-dom";
import { EventOverview } from "@/components/EventOverview";

export const OverviewPage = () => {
  const { eventId } = useParams();
  return <EventOverview eventId={parseInt(eventId!)} />;
};
