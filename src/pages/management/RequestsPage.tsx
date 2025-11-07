import { useParams } from "react-router-dom";
import { EventJoinRequests } from "@/components/EventJoinRequests";

export const RequestsPage = () => {
  const { eventId } = useParams();
  return <EventJoinRequests eventId={parseInt(eventId!)} />;
};
