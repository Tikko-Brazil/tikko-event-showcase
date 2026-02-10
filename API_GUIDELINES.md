# API Communication Guidelines

## Folder Structure

```
src/
├── api/
│   ├── errors.ts                    # AppError interface
│   ├── client.ts                    # Fetch wrappers + error normalization
│   └── {feature}/
│       ├── api.ts                   # React Query hooks
│       └── errors.ts                # Error code → i18n mapping
├── queryClient.ts                   # Global error handling
└── locales/
    ├── en/translation.json          # Error messages
    └── pt/translation.json
```

## Layer Responsibilities

### 1. `api/errors.ts`
**Responsibility:** Define error shape
```typescript
export interface AppError {
  status: number
  code: string
  details?: Record<string, unknown>
}
```

### 2. `api/client.ts`
**Responsibility:** HTTP communication + error normalization
- `api` - Public endpoints (get, post, put, delete)
- `apiAuth` - Authenticated endpoints with token refresh on 401
- `normalizeApiError()` - Convert unknown errors to AppError

### 3. `api/{feature}/api.ts`
**Responsibility:** React Query hooks for backend endpoints
```typescript
export function useRegisterAndJoinEvent() {
  return useMutation({
    mutationFn: async (data: Input) => {
      try {
        const res = await api.post("/endpoint", data)
        return res.data
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
  })
}
```

### 4. `api/{feature}/errors.ts`
**Responsibility:** Map error codes to i18n keys
```typescript
export function featureErrorMessage(error: AppError, t: TFunction) {
  const featureKey = `errors.feature.${error.code}`
  if (t(featureKey, { defaultValue: "" })) {
    return t(featureKey, error.details)
  }

  if (error.status) {
    return t(`errors.http.${error.status}`, {
      defaultValue: t("errors.generic.UNKNOWN_ERROR"),
    })
  }

  return t("errors.generic.UNKNOWN_ERROR")
}
```

### 5. `queryClient.ts`
**Responsibility:** Global error handling
- 401 → Logout + redirect + toast
- 403 → Permission denied toast
- NETWORK_ERROR → Network error toast
- 500+ → Retry up to 2 times

### 6. `locales/*/translation.json`
**Responsibility:** Error messages in all languages
```json
{
  "errors": {
    "http": { "401": "...", "403": "...", "500": "..." },
    "generic": { "NETWORK_ERROR": "...", "UNKNOWN_ERROR": "..." },
    "feature": { "ERROR_CODE": "..." }
  }
}
```

## Component Usage Pattern

```typescript
import { useTranslation } from "react-i18next"
import { useFeatureAction } from "@/api/feature/api"
import { featureErrorMessage } from "@/api/feature/errors"
import { AppError } from "@/api/errors"
import { toast } from "@/hooks/use-toast"

function MyComponent() {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useFeatureAction()

  const handleSubmit = async (data: FormData) => {
    try {
      await mutateAsync(data)
      toast({ description: t("feature.success") })
    } catch (error) {
      const message = featureErrorMessage(error as AppError, t)
      toast({ variant: "destructive", description: message })
    }
  }

  return <button onClick={handleSubmit} disabled={isPending}>Submit</button>
}
```

## Key Principles

1. **Components stay clean** - Only try/catch with error message mapping
2. **Global errors handled once** - 401/403/network in queryClient
3. **Feature errors localized** - Specific messages per error code
4. **Type safety** - Proper TypeScript types throughout
5. **Automatic token refresh** - apiAuth handles 401 transparently
