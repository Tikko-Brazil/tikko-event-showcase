import { useMutation, useQuery } from "@tanstack/react-query"
import { api, apiAuth, normalizeApiError } from "../client"

export interface UpdateUserRequest {
  username?: string
  gender?: string
  birthday?: string
  phone_number?: string
  identification_document?: string
  location?: string
  bio?: string
  instagram_profile?: string
  companies_following?: string[]
}

export interface UpdateUserResponse {
  id: string
  email: string
  username: string
  gender: string
  birthday: string
  phone_number: string
  location: string
  bio: string
  instagram_profile: string
  companies_following: string[]
  is_first_access: boolean
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      try {
        const res = await apiAuth.put("/private/user", data)
        return res.data as UpdateUserResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

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

export interface DashboardEvent {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  location: string
  address_name: string
  banner_url: string
  is_active: boolean
}

export interface DashboardTopEvent {
  event: DashboardEvent
  ticket_count: number
}

export interface DashboardUser {
  username: string
  email: string
  is_admin: boolean
}

export interface DashboardResponse {
  success: boolean
  data: {
    top_events: DashboardTopEvent[]
    user: DashboardUser
  }
}

export function useGetDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      try {
        const res = await apiAuth.get("/private/dashboard")
        const response = res.data as DashboardResponse
        return response.data
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}
