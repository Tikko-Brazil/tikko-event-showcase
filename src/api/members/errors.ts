import { AppError } from "../errors";
import { TFunction } from "i18next";

export function getOrganizationMembersErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_ORGANIZATION_ID":
      return t("errors.members.INVALID_ORGANIZATION_ID");
    case "INVALID_REQUEST":
      return t("errors.members.INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.members.UNAUTHORIZED");
    case "ADMIN_ONLY":
      return t("errors.members.ADMIN_ONLY");
    case "NOT_ORGANIZATION_MEMBER":
      return t("errors.members.NOT_ORGANIZATION_MEMBER");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.members.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function addOrganizationMemberErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_ORGANIZATION_ID":
      return t("errors.members.INVALID_ORGANIZATION_ID");
    case "INVALID_REQUEST":
      return t("errors.members.ADD_INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.members.UNAUTHORIZED");
    case "ADMIN_ONLY":
      return t("errors.members.ADMIN_ONLY");
    case "INSUFFICIENT_ORG_PERMISSIONS":
      return t("errors.members.INSUFFICIENT_ORG_PERMISSIONS");
    case "USER_NOT_FOUND":
      return t("errors.members.USER_NOT_FOUND");
    case "CONFLICT":
      return t("errors.members.CONFLICT");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.members.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function updateMemberRoleErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_ORGANIZATION_ID":
      return t("errors.members.INVALID_ORGANIZATION_ID");
    case "INVALID_REQUEST":
      return t("errors.members.UPDATE_INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.members.UNAUTHORIZED");
    case "ADMIN_ONLY":
      return t("errors.members.ADMIN_ONLY");
    case "INSUFFICIENT_ORG_PERMISSIONS":
      return t("errors.members.INSUFFICIENT_ORG_PERMISSIONS");
    case "USER_NOT_FOUND":
      return t("errors.members.MEMBER_NOT_FOUND");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.members.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function removeOrganizationMemberErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_ORGANIZATION_ID":
      return t("errors.members.INVALID_ORGANIZATION_ID");
    case "INVALID_REQUEST":
      return t("errors.members.REMOVE_INVALID_REQUEST");
    case "UNAUTHORIZED":
      return t("errors.members.UNAUTHORIZED");
    case "ADMIN_ONLY":
      return t("errors.members.ADMIN_ONLY");
    case "INSUFFICIENT_ORG_PERMISSIONS":
      return t("errors.members.INSUFFICIENT_ORG_PERMISSIONS");
    case "USER_NOT_FOUND":
      return t("errors.members.MEMBER_NOT_FOUND");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.members.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}
