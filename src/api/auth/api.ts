import { useMutation } from "@tanstack/react-query"
import { api, normalizeApiError } from "../client"

export interface ExchangeRequest {
  code: string
  redirectUri: string
  codeVerifier: string
  identity_provider: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
  gender: string
  birthday: string
  phone_number: string
  location: string
  bio: string
  instagram_profile: string
  companies_following: number[]
  is_first_access: boolean
  auth_method: string
  is_verified: boolean
}

export interface ExchangeResponse {
  user: User
  token_pair: TokenPair
}

export interface SignupRequest {
  email: string
  username: string
  password: string
  gender: string
  phone_number: string
  location: string
  bio: string
  instagram_profile: string
}

export interface SignupResponse {
  message: string
  email: string
  next_regenerate_in: number
}

export function useExchange() {
  return useMutation({
    mutationFn: async (data: ExchangeRequest) => {
      try {
        const res = await api.post("/public/login/exchange", data)
        return res.data as ExchangeResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      try {
        const res = await api.post("/public/signup", data)
        return res.data as SignupResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}
