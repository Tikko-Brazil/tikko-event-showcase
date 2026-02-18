import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { EventCoupons } from "@/components/EventCoupons";
import { EventGateway } from "@/lib/EventGateway";
import generateSlug from "@/helpers/generateSlug";

const eventGateway = new EventGateway(import.meta.env.VITE_API_BASE_URL);

export const CouponsPage = () => {
  const { eventId } = useParams();

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventGateway.getEvent(parseInt(eventId!)),
    enabled: !!eventId,
  });

  const eventSlug = eventData ? generateSlug(eventData.name, eventData.id) : undefined;

  return <EventCoupons eventId={parseInt(eventId!)} eventSlug={eventSlug} />;
};
