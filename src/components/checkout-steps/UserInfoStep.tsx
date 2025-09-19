import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputMask from "react-input-mask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserData } from "../CheckoutOverlay";

interface UserInfoStepProps {
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
  identificationType: 'cpf' | 'other';
  onIdentificationTypeChange: (type: 'cpf' | 'other') => void;
  onNext: () => void;
}

// Phone mask for any country code
const PHONE_MASK = "+99 (99) 99999-9999";

const validateMobileNumber = (mobileNumber: string) => {
  if (!mobileNumber) {
    return { isValid: false, errorMessage: "Telefone é obrigatório" };
  }

  const cleanValue = mobileNumber.replace(/[()\s-]/g, "");

  if (!cleanValue.startsWith("+")) {
    return {
      isValid: false,
      errorMessage: "Telefone deve começar com código do país (+)",
    };
  }

  if (cleanValue.startsWith("+55")) {
    // Brazilian validation
    const numberWithoutCountryCode = cleanValue.slice(3);
    if (numberWithoutCountryCode.length !== 11) {
      return {
        isValid: false,
        errorMessage: "Telefone brasileiro deve ter 11 dígitos",
      };
    }
  } else {
    // International validation
    if (cleanValue.length < 8) {
      return { isValid: false, errorMessage: "Telefone inválido" };
    }
  }

  return { isValid: true, errorMessage: "" };
};

const validationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .required("Nome completo é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  confirmEmail: Yup.string()
    .oneOf([Yup.ref("email")], "Emails não coincidem")
    .required("Confirmação de email é obrigatória"),
  phone: Yup.string()
    .test("phone-validation", (value, context) => {
      const result = validateMobileNumber(value || "");
      return result.isValid
        ? true
        : context.createError({ message: result.errorMessage });
    })
    .required("Telefone é obrigatório"),
  confirmPhone: Yup.string()
    .oneOf([Yup.ref("phone")], "Telefones não coincidem")
    .required("Confirmação de telefone é obrigatória"),
  identification: Yup.string()
    .test("identification-validation", "Documento inválido", function (value) {
      const { identificationType } = this.parent;
      if (!value) return false;
      if (identificationType === "cpf") {
        return value.replace(/\D/g, "").length === 11;
      }
      return value.length >= 5; // Minimum for other documents
    })
    .required("Documento é obrigatório"),
  birthdate: Yup.date()
    .max(
      new Date(Date.now() - 568025136000),
      "Você deve ter pelo menos 18 anos"
    )
    .required("Data de nascimento é obrigatória"),
  instagram: Yup.string()
    .transform((value) => value?.replace("@", "") || "")
    .required("Instagram é obrigatório"),
});

export const UserInfoStep: React.FC<UserInfoStepProps> = ({
  userData,
  onUserDataChange,
  identificationType,
  onIdentificationTypeChange,
  onNext,
}) => {

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
            enableReinitialize={true}
            onSubmit={(values, { validateForm, setTouched }) => {
              validateForm().then((formErrors) => {
                if (Object.keys(formErrors).length === 0) {
                  const { identificationType, ...userDataValues } = values;
                  onUserDataChange(userDataValues);
                  onNext();
                } else {
                  // Mark all fields as touched to show errors
                  setTouched({
                    fullName: true,
                    email: true,
                    confirmEmail: true,
                    phone: true,
                    confirmPhone: true,
                    identification: true,
                    birthdate: true,
                    instagram: true,
                  });
                }
              });
            }}
          >
            {({
              errors,
              touched,
              setFieldValue,
              values,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => {
              // Update parent state whenever form values change
              React.useEffect(() => {
                const { identificationType, ...userDataValues } = values;
                onUserDataChange(userDataValues);
              }, [values]);

              // Handle form submission and call onNext
              const handleFormSubmit = (values: any) => {
                handleSubmit(values);
                onNext();
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
                    <RadioGroup
                      value={identificationType}
                      onValueChange={(value: "cpf" | "other") => {
                        onIdentificationTypeChange(value);
                        setFieldValue("identificationType", value);
                        setFieldValue("identification", "");
                      }}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cpf" id="cpf" />
                        <Label htmlFor="cpf">CPF</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Outro</Label>
                      </div>
                    </RadioGroup>
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
