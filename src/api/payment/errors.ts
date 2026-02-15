import { AppError } from "../errors";
import { TFunction } from "i18next";

export function mercadoPagoOAuthErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_ORGANIZATION_ID":
      return t("errors.payment.INVALID_ORGANIZATION_ID");
    case "INVALID_AUTH_CODE":
      return t("errors.payment.INVALID_AUTH_CODE");
    case "INVALID_STATE_PARAMETER":
      return t("errors.payment.INVALID_STATE_PARAMETER");
    case "UNAUTHORIZED":
      return t("errors.payment.UNAUTHORIZED");
    case "ADMIN_ONLY":
      return t("errors.payment.ADMIN_ONLY");
    case "NOT_ORGANIZATION_MEMBER":
      return t("errors.payment.NOT_ORGANIZATION_MEMBER");
    case "INSUFFICIENT_ORG_PERMISSIONS":
      return t("errors.payment.INSUFFICIENT_ORG_PERMISSIONS");
    case "USER_NOT_FOUND":
      return t("errors.payment.USER_NOT_FOUND");
    case "MERCADO_PAGO_AUTH_FAILED":
      return t("errors.payment.MERCADO_PAGO_AUTH_FAILED");
    case "MERCADO_PAGO_TOKEN_SAVE_FAILED":
      return t("errors.payment.MERCADO_PAGO_TOKEN_SAVE_FAILED");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.payment.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function mercadoPagoStatusErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_ORGANIZATION_ID":
      return t("errors.payment.INVALID_ORGANIZATION_ID");
    case "UNAUTHORIZED":
      return t("errors.payment.UNAUTHORIZED");
    case "ADMIN_ONLY":
      return t("errors.payment.ADMIN_ONLY");
    case "NOT_ORGANIZATION_MEMBER":
      return t("errors.payment.NOT_ORGANIZATION_MEMBER");
    case "INSUFFICIENT_ORG_PERMISSIONS":
      return t("errors.payment.INSUFFICIENT_ORG_PERMISSIONS");
    case "USER_NOT_FOUND":
      return t("errors.payment.USER_NOT_FOUND");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.payment.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

export function mercadoPagoDisconnectErrorMessage(error: AppError, t: TFunction): string {
  const code = error.code;

  switch (code) {
    case "INVALID_ORGANIZATION_ID":
      return t("errors.payment.INVALID_ORGANIZATION_ID");
    case "UNAUTHORIZED":
      return t("errors.payment.UNAUTHORIZED");
    case "ADMIN_ONLY":
      return t("errors.payment.ADMIN_ONLY");
    case "NOT_ORGANIZATION_MEMBER":
      return t("errors.payment.NOT_ORGANIZATION_MEMBER");
    case "INSUFFICIENT_ORG_PERMISSIONS":
      return t("errors.payment.INSUFFICIENT_ORG_PERMISSIONS");
    case "USER_NOT_FOUND":
      return t("errors.payment.USER_NOT_FOUND");
    case "INTERNAL_SERVER_ERROR":
      return t("errors.payment.INTERNAL_SERVER_ERROR");
    case "NETWORK_ERROR":
      return t("api.errors.networkError");
    default:
      return t("api.errors.unknownError");
  }
}

