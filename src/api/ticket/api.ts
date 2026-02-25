import { useQuery } from "@tanstack/react-query"
import { apiAuth, normalizeApiError } from "../client"

export interface TicketInfo {
  uuid: string
  id: number
  user_id: number
  event_id: number
  ticket_pricing_id: number
  status: string
  qr_code: string
  created_at: string
  updated_at: string
  ticket_type: string
  lot: number
  gender: string
  price: number
  already_validated: boolean
  validation_date?: string
}

export interface TicketEvent {
  name: string
  date: string
  banner_url: string
  start_date: string
  end_date: string
  location: string
}

export interface Ticket {
  ticket: TicketInfo
  event: TicketEvent
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
