import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - React Router App" },
    { name: "description", content: "About page" },
  ];
}

export default function About() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p>This is the about page.</p>
    </div>
  );
}
