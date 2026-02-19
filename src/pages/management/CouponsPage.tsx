import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { EventCoupons } from "@/components/EventCoupons";
import { EventGateway } from "@/lib/EventGateway";
import generateSlug from "@/helpers/generateSlug";

const eventGateway = new EventGateway(import.meta.env.VITE_API_BASE_URL);

export const CouponsPage = () => {
  const { eventId } = useParams();

  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventGateway.getEvent(parseInt(eventId!)),
    enabled: !!eventId,
  });

  if (isLoading || !eventData) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center p-8">Error loading event</div>;
  }

  const eventSlug = generateSlug(eventData.name, eventData.id);

  return <EventCoupons eventId={parseInt(eventId!)} eventSlug={eventSlug} />;
};
