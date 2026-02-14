import { AppError } from "../errors"
import { TFunction } from "i18next"

export function createOrganizationErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code

  switch (code) {
    case "INVALID_REQUEST":
      return t("api.errors.organization.invalidRequest")
    case "ORGANIZATION_NAME_REQUIRED":
      return t("api.errors.organization.nameRequired")
    case "VALIDATION_FAILED":
      return t("api.errors.organization.validationFailed")
    case "UNAUTHORIZED":
      return t("api.errors.organization.unauthorized")
    case "ADMIN_ONLY":
      return t("api.errors.organization.adminOnly")
    case "USER_NOT_FOUND":
      return t("api.errors.organization.userNotFound")
    case "ORGANIZATION_ALREADY_EXISTS":
      return t("api.errors.organization.alreadyExists")
    case "INTERNAL_SERVER_ERROR":
      return t("api.errors.organization.internalError")
    case "NETWORK_ERROR":
      return t("api.errors.networkError")
    default:
      return t("api.errors.unknownError")
  }
}

export function logoUploadUrlErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code

  switch (code) {
    case "FILENAME_REQUIRED":
      return t("api.errors.organization.filenameRequired")
    case "UNAUTHORIZED":
      return t("api.errors.organization.unauthorized")
    case "ADMIN_ONLY":
      return t("api.errors.organization.adminOnly")
    case "USER_NOT_FOUND":
      return t("api.errors.organization.userNotFound")
    case "UPLOAD_URL_GENERATION_FAILED":
      return t("api.errors.organization.uploadUrlFailed")
    case "NETWORK_ERROR":
      return t("api.errors.networkError")
    default:
      return t("api.errors.unknownError")
  }
}

export function getOrganizationsErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code

  switch (code) {
    case "INVALID_REQUEST":
      return t("api.errors.organization.invalidRequest")
    case "INVALID_PAGINATION":
      return t("api.errors.organization.invalidPagination")
    case "UNAUTHORIZED":
      return t("api.errors.organization.unauthorized")
    case "ADMIN_ONLY":
      return t("api.errors.organization.adminOnly")
    case "INTERNAL_SERVER_ERROR":
      return t("api.errors.organization.internalError")
    case "NETWORK_ERROR":
      return t("api.errors.networkError")
    default:
      return t("api.errors.unknownError")
  }
}

export function getOrganizationErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code

  switch (code) {
    case "INVALID_REQUEST":
      return t("api.errors.organization.invalidRequest")
    case "UNAUTHORIZED":
      return t("api.errors.organization.unauthorized")
    case "ADMIN_ONLY":
      return t("api.errors.organization.adminOnly")
    case "FORBIDDEN":
      return t("api.errors.organization.forbidden")
    case "NOT_FOUND":
      return t("api.errors.organization.notFound")
    case "USER_NOT_FOUND":
      return t("api.errors.organization.userNotFound")
    case "INTERNAL_SERVER_ERROR":
      return t("api.errors.organization.internalError")
    case "NETWORK_ERROR":
      return t("api.errors.networkError")
    default:
      return t("api.errors.unknownError")
  }
}
