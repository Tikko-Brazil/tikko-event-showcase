import type { Route } from "./+types/event";
import EventDetails from "../../src/pages/EventDetails";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Event Details - Tikko` },
    { name: "description", content: "View event details and purchase tickets" },
  ];
}

export default function Event() {
  return <EventDetails />;
}
