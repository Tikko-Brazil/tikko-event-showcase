import React, { useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import InputMask from "react-input-mask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserData } from "../CheckoutOverlay";
import {
  createCommonValidations,
  validateCPF,
  PHONE_MASK,
} from "@/lib/validationSchemas";

interface UserInfoStepProps {
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
  identificationType: "cpf" | "other";
  onIdentificationTypeChange: (type: "cpf" | "other") => void;
  onNext: () => void;
  onValidationChange?: (isValid: boolean) => void;
  onContinue?: (userData: UserData) => void;
  onValidateAndContinue?: (validateAndContinue: () => Promise<boolean>) => void;
}

export const UserInfoStep: React.FC<UserInfoStepProps> = ({
  userData,
  onUserDataChange,
  identificationType,
  onIdentificationTypeChange,
  onNext,
  onValidationChange,
  onContinue,
  onValidateAndContinue,
}) => {
  const { t } = useTranslation();
  const [permanentTouched, setPermanentTouched] = React.useState<Record<string, boolean>>({});
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const validateFormRef = React.useRef<any>(null);
  const valuesRef = React.useRef<any>(null);

  // Reset interaction state on mount
  React.useEffect(() => {
    setHasInteracted(false);
    setPermanentTouched({});
  }, []);

  const commonValidations = createCommonValidations(t);

  const validationSchema = Yup.object({
    fullName: commonValidations.fullName,
    email: commonValidations.email,
    confirmEmail: Yup.string()
      .oneOf([Yup.ref("email")], t("validation.email.noMatch"))
      .required(t("validation.required")),
    phone: commonValidations.phone,
    confirmPhone: Yup.string()
      .oneOf([Yup.ref("phone")], t("validation.phone.noMatch"))
      .required(t("validation.required")),
    identification:
      identificationType === "cpf"
        ? commonValidations.cpf
        : Yup.string()
            .test(
              "identification-validation",
              t("validation.document.invalid"),
              (value) => {
                if (!value) return false;
                return value.length >= 5;
              }
            )
            .required(t("validation.required")),
    birthdate: commonValidations.birthdate,
    instagram: commonValidations.instagram,
  });

  return (
    <div className="space-y-6 pb-60">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ ...userData, identificationType }}
            validationSchema={validationSchema}
            validateOnMount={false}
            validateOnChange={false}
            validateOnBlur={true}
            enableReinitialize={true}
            onSubmit={(values) => {
              const { identificationType, ...userDataValues } = values;
              onUserDataChange(userDataValues);
              onNext();
            }}
          >
            {({
              errors,
              touched,
              setFieldValue,
              values,
              handleChange,
              handleBlur: formikHandleBlur,
              isValid,
              validateForm,
              validateField,
            }) => {
              // Custom handleBlur that persists touched state and validates
              const handleBlur = (fieldName?: string) => async (e: any) => {
                const field = fieldName || e.target.name;
                setHasInteracted(true);
                setPermanentTouched(prev => ({ ...prev, [field]: true }));
                formikHandleBlur(e);
                // Manually trigger validation after blur
                await validateForm();
                // Sync data to parent after blur
                const { identificationType, ...userDataValues } = values;
                onUserDataChange(userDataValues);
              };

              // Custom handleChange that validates the field
              const handleFieldChange = (fieldName?: string) => async (e: any) => {
                const field = fieldName || e.target.name;
                handleChange(e);
                // Only validate if field was already touched
                if (touched[field] || permanentTouched[field]) {
                  setTimeout(() => validateField(field), 0);
                }
              };

              // Update validation state only when it changes
              React.useEffect(() => {
                onValidationChange?.(isValid);
              }, [isValid]);

              // Store refs for validation
              React.useEffect(() => {
                validateFormRef.current = validateForm;
                valuesRef.current = values;
              });

              // Validate on mount without touching fields
              React.useEffect(() => {
                validateForm();
              }, []);

              // Expose validation function to parent only once
              React.useEffect(() => {
                if (onValidateAndContinue) {
                  onValidateAndContinue(async () => {
                    console.log('Validation function called');
                    setHasInteracted(true); // Enable error display
                    const errors = await validateFormRef.current();
                    if (Object.keys(errors).length === 0) {
                      const { identificationType, ...userDataValues } = valuesRef.current;
                      onUserDataChange(userDataValues);
                      onNext();
                      return true;
                    } else {
                      console.log('Validation failed, marking fields as touched:', errors);
                      // Mark all fields as touched to show errors
                      const allTouched: Record<string, boolean> = {};
                      Object.keys(errors).forEach(key => {
                        allTouched[key] = true;
                      });
                      setPermanentTouched(prev => ({ ...prev, ...allTouched }));
                      return false;
                    }
                  });
                }
              }, [onValidateAndContinue, onUserDataChange, onNext]);

              // Memoize error states to prevent flickering
              const fieldErrors = React.useMemo(() => {
                console.log('fieldErrors calculation:', { hasInteracted, permanentTouched, errors });
                // Don't show any errors until user has interacted
                if (!hasInteracted) return {};
                
                const result: Record<string, string | undefined> = {};
                Object.keys(errors).forEach(key => {
                  // Only show errors for fields that were manually touched by user
                  if (permanentTouched[key]) {
                    result[key] = errors[key];
                  }
                });
                return result;
              }, [errors, permanentTouched, hasInteracted]);

              // Check if field should show error
              const shouldShowError = (fieldName: string) => {
                return !!fieldErrors[fieldName];
              };

              return (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <Field
                        as={Input}
                        id="fullName"
                        name="fullName"
                        placeholder="Seu nome completo"
                        onChange={handleFieldChange()}
                        onBlur={handleBlur()}
                        className={
                          shouldShowError("fullName")
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {shouldShowError("fullName") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.fullName}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        onChange={handleFieldChange()}
                        onBlur={handleBlur()}
                        className={
                          shouldShowError("email")
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {shouldShowError("email") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmEmail">Confirmar Email *</Label>
                      <Field
                        as={Input}
                        id="confirmEmail"
                        name="confirmEmail"
                        type="email"
                        placeholder="Confirme seu email"
                        onChange={handleFieldChange()}
                        onBlur={handleBlur()}
                        className={
                          shouldShowError("confirmEmail")
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {shouldShowError("confirmEmail") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.confirmEmail}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <InputMask
                        mask={PHONE_MASK}
                        value={values.phone}
                        onChange={(e) => {
                          handleChange("phone")(e);
                          if (touched.phone || permanentTouched.phone) {
                            setTimeout(() => validateField("phone"), 0);
                          }
                        }}
                        onBlur={handleBlur("phone")}
                        beforeMaskedStateChange={({ nextState }) => {
                          // Allow flexible country codes
                          if (nextState.value.length < 2) {
                            return { ...nextState, value: "+" };
                          }
                          return nextState;
                        }}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="phone"
                            placeholder="+55 (11) 99999-9999"
                            className={
                              shouldShowError("phone")
                                ? "border-destructive"
                                : ""
                            }
                          />
                        )}
                      </InputMask>
                      {shouldShowError("phone") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.phone}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPhone">Confirmar Telefone *</Label>
                      <InputMask
                        mask={PHONE_MASK}
                        value={values.confirmPhone}
                        onChange={(e) => {
                          handleChange("confirmPhone")(e);
                          if (touched.confirmPhone || permanentTouched.confirmPhone) {
                            setTimeout(() => validateField("confirmPhone"), 0);
                          }
                        }}
                        onBlur={handleBlur("confirmPhone")}
                        beforeMaskedStateChange={({ nextState }) => {
                          if (nextState.value.length < 2) {
                            return { ...nextState, value: "+" };
                          }
                          return nextState;
                        }}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="confirmPhone"
                            placeholder="Confirme seu telefone"
                            className={
                              shouldShowError("confirmPhone")
                                ? "border-destructive"
                                : ""
                            }
                          />
                        )}
                      </InputMask>
                      {shouldShowError("confirmPhone") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.confirmPhone}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Tipo de Documento *</Label>
                      <Select
                        value={identificationType}
                        onValueChange={(value: "cpf" | "other") => {
                          onIdentificationTypeChange(value);
                          setFieldValue("identificationType", value);
                          setFieldValue("identification", "");
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="identification">
                        {identificationType === "cpf" ? "CPF" : "Documento"} *
                      </Label>
                      {identificationType === "cpf" ? (
                        <InputMask
                          mask="999.999.999-99"
                          value={values.identification}
                          onChange={(e) => {
                            handleChange("identification")(e);
                            if (touched.identification || permanentTouched.identification) {
                              setTimeout(() => validateField("identification"), 0);
                            }
                          }}
                          onBlur={handleBlur("identification")}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              id="identification"
                              placeholder="000.000.000-00"
                              className={
                                shouldShowError("identification")
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                          )}
                        </InputMask>
                      ) : (
                        <Input
                          id="identification"
                          value={values.identification}
                          onChange={(e) => {
                            handleChange("identification")(e);
                            if (touched.identification || permanentTouched.identification) {
                              setTimeout(() => validateField("identification"), 0);
                            }
                          }}
                          onBlur={handleBlur("identification")}
                          placeholder="Número do documento"
                          className={
                            shouldShowError("identification")
                              ? "border-destructive"
                              : ""
                          }
                        />
                      )}
                      {shouldShowError("identification") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.identification}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="birthdate">Data de Nascimento *</Label>
                      <InputMask
                        mask="99/99/9999"
                        value={values.birthdate}
                        onChange={(e) => {
                          handleChange("birthdate")(e);
                          if (touched.birthdate || permanentTouched.birthdate) {
                            setTimeout(() => validateField("birthdate"), 0);
                          }
                        }}
                        onBlur={handleBlur("birthdate")}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="birthdate"
                            placeholder="dd/mm/aaaa"
                            className={
                              shouldShowError("birthdate")
                                ? "border-destructive"
                                : ""
                            }
                          />
                        )}
                      </InputMask>
                      {shouldShowError("birthdate") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.birthdate}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram *</Label>
                      <Field
                        as={Input}
                        id="instagram"
                        name="instagram"
                        placeholder="seu_usuario"
                        onChange={handleFieldChange()}
                        onBlur={handleBlur()}
                        className={
                          shouldShowError("instagram")
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {shouldShowError("instagram") && (
                        <div className="text-destructive text-sm mt-1">
                          {errors.instagram}
                        </div>
                      )}
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};
