import { AppError } from "../errors"
import { TFunction } from "i18next"

export function registerAndJoinEventErrorMessage(error: AppError, t: TFunction) {
  const featureKey = `errors.user.${error.code}`
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

export function updateUserErrorMessage(error: AppError, t: TFunction) {
  const featureKey = `errors.user.${error.code}`
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
