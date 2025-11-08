import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { EventEditForm } from "@/components/EventEditForm";
import { EventGateway } from "@/lib/EventGateway";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);

export const EditPage = () => {
  const { eventId } = useParams();

  const { data: eventData } = useQuery({
    queryKey: ["event-with-pricing", eventId],
    queryFn: () => eventGateway.getEventWithTicketPricing(Number(eventId)),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (!eventData) return <div>Loading...</div>;

  return <EventEditForm event={eventData.event} />;
};
