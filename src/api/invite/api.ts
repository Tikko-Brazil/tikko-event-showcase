import { useMutation } from "@tanstack/react-query";
import { apiAuth, normalizeApiError } from "@/api/client";

export interface SendCourtesyTicketInput {
  event_id: number;
  email: string;
  name: string;
  phone_number: string;
  ticket_pricing_id: number;
  ignore_double_ticket?: boolean;
}

export function useSendCourtesyTicket() {
  return useMutation({
    mutationFn: async (data: SendCourtesyTicketInput) => {
      try {
        const res = await apiAuth.post("/private/invite/request-user", data);
        return res.data;
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}
