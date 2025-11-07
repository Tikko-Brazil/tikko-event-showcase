import { useParams } from "react-router-dom";
import { EventTicketTypes } from "@/components/EventTicketTypes";

export const TicketsPage = () => {
  const { eventId } = useParams();
  return <EventTicketTypes eventId={parseInt(eventId!)} />;
};
