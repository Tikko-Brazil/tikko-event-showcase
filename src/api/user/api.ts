import { useMutation } from "@tanstack/react-query"
import { api, normalizeApiError } from "../client"

type RegisterAndJoinEventInput = {
  user: {
    email: string
    username: string
    gender: string
    birthday: string
    phone_number: string
    location: string
    bio: string
    instagram_profile: string
    identification_number: string
  }
  event_id: number
  ticket_pricing_id: number
  coupon?: string
  payment: {
    transaction_amount: number
    token: string
    description: string
    installments: number
    payment_method_id: string
    issuer_id: number
    capture: boolean
    external_reference: string
    callback_url: string
    payer: {
      email: string
      first_name: string
      last_name: string
      identification: {
        type: string
        number: string
      }
    }
  }
}

export function useRegisterAndJoinEvent() {
  return useMutation({
    mutationFn: async (data: RegisterAndJoinEventInput) => {
      try {
        const res = await api.post("/public/user/register-and-join-event", data)
        return res.data
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}
