export default function middleware(request: Request) {
  //   const url = new URL(request.url);

  //   // Redirect old paths
  //   if (url.pathname === "/old-page") {
  //     return new Response(null, {
  //       status: 302,
  //       headers: { Location: "/new-page" },
  //     });
  //   }

  //   // Continue to next handler
  //   return new Response("Hello from your Middleware!");
  console.log("Middleware running...");
}
