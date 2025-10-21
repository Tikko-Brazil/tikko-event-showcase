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

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";
  const isBot =
    userAgent.includes("WhatsApp") || userAgent.includes("facebookexternalhit");

  if (!isBot) {
    return new Response(null, { status: 200 }); // Continue without modification
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only handle /event/:eventId routes
  const match = pathname.match(/^\/event\/(\d+)$/);
  if (!match) {
    return new Response(null, { status: 200 }); // Continue without modification
  }

  const eventId = Number(match[1]);
  if (isNaN(eventId)) {
    return new Response(null, { status: 200 }); // Continue without modification
  }

  const event = await getEvent(eventId);
  if (!event) {
    return new Response(null, { status: 200 }); // Continue without modification
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${event.name}</title>
        <meta name="description" content="${event.description}" />
        <meta property="og:title" content="${event.name}" />
        <meta property="og:description" content="${event.description}" />
        <meta property="og:image" content="${event.image}" />
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
  matcher: "/event/:eventId",
};
