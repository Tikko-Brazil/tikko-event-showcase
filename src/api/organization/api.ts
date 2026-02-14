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
