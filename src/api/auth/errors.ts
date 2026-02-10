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

export function signupErrorMessage(error: AppError, t: TFunction) {
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

export function verifyErrorMessage(error: AppError, t: TFunction) {
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

export function loginErrorMessage(error: AppError, t: TFunction) {
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

export function forgotPasswordErrorMessage(error: AppError, t: TFunction) {
  // Handle rate limiting with details
  if (error.code === "PASSWORD_RESET_RATE_LIMITED" && error.details) {
    const minutes = error.details as string
    return t("errors.auth.PASSWORD_RESET_RATE_LIMITED", { minutes })
  }

  if (error.code === "TOO_MANY_PASSWORD_RESET_ATTEMPTS" && error.details) {
    const minutes = error.details as string
    const hours = Math.floor(Number(minutes) / 60)
    return t("errors.auth.TOO_MANY_PASSWORD_RESET_ATTEMPTS", { hours })
  }

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

export function resetPasswordErrorMessage(error: AppError, t: TFunction) {
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
