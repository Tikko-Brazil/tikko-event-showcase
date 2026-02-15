import { useMutation } from "@tanstack/react-query";
import { apiAuth } from "../client";

export interface MercadoPagoOAuthResponse {
  auth_url: string;
}

export const useGetMercadoPagoOAuth = (organizationId: number) => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiAuth.get(`/private/organization/${organizationId}/mercado-pago/oauth`);
      return response.data as MercadoPagoOAuthResponse;
    },
  });
};
