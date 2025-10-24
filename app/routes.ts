import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/about", "routes/about.tsx"),
  route("/user/:userId", "routes/user.tsx"),
  route("/event/:eventId", "routes/event.tsx"),
] satisfies RouteConfig;
