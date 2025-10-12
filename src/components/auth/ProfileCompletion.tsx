import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import InputMask from "react-input-mask";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AuthGateway } from "@/lib/AuthGateway";
import { UserGateway } from "@/lib/UserGateway";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import SuccessSnackbar from "@/components/SuccessSnackbar";
import { createCommonValidations, PHONE_MASK } from "@/lib/validationSchemas";
import logoLight from "@/assets/logoLight.png";

const ProfileCompletion: React.FC = () => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const authGateway = new AuthGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  const commonValidations = createCommonValidations(t);

  const profileCompletionSchema = Yup.object().shape({
    username: commonValidations.fullName,
    gender: commonValidations.gender,
    birthday: commonValidations.birthdate,
    phone_number: commonValidations.phone,
    instagram_profile: commonValidations.instagram,
    bio: commonValidations.bio,
  });
  const userGateway = new UserGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  const initialValues = {
    username: "",
    gender: "",
    birthday: "",
    phone_number: "+55 ",
    instagram_profile: "",
    bio: "",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <img src={logoLight} alt="Tikko" className="h-12 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">
            Complete Seu Perfil
          </CardTitle>
          <CardDescription>
            Preencha seus dados para finalizar o cadastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={profileCompletionSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await userGateway.updateCurrentUser({
                  username: values.username,
                  gender: values.gender,
                  birthday: new Date(
                    values.birthday.split("/").reverse().join("-")
                  ).toISOString(),
                  phone_number: values.phone_number,
                  location: "", // Empty location as requested
                  bio: values.bio,
                  instagram_profile: values.instagram_profile,
                  companies_following: [], // Empty array as requested
                });

                setSuccessMessage("Perfil completado com sucesso!");
                setShowSuccess(true);
                localStorage.removeItem("isFirstAccess");
                setTimeout(() => {
                  window.location.href = "/dashboard";
                }, 2000);
              } catch (error: any) {
                setErrorMessage(error.message);
                setShowError(true);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              isSubmitting,
              errors,
              touched,
              values,
              handleChange,
              handleBlur,
              setFieldValue,
            }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="username">Nome Completo *</Label>
                    <Field
                      as={Input}
                      id="username"
                      name="username"
                      placeholder="Seu nome completo"
                      onBlur={handleBlur}
                      className={
                        errors.username && touched.username
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  <div>
                    <Label>Gênero *</Label>
                    <RadioGroup
                      value={values.gender}
                      onValueChange={(value) => setFieldValue("gender", value)}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Feminino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="gender-other" />
                        <Label htmlFor="gender-other">Outro</Label>
                      </div>
                    </RadioGroup>
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthday">Data de Nascimento *</Label>
                    <InputMask
                      mask="99/99/9999"
                      value={values.birthday}
                      onChange={handleChange("birthday")}
                      onBlur={handleBlur("birthday")}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="birthday"
                          placeholder="dd/mm/aaaa"
                          className={
                            errors.birthday && touched.birthday
                              ? "border-destructive"
                              : ""
                          }
                        />
                      )}
                    </InputMask>
                    <ErrorMessage
                      name="birthday"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Telefone *</Label>
                    <InputMask
                      mask={PHONE_MASK}
                      value={values.phone_number}
                      onChange={handleChange("phone_number")}
                      onBlur={handleBlur("phone_number")}
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
                          id="phone_number"
                          placeholder="+55 (11) 99999-9999"
                          className={
                            errors.phone_number && touched.phone_number
                              ? "border-destructive"
                              : ""
                          }
                        />
                      )}
                    </InputMask>
                    <ErrorMessage
                      name="phone_number"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram_profile">Instagram *</Label>
                    <Field
                      as={Input}
                      id="instagram_profile"
                      name="instagram_profile"
                      placeholder="seu_usuario"
                      onBlur={handleBlur}
                      className={
                        errors.instagram_profile && touched.instagram_profile
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="instagram_profile"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio *</Label>
                    <Field
                      as={Textarea}
                      id="bio"
                      name="bio"
                      placeholder="Conte-nos sobre você..."
                      rows={3}
                      onBlur={handleBlur}
                      className={
                        errors.bio && touched.bio ? "border-destructive" : ""
                      }
                    />
                    <ErrorMessage
                      name="bio"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg mt-6"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? "Salvando..." : "Completar Perfil"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
        <ErrorSnackbar
          message={errorMessage}
          visible={showError}
          onDismiss={() => setShowError(false)}
        />
        <SuccessSnackbar
          message={successMessage}
          visible={showSuccess}
          onDismiss={() => setShowSuccess(false)}
        />
      </Card>
    </div>
  );
};

export default ProfileCompletion;
