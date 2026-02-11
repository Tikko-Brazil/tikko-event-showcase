import { useMutation, useQuery } from "@tanstack/react-query"
import { api, apiAuth, normalizeApiError } from "../client"

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

export interface Coupon {
  id: number
  event_id: number
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_usage: number
  current_usage: number
  used_count: number
  is_active: boolean
  active: boolean
  ticket_pricing_ids: number[]
  max_uses: number
  created_at: string
  updated_at: string
}

export interface CreateCouponInput {
  event_id: number
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_usage: number
  is_active: boolean
  ticket_pricing_ids?: number[]
}

export interface UpdateCouponInput {
  code?: string
  discount_type?: "percentage" | "fixed"
  discount_value?: number
  max_uses?: number
  active?: boolean
  ticket_pricing_ids?: number[]
}

export interface ListCouponsParams {
  event_id: number
  page?: number
  limit?: number
  status?: "active" | "inactive" | "all"
  ticket_pricing_id?: number
  search?: string
}

export interface ListCouponsResponse {
  coupons: Coupon[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export function useCreateCoupon() {
  return useMutation({
    mutationFn: async (data: CreateCouponInput) => {
      try {
        const res = await apiAuth.post("/private/coupon", data)
        return res.data as Coupon
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useGetCoupon(id: number) {
  return useQuery({
    queryKey: ["coupon", id],
    queryFn: async () => {
      try {
        const res = await apiAuth.get(`/private/coupon/${id}`)
        return res.data as Coupon
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
    enabled: !!id,
  })
}

export function useUpdateCoupon() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCouponInput }) => {
      try {
        const res = await apiAuth.put(`/private/coupon/${id}`, data)
        return res.data as Coupon
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useDeleteCoupon() {
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const res = await apiAuth.delete(`/private/coupon/${id}`)
        return res.data
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useListCoupons(params: ListCouponsParams) {
  const queryParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 10).toString(),
  })
  
  if (params.status) queryParams.append("status", params.status)
  if (params.ticket_pricing_id) queryParams.append("ticket_pricing_id", params.ticket_pricing_id.toString())
  if (params.search) queryParams.append("search", params.search)

  return useQuery({
    queryKey: ["coupons", params],
    queryFn: async () => {
      try {
        const res = await apiAuth.get(`/private/coupons/event/${params.event_id}?${queryParams}`)
        return res.data as ListCouponsResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
    enabled: !!params.event_id,
  })
}

