import { useMutation, useQuery } from "@tanstack/react-query"
import { apiAuth, normalizeApiError } from "../client"

export interface CreateOrganizationInput {
  name: string
  latitude: number
  longitude: number
  address_name: string
  address_complement?: string
  logo?: string
}

export interface UpdateOrganizationInput {
  name?: string
  latitude?: number
  longitude?: number
  address_name?: string
  address_complement?: string
  logo?: string
}

export interface Organization {
  id: number
  name: string
  latitude: number
  longitude: number
  address_name: string
  address_complement: string
  logo: string
  created_at: string
  updated_at: string
  created_by: number
  is_active: boolean
  organization_role: number
}

export interface GetOrganizationsResponse {
  organizations: Organization[]
  total: number
  page: number
  limit: number
  total_pages: number
  is_admin: boolean
}

export interface GetOrganizationsParams {
  page?: number
  limit?: number
}

export interface LogoUploadUrlResponse {
  upload_url: string
  key: string
}

export interface GetLogoUploadUrlParams {
  filename: string
  content_type?: string
}

export function useCreateOrganization() {
  return useMutation({
    mutationFn: async (data: CreateOrganizationInput) => {
      try {
        const res = await apiAuth.post("/private/organization", data)
        return res.data.data as Organization
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useGetLogoUploadUrl(params: GetLogoUploadUrlParams) {
  return useQuery({
    queryKey: ["logo-upload-url", params.filename],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams({
          filename: params.filename,
        })
        if (params.content_type) {
          searchParams.append("content_type", params.content_type)
        }
        const res = await apiAuth.get(`/private/organization/logo-upload-url?${searchParams}`)
        return res.data as LogoUploadUrlResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
    enabled: !!params.filename,
  })
}

export function useGetOrganizations(params?: GetOrganizationsParams) {
  const page = params?.page || 1
  const limit = params?.limit || 10

  return useQuery({
    queryKey: ["organizations", page, limit],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        const res = await apiAuth.get(`/private/organizations?${searchParams}`)
        return res.data as GetOrganizationsResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useGetOrganization(id: number) {
  return useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      try {
        const res = await apiAuth.get(`/private/organization/${id}`)
        return res.data as Organization
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
    enabled: !!id,
  })
}

export function useUpdateOrganization(id: number) {
  return useMutation({
    mutationFn: async (data: UpdateOrganizationInput) => {
      try {
        const res = await apiAuth.put(`/private/organization/${id}`, data)
        return res.data as Organization
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}
