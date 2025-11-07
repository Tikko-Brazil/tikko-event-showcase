import { useParams } from "react-router-dom";
import { EventCoupons } from "@/components/EventCoupons";

export const CouponsPage = () => {
  const { eventId } = useParams();
  return <EventCoupons eventId={parseInt(eventId!)} />;
};
