import { useParams } from "react-router-dom";
import { EventStaff } from "@/components/EventStaff";

export const StaffPage = () => {
  const { eventId } = useParams();
  return <EventStaff eventId={parseInt(eventId!)} />;
};
