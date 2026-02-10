import { QueryClient } from "@tanstack/react-query"
import { normalizeApiError } from "./api/client"
import { toast } from "./hooks/use-toast"
import i18n from "./i18n"

function handleGlobalError(error: unknown) {
  const appError = normalizeApiError(error)

  if (appError.status === 401) {
    localStorage.removeItem("authToken")
    window.location.href = "/auth"
    toast({ variant: "destructive", description: i18n.t("errors.http.401") })
    return
  }

  if (appError.status === 403) {
    toast({ variant: "destructive", description: i18n.t("errors.http.403") })
    return
  }

  if (appError.code === "NETWORK_ERROR") {
    toast({ variant: "destructive", description: i18n.t("errors.generic.NETWORK_ERROR") })
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const { status } = normalizeApiError(error)
        return status >= 500 && failureCount < 2
      },
    },
    mutations: {
      onError: handleGlobalError,
    },
  },
})
