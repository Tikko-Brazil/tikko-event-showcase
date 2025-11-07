import { useParams } from "react-router-dom";
import SendTickets from "@/components/SendTickets";

export const SendTicketsPage = () => {
  const { eventId } = useParams();
  return <SendTickets eventId={parseInt(eventId!)} />;
};
