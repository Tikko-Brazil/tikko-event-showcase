import { AppError } from "../errors"
import { TFunction } from "i18next"

export function exchangeErrorMessage(error: AppError, t: TFunction) {
  const featureKey = `errors.auth.${error.code}`
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
