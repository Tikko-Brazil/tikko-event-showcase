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

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshResponse {
  token_pair: TokenPair
}

export interface VerifyRequest {
  email: string
  code: string
}

export interface VerifyResponse {
  user: User
  token_pair: TokenPair
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token_pair: TokenPair
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  email: string
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

export function useRefresh() {
  return useMutation({
    mutationFn: async (data: RefreshRequest) => {
      try {
        const res = await api.post("/public/login/refresh", data)
        return res.data as RefreshResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useVerify() {
  return useMutation({
    mutationFn: async (data: VerifyRequest) => {
      try {
        const res = await api.post("/public/verify", data)
        return res.data as VerifyResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      try {
        const res = await api.post("/public/login", data)
        return res.data as LoginResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      try {
        const res = await api.post("/public/forgot-password", data)
        return res.data as ForgotPasswordResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ResetPasswordResponse {
  message: string
  email: string
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      try {
        const res = await api.post("/public/reset-password", data)
        return res.data as ResetPasswordResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}

export interface RegenerateCodeRequest {
  email: string
}

export interface RegenerateCodeResponse {
  message: string
  next_regenerate_in: number
}

export function useRegenerateCode() {
  return useMutation({
    mutationFn: async (data: RegenerateCodeRequest) => {
      try {
        const res = await api.post("/public/regenerate-code", data)
        return res.data as RegenerateCodeResponse
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}
