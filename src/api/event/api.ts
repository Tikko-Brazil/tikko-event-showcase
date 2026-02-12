import { useQuery } from "@tanstack/react-query"
import { api, normalizeApiError } from "../client"

export interface Event {
  id: number
  name: string
  description: string
  is_paid: boolean
  start_date: string
  end_date: string
  address_name: string
  longitude: number
  latitude: number
  address_complement: string
  is_private: boolean
  auto_accept: boolean
  company_id: number
  ticket_pricing_id: number
  is_active: boolean
  image: string
  location: string
  created_at: string
  updated_at: string
  participant_count: number
}

export interface PaginatedEventsResponse {
  events: Event[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface GetEventsParams {
  active?: "true" | "false" | "all"
  search?: string
  order_by_participants?: boolean
  only_ongoing?: boolean
  page: number
  limit: number
}

export function useGetEvents(params: GetEventsParams) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams({
          page: params.page.toString(),
          limit: params.limit.toString(),
        })

        if (params.active) {
          searchParams.append("active", params.active)
        }
        if (params.search) {
          searchParams.append("search", params.search)
        }
        if (params.order_by_participants !== undefined) {
          searchParams.append("order_by_participants", params.order_by_participants.toString())
        }
        if (params.only_ongoing !== undefined) {
          searchParams.append("only_ongoing", params.only_ongoing.toString())
        }

        const res = await api.get(`/public/event?${searchParams}`)
        return res.data as PaginatedEventsResponse
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
