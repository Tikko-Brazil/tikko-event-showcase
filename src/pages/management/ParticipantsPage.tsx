import { useParams } from "react-router-dom";
import { EventParticipants } from "@/components/EventParticipants";

export const ParticipantsPage = () => {
  const { eventId } = useParams();
  return <EventParticipants eventId={parseInt(eventId!)} />;
};
