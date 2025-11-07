import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
import ErrorSnackbar from "@/components/ErrorSnackbar";
import SuccessSnackbar from "@/components/SuccessSnackbar";
import { createCommonValidations, PHONE_MASK } from "@/lib/validationSchemas";
import { ArrowLeft } from "lucide-react";

const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const commonValidations = createCommonValidations(t);

  const editProfileSchema = Yup.object().shape({
    username: commonValidations.fullName,
    gender: commonValidations.gender,
    birthday: commonValidations.birthdate,
    phone_number: commonValidations.phone,
    instagram_profile: commonValidations.instagram,
    bio: commonValidations.bio,
  });

  const initialValues = {
    username: "",
    gender: "",
    birthday: "",
    phone_number: "+55 ",
    instagram_profile: "",
    bio: "",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Editar Perfil
            </CardTitle>
            <CardDescription className="text-base">
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={editProfileSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setSuccessMessage("Perfil atualizado com sucesso!");
                  setShowSuccess(true);
                  setTimeout(() => {
                    navigate("/profile");
                  }, 1500);
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
                <Form className="space-y-6">
                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="username" className="text-base">
                        Nome Completo *
                      </Label>
                      <Field
                        as={Input}
                        id="username"
                        name="username"
                        placeholder="Seu nome completo"
                        onBlur={handleBlur}
                        className={`mt-2 h-11 ${
                          errors.username && touched.username
                            ? "border-destructive"
                            : ""
                        }`}
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="text-destructive text-sm mt-1.5"
                      />
                    </div>

                    {/* Gender and Birthday */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-base">Gênero *</Label>
                        <RadioGroup
                          value={values.gender}
                          onValueChange={(value) =>
                            setFieldValue("gender", value)
                          }
                          className="flex flex-col gap-3 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="font-normal">
                              Masculino
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="font-normal">
                              Feminino
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="gender-other" />
                            <Label htmlFor="gender-other" className="font-normal">
                              Outro
                            </Label>
                          </div>
                        </RadioGroup>
                        <ErrorMessage
                          name="gender"
                          component="div"
                          className="text-destructive text-sm mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="birthday" className="text-base">
                          Data de Nascimento *
                        </Label>
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
                              className={`mt-2 h-11 ${
                                errors.birthday && touched.birthday
                                  ? "border-destructive"
                                  : ""
                              }`}
                            />
                          )}
                        </InputMask>
                        <ErrorMessage
                          name="birthday"
                          component="div"
                          className="text-destructive text-sm mt-1.5"
                        />
                      </div>
                    </div>

                    {/* Phone and Instagram */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="phone_number" className="text-base">
                          Telefone *
                        </Label>
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
                              className={`mt-2 h-11 ${
                                errors.phone_number && touched.phone_number
                                  ? "border-destructive"
                                  : ""
                              }`}
                            />
                          )}
                        </InputMask>
                        <ErrorMessage
                          name="phone_number"
                          component="div"
                          className="text-destructive text-sm mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="instagram_profile" className="text-base">
                          Instagram *
                        </Label>
                        <Field
                          as={Input}
                          id="instagram_profile"
                          name="instagram_profile"
                          placeholder="seu_usuario"
                          onBlur={handleBlur}
                          className={`mt-2 h-11 ${
                            errors.instagram_profile &&
                            touched.instagram_profile
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name="instagram_profile"
                          component="div"
                          className="text-destructive text-sm mt-1.5"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio" className="text-base">
                        Bio *
                      </Label>
                      <Field
                        as={Textarea}
                        id="bio"
                        name="bio"
                        placeholder="Conte-nos sobre você..."
                        rows={4}
                        onBlur={handleBlur}
                        className={`mt-2 resize-none ${
                          errors.bio && touched.bio ? "border-destructive" : ""
                        }`}
                      />
                      <ErrorMessage
                        name="bio"
                        component="div"
                        className="text-destructive text-sm mt-1.5"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full md:w-auto h-11 px-8"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="w-full md:flex-1 h-11 px-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default EditProfile;
