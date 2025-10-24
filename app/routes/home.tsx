import type { Route } from "./+types/home";
import EnhancedIndex from "../../src/pages/EnhancedIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tikko - Event Showcase" },
    {
      name: "description",
      content:
        "Discover amazing events and create unforgettable memories with Tikko!",
    },
  ];
}

export default function Home() {
  return <EnhancedIndex />;
}
