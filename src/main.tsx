import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { initMercadoPago } from "@mercadopago/sdk-react";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { queryClient } from "./queryClient";

// Initialize MercadoPago
initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY, {
  locale: "pt-BR",
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
