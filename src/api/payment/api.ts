import { useMutation, useQuery } from "@tanstack/react-query";
import { apiAuth } from "../client";

export interface MercadoPagoOAuthResponse {
  auth_url: string;
}

export interface MercadoPagoStatusResponse {
  configured: boolean;
}

export interface MercadoPagoDisconnectResponse {
  message: string;
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

