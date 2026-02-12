import { useQuery } from "@tanstack/react-query"
import { apiAuth, normalizeApiError } from "../client"

export interface Ticket {
  id: number
  user_id: number
  event_id: number
  ticket_pricing_id: number
  status: string
  qr_code: string
  created_at: string
  updated_at: string
  event_name: string
  event_banner_url: string
  event_start_date: string
  event_end_date: string
  event_location: string
  ticket_type: string
  lot: number
  gender: string
  price: number
}

export interface UserTicketsResponse {
  tickets: Ticket[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export function useGetUserTickets(page: number, limit: number) {
  return useQuery({
    queryKey: ["userTickets", page, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        const res = await apiAuth.get(`/private/tickets/user?${params}`)
        return res.data as UserTicketsResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}
