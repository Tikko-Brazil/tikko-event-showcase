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
}

export const UserInfoStep: React.FC<UserInfoStepProps> = ({
  userData,
  onUserDataChange,
  identificationType,
  onIdentificationTypeChange,
  onNext,
  onValidationChange,
  onContinue,
}) => {
  const { t } = useTranslation();
  const [permanentTouched, setPermanentTouched] = React.useState<Record<string, boolean>>({});

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
            validateOnMount={true}
            validateOnChange={true}
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
              handleBlur,
              isValid,
            }) => {
              // Helper to sync form data with parent
              const syncFormData = () => {
                const { identificationType, ...userDataValues } = values;
                onUserDataChange(userDataValues);
              };

              // Update validation state and sync data when valid
              React.useEffect(() => {
                onValidationChange?.(isValid);
                if (isValid) {
                  syncFormData();
                }
              }, [isValid]);

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
                        onBlur={handleBlur}
                        className={
                          errors.fullName && touched.fullName
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <ErrorMessage
                        name="fullName"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        onBlur={handleBlur}
                        className={
                          errors.email && touched.email
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmEmail">Confirmar Email *</Label>
                      <Field
                        as={Input}
                        id="confirmEmail"
                        name="confirmEmail"
                        type="email"
                        placeholder="Confirme seu email"
                        onBlur={handleBlur}
                        className={
                          errors.confirmEmail && touched.confirmEmail
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <ErrorMessage
                        name="confirmEmail"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <InputMask
                        mask={PHONE_MASK}
                        value={values.phone}
                        onChange={handleChange("phone")}
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
                              errors.phone && touched.phone
                                ? "border-destructive"
                                : ""
                            }
                          />
                        )}
                      </InputMask>
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPhone">Confirmar Telefone *</Label>
                      <InputMask
                        mask={PHONE_MASK}
                        value={values.confirmPhone}
                        onChange={handleChange("confirmPhone")}
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
                              errors.confirmPhone && touched.confirmPhone
                                ? "border-destructive"
                                : ""
                            }
                          />
                        )}
                      </InputMask>
                      <ErrorMessage
                        name="confirmPhone"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
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
                          onChange={handleChange("identification")}
                          onBlur={handleBlur("identification")}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              id="identification"
                              placeholder="000.000.000-00"
                              className={
                                errors.identification && touched.identification
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
                          onChange={handleChange("identification")}
                          onBlur={handleBlur("identification")}
                          placeholder="Número do documento"
                          className={
                            errors.identification && touched.identification
                              ? "border-destructive"
                              : ""
                          }
                        />
                      )}
                      <ErrorMessage
                        name="identification"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="birthdate">Data de Nascimento *</Label>
                      <InputMask
                        mask="99/99/9999"
                        value={values.birthdate}
                        onChange={handleChange("birthdate")}
                        onBlur={handleBlur("birthdate")}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="birthdate"
                            placeholder="dd/mm/aaaa"
                            className={
                              errors.birthdate && touched.birthdate
                                ? "border-destructive"
                                : ""
                            }
                          />
                        )}
                      </InputMask>
                      <ErrorMessage
                        name="birthdate"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram *</Label>
                      <Field
                        as={Input}
                        id="instagram"
                        name="instagram"
                        placeholder="seu_usuario"
                        onBlur={handleBlur}
                        className={
                          errors.instagram && touched.instagram
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <ErrorMessage
                        name="instagram"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
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
