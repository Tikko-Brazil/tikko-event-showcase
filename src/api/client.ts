import { AppError } from "./errors"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export function normalizeApiError(error: unknown): AppError {
  if (error && typeof error === "object" && "status" in error && "code" in error) {
    return error as AppError
  }

  if (error instanceof Error) {
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return { status: 0, code: "NETWORK_ERROR" }
    }
  }

  return { status: 500, code: "UNKNOWN_ERROR" }
}

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) throw new Error("No refresh token")

      const response = await fetch(`${API_BASE_URL}/public/login/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) throw new Error("Token refresh failed")

      const data = await response.json()
      localStorage.setItem("accessToken", data.token_pair.access_token)
      localStorage.setItem("refreshToken", data.token_pair.refresh_token)
    } catch {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/auth"
      throw new Error("Token refresh failed")
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw {
      status: response.status,
      code: data.error?.code || data.code || "UNKNOWN_ERROR",
      details: data.error?.details || data.details,
    } as AppError
  }
  return response.json()
}

export const api = {
  async get(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`)
    return { data: await handleResponse(response) }
  },

  async post(path: string, body: unknown) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return { data: await handleResponse(response) }
  },

  async put(path: string, body: unknown) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return { data: await handleResponse(response) }
  },

  async delete(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
    })
    return { data: await handleResponse(response) }
  },
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("accessToken")
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  let response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    await refreshAccessToken()
    const newToken = localStorage.getItem("accessToken")
    response = await fetch(url, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    })
  }

  return response
}

export const apiAuth = {
  async get(path: string) {
    const response = await fetchWithAuth(`${API_BASE_URL}${path}`)
    return { data: await handleResponse(response) }
  },

  async post(path: string, body: unknown) {
    const response = await fetchWithAuth(`${API_BASE_URL}${path}`, {
      method: "POST",
      body: JSON.stringify(body),
    })
    return { data: await handleResponse(response) }
  },

  async put(path: string, body: unknown) {
    const response = await fetchWithAuth(`${API_BASE_URL}${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
    return { data: await handleResponse(response) }
  },

  async delete(path: string) {
    const response = await fetchWithAuth(`${API_BASE_URL}${path}`, {
      method: "DELETE",
    })
    return { data: await handleResponse(response) }
  },
}
