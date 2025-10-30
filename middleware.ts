import { next } from "@vercel/functions";

const BACKEND_BASE_URL = "https://api.tikko-backend.com.br";

interface Event {
  id: number;
  name: string;
  description: string;
  is_paid: boolean;
  start_date: string;
  end_date: string;
  address_name: string;
  longitude: number;
  latitude: number;
  address_complement: string;
  is_private: boolean;
  auto_accept: boolean;
  company_id: number;
  ticket_pricing_id: number;
  is_active: boolean;
  image: string;
  location: string;
  created_at: string;
  updated_at: string;
}

function getEventIdFromSlug(slug: string): string | null {
  // Match the last part after the final hyphen as the eventId
  const match = slug.match(/-(\d+)$/);
  if (match) {
    return match[1]; // Return the captured eventId
  }
  return null; // Return null if no valid eventId is found
}


async function getEvent(id: number): Promise<Event | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/public/event/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// Simple HTML escape function to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";
  const isBot =
    userAgent.includes("WhatsApp") || userAgent.includes("facebookexternalhit");
  if (!isBot) {
    return next({
      request: {
        headers: new Headers(request.headers),
      },
    });
  }
  const url = new URL(request.url);
  const pathname = url.pathname;
  // Only handle /event/:slug routes
  const match = pathname.match(/^\/event\/(.+)$/);
  if (!match) {
    return next({
      request: {
        headers: new Headers(request.headers),
      },
    });
  }
  const slug = match[1];
  const eventIdStr = getEventIdFromSlug(slug);
  if (!eventIdStr) {
    return next({
      request: {
        headers: new Headers(request.headers),
      },
    });
  }
  const eventId = Number(eventIdStr);
  if (isNaN(eventId)) {
    return next({
      request: {
        headers: new Headers(request.headers),
      },
    });
  }
  const event = await getEvent(eventId);
  if (!event) {
    return next({
      request: {
        headers: new Headers(request.headers),
      },
    });
  }
  const ogImage = event.image;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(event.name)}</title>
        <meta name="description" content="${escapeHtml(event.description)}" />
        <meta property="og:title" content="${escapeHtml(event.name)}" />
        <meta property="og:description" content="${escapeHtml(event.description)}" />
        <meta property="og:image" content="${escapeHtml(ogImage)}" />
        <meta property="og:url" content="${request.url}" />
        <meta property="og:type" content="event" />
      </head>
      <body></body>
    </html>
  `;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const config = {
  runtime: "nodejs",
  matcher: "/event/:slug*",
};
