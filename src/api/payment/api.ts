import { useMutation, useQuery } from "@tanstack/react-query";
import { apiAuth, normalizeApiError } from "../client";

export interface MercadoPagoOAuthResponse {
  auth_url: string;
}

export interface MercadoPagoStatusResponse {
  configured: boolean;
}

export interface MercadoPagoDisconnectResponse {
  message: string;
}

export interface CardTokenInput {
  cardNumber: string;
  cardholderName: string;
  cpf: string;
  securityCode: string;
  expirationMonth: string;
  expirationYear: string;
}

export interface CardTokenResponse {
  id: string;
  public_key: string;
  card_id: string | null;
  status: string;
  date_created: string;
  date_last_updated: string;
  date_due: string;
  luhn_validation: boolean;
  live_mode: boolean;
  require_esc: boolean;
  cardholder: {
    identification: {
      number: string;
      type: string;
    };
    name: string;
  };
  security_code: {
    length: number;
    card_location: string;
  };
  issuer_id?: number;
}

export const useGetMercadoPagoOAuth = (organizationId: number) => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiAuth.get(`/private/organization/${organizationId}/mercado-pago/oauth`);
      return response.data as MercadoPagoOAuthResponse;
    },
  });
};

export const useGetMercadoPagoStatus = (organizationId: number) => {
  return useQuery({
    queryKey: ["mercado-pago-status", organizationId],
    queryFn: async () => {
      const response = await apiAuth.get(`/private/organization/${organizationId}/mercado-pago/status`);
      return response.data as MercadoPagoStatusResponse;
    },
  });
};

export const useDisconnectMercadoPago = (organizationId: number) => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiAuth.delete(`/private/organization/${organizationId}/mercado-pago`);
      return response.data as MercadoPagoDisconnectResponse;
    },
  });
};

const MERCADOPAGO_BASE_URL = "https://api.mercadopago.com";

async function getIssuer(publicKey: string, bin: string): Promise<number> {
  const url = new URL(`${MERCADOPAGO_BASE_URL}/v1/payment_methods/search`);
  url.searchParams.set("public_key", publicKey);
  url.searchParams.set("marketplace", "NONE");
  url.searchParams.set("bins", bin);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw {
      status: response.status,
      code: "ISSUER_FETCH_FAILED",
    };
  }

  const data = await response.json();
  const issuerId = data.results?.[0]?.issuer?.id;
  
  if (!issuerId) {
    throw {
      status: 400,
      code: "ISSUER_NOT_FOUND",
    };
  }
  
  return issuerId;
}

async function getSessionId(publicKey: string, locale: string, jsVersion: string, referer: string): Promise<string> {
  const url = new URL(`${MERCADOPAGO_BASE_URL}/v1/devices/widgets`);
  url.searchParams.set("public_key", publicKey);
  url.searchParams.set("locale", locale);
  url.searchParams.set("js_version", jsVersion);
  url.searchParams.set("referer", referer);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "Referer": referer,
      "User-Agent": "Mozilla/5.0"
    },
    body: JSON.stringify({
      section: "open_platform_V2",
      view: "checkout"
    })
  });

  if (!response.ok) {
    throw {
      status: response.status,
      code: "SESSION_ID_FETCH_FAILED",
    };
  }

  const data = await response.json();
  return data.session_id;
}

async function createCardToken(
  publicKey: string,
  locale: string,
  jsVersion: string,
  referer: string,
  sessionId: string,
  input: CardTokenInput
): Promise<CardTokenResponse> {
  const url = new URL(`${MERCADOPAGO_BASE_URL}/v1/card_tokens`);
  url.searchParams.set("public_key", publicKey);
  url.searchParams.set("locale", locale);
  url.searchParams.set("js_version", jsVersion);
  url.searchParams.set("referer", referer);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      card_number: input.cardNumber,
      cardholder: {
        name: input.cardholderName,
        identification: {
          type: "CPF",
          number: input.cpf
        }
      },
      security_code: input.securityCode,
      expiration_month: input.expirationMonth,
      expiration_year: input.expirationYear,
      device: {
        meli: {
          session_id: sessionId
        }
      }
    })
  });

  if (!response.ok) {
    throw {
      status: response.status,
      code: "CARD_TOKEN_CREATION_FAILED",
    };
  }

  return response.json();
}

export function useCreateCardToken() {
  return useMutation({
    mutationFn: async (input: CardTokenInput) => {
      try {
        const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
        const bin = input.cardNumber.substring(0, 6);
        const locale = import.meta.env.VITE_MERCADOPAGO_LOCALE || "pt-BR";
        const jsVersion = import.meta.env.VITE_MERCADOPAGO_JS_VERSION || "2.0.0";
        const referer = import.meta.env.VITE_MERCADOPAGO_REFERER || window.location.origin;

        const issuerId = await getIssuer(publicKey, bin);
        const sessionId = await getSessionId(publicKey, locale, jsVersion, referer);
        const tokenResponse = await createCardToken(publicKey, locale, jsVersion, referer, sessionId, input);

        return {
          ...tokenResponse,
          issuer_id: issuerId,
        };
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}

