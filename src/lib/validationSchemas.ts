import * as Yup from "yup";
import { TFunction } from "i18next";

// Phone validation function
export const validateMobileNumber = (mobileNumber: string, t: TFunction) => {
  if (!mobileNumber) {
    return { isValid: false, errorMessage: t("validation.phone.required") };
  }

  const cleanValue = mobileNumber.replace(/[()\s-]/g, "");

  if (!cleanValue.startsWith("+")) {
    return {
      isValid: false,
      errorMessage: t("validation.phone.countryCodeRequired"),
    };
  }

  if (cleanValue.startsWith("+55")) {
    const numberWithoutCountryCode = cleanValue.slice(3);
    if (numberWithoutCountryCode.length !== 11) {
      return {
        isValid: false,
        errorMessage: t("validation.phone.invalidBrazilian"),
      };
    }
  } else {
    if (cleanValue.length < 8 || cleanValue.length > 15) {
      return {
        isValid: false,
        errorMessage: t("validation.phone.invalidLength"),
      };
    }
  }

  return { isValid: true, errorMessage: "" };
};

// CPF validation function
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, "");

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

// Common validation schemas
export const createCommonValidations = (t: TFunction) => ({
  email: Yup.string()
    .email(t("validation.email.invalid"))
    .required(t("validation.required")),

  fullName: Yup.string()
    .required(t("validation.required"))
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, t("validation.name.invalid"))
    .test("at-least-two-words", t("validation.name.twoWords"), (value) => {
      if (!value) return false;
      const words = value.trim().split(/\s+/);
      return words.length >= 2;
    }),

  phone: Yup.string()
    .test("phone-validation", (value, context) => {
      const result = validateMobileNumber(value || "", t);
      return result.isValid
        ? true
        : context.createError({ message: result.errorMessage });
    })
    .required(t("validation.phone.required")),

  password: Yup.string()
    .required(t("validation.required"))
    .min(8, t("validation.password.minLength"))
    .matches(/[A-Z]/, t("validation.password.uppercase"))
    .matches(/[a-z]/, t("validation.password.lowercase"))
    .matches(/[0-9]/, t("validation.password.number"))
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      t("validation.password.specialChar")
    ),

  confirmPassword: (fieldName: string = "password") =>
    Yup.string()
      .oneOf([Yup.ref(fieldName)], t("validation.password.noMatch"))
      .required(t("validation.required")),

  birthdate: Yup.date()
    .max(
      new Date(Date.now() - 568025136000), // 18 years ago
      t("validation.birthdate.minAge")
    )
    .required(t("validation.birthdate.required")),

  cpf: Yup.string()
    .test("cpf-validation", t("validation.document.invalidCPF"), (value) => {
      if (!value) return false;
      return validateCPF(value);
    })
    .required(t("validation.required")),

  instagram: Yup.string()
    .matches(/^[^@]+$/, t("validation.instagram.noAt"))
    .matches(
      /^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/,
      t("validation.instagram.invalid")
    )
    .required(t("validation.required")),

  bio: Yup.string()
    .max(500, t("validation.bio.maxLength"))
    .required(t("validation.required")),

  gender: Yup.string().required(t("validation.required")),

  ticketType: Yup.number()
    .required(t("validation.ticketType.required"))
    .positive(t("validation.ticketType.invalid")),
});

// Phone mask constant
export const PHONE_MASK = "+99 (99) 99999-9999";
