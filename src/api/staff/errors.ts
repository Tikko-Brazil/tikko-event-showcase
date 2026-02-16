import { AppError } from "../errors";
import { TFunction } from "i18next";

export function getEventStaffErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_REQUEST":
      return t("errors.staff.INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.staff.UNAUTHORIZED");
    case "INSUFFICIENT_EVENT_PERMISSIONS":
      return t("errors.staff.INSUFFICIENT_EVENT_PERMISSIONS");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.staff.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function updateStaffRoleErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_REQUEST":
      return t("errors.staff.UPDATE_INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.staff.UNAUTHORIZED");
    case "INSUFFICIENT_EVENT_PERMISSIONS":
      return t("errors.staff.INSUFFICIENT_EVENT_PERMISSIONS");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.staff.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function addEventStaffErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_REQUEST":
      return t("errors.staff.ADD_INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.staff.UNAUTHORIZED");
    case "INSUFFICIENT_EVENT_PERMISSIONS":
      return t("errors.staff.INSUFFICIENT_EVENT_PERMISSIONS");
    case "USER_NOT_FOUND":
      return t("errors.staff.USER_NOT_FOUND");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.staff.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function removeEventStaffErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_REQUEST":
      return t("errors.staff.REMOVE_INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.staff.UNAUTHORIZED");
    case "INSUFFICIENT_EVENT_PERMISSIONS":
      return t("errors.staff.REMOVE_INSUFFICIENT_PERMISSIONS");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.staff.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}
