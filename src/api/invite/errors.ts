import { TFunction } from "i18next";
import { AppError } from "@/api/errors";

export function sendCourtesyTicketErrorMessage(error: AppError, t: TFunction) {
  const inviteKey = `errors.invite.${error.code}`;
  if (t(inviteKey, { defaultValue: "" })) {
    return t(inviteKey, error.details);
  }

  if (error.status) {
    return t(`errors.http.${error.status}`, {
      defaultValue: t("errors.generic.UNKNOWN_ERROR"),
    });
  }

  return t("errors.generic.UNKNOWN_ERROR");
}
