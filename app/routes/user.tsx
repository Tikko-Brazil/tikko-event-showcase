import type { Route } from "./+types/user";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `User ${params.userId} - React Router App` },
    { name: "description", content: `User profile for ${params.userId}` },
  ];
}

export default function User({ params }: Route.ComponentProps) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <p>User ID: {params.userId}</p>
    </div>
  );
}
