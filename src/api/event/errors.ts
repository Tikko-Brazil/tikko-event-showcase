import { AppError } from "../errors"
import { TFunction } from "i18next"

export function createEventErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code

  switch (code) {
    case "INVALID_REQUEST":
      return t("errors.event.invalidRequest")
    case "EVENT_NAME_REQUIRED":
      return t("errors.event.nameRequired")
    case "EVENT_START_DATE_REQUIRED":
      return t("errors.event.startDateRequired")
    case "TICKET_PRICING_REQUIRED":
      return t("errors.event.ticketPricingRequired")
    case "TICKET_TYPE_REQUIRED":
      return t("errors.event.ticketTypeRequired")
    case "TICKET_DATES_REQUIRED":
      return t("errors.event.ticketDatesRequired")
    case "ORGANIZATION_ID_REQUIRED":
      return t("errors.event.organizationIdRequired")
    case "UNAUTHORIZED":
      return t("errors.event.unauthorized")
    case "ADMIN_ONLY":
      return t("errors.event.adminOnly")
    case "NOT_ORGANIZATION_MEMBER":
      return t("errors.event.notOrganizationMember")
    case "INSUFFICIENT_ORG_PERMISSIONS":
      return t("errors.event.insufficientPermissions")
    case "USER_NOT_FOUND":
      return t("errors.event.userNotFound")
    case "INTERNAL_SERVER_ERROR":
      return t("errors.event.internalError")
    case "NETWORK_ERROR":
      return t("api.errors.networkError")
    default:
      return t("api.errors.unknownError")
  }
}

export function getEventsErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code

  switch (code) {
    case "INVALID_REQUEST":
      return t("errors.event.invalidRequest")
    case "NETWORK_ERROR":
      return t("api.errors.networkError")
    default:
      return t("api.errors.unknownError")
  }
}

export function getUserEventsErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code

  switch (code) {
    case "INVALID_REQUEST":
      return t("errors.event.getUserEvents.invalidRequest")
    case "INVALID_PAGINATION":
      return t("errors.event.getUserEvents.invalidPagination")
    case "INVALID_ACTIVE_FILTER":
      return t("errors.event.getUserEvents.invalidActiveFilter")
    case "UNAUTHORIZED":
      return t("errors.event.unauthorized")
    case "INTERNAL_SERVER_ERROR":
      return t("errors.event.internalError")
    case "NETWORK_ERROR":
      return t("api.errors.networkError")
    default:
      return t("api.errors.unknownError")
  }
}
