import { useMutation } from "@tanstack/react-query"
import { api, normalizeApiError } from "../client"

type ValidateCouponInput = {
  event_id: number
  ticket_pricing_id: number
  coupon: string
}

type ValidateCouponResponse = {
  original_price: number
  final_price: number
  discount_applied: number
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (data: ValidateCouponInput) => {
      try {
        const res = await api.post("/public/coupon/price", data)
        return res.data as ValidateCouponResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}
