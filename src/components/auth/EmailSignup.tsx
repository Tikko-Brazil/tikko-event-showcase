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
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthGateway } from "@/lib/AuthGateway";
import { useSignup } from "@/api/auth/api";
import { signupErrorMessage } from "@/api/auth/errors";
import { AppError } from "@/api/errors";
import { toast } from "@/hooks/use-toast";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import SuccessSnackbar from "@/components/SuccessSnackbar";
import { createCommonValidations, PHONE_MASK } from "@/lib/validationSchemas";

interface EmailSignupProps {
  onNext: (email?: string) => void;
  onBack: () => void;
  isPasswordReset?: boolean;
  resetToken?: string;
}

const passwordResetSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface EmailSignupProps {
  onNext: (email?: string) => void;
  onBack: () => void;
  isPasswordReset?: boolean;
  resetToken?: string;
}

const EmailSignup: React.FC<EmailSignupProps> = ({
  onNext,
  onBack,
  isPasswordReset = false,
  resetToken,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const authGateway = new AuthGateway(import.meta.env.VITE_BACKEND_BASE_URL);
  const { mutateAsync: signup } = useSignup();

  const commonValidations = createCommonValidations(t);

  const signupSchema = Yup.object().shape({
    email: commonValidations.email,
    fullName: commonValidations.fullName,
    password: commonValidations.password,
    confirmPassword: commonValidations.confirmPassword(),
    gender: commonValidations.gender,
    birthdate: commonValidations.birthdate,
    phone: commonValidations.phone,
    instagram: commonValidations.instagram,
    bio: commonValidations.bio,
  });

  const passwordResetSchema = Yup.object().shape({
    password: commonValidations.password,
    confirmPassword: commonValidations.confirmPassword(),
  });

  const validationSchema = isPasswordReset ? passwordResetSchema : signupSchema;

  const initialValues = isPasswordReset
    ? { password: "", confirmPassword: "" }
    : {
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
        gender: "",
        birthdate: "",
        phone: "+55 ",
        instagram: "",
        bio: "",
      };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isPasswordReset ? t('signup.passwordReset.title') : t('signup.title')}
        </CardTitle>
        <CardDescription>
          {isPasswordReset
            ? t('signup.passwordReset.subtitle')
            : t('signup.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            if (isPasswordReset) {
              try {
                const resetData = values as any;
                await authGateway.resetPassword({
                  token: resetToken || "",
                  password: resetData.password,
                });

                setSuccessMessage(t('signup.passwordReset.success'));
                setShowSuccess(true);
                setTimeout(() => onNext(), 2000);
              } catch (error: any) {
                setErrorMessage(error.message);
                setShowError(true);
              } finally {
                setSubmitting(false);
              }
              return;
            }

            try {
              const signupData = values as any;
              await signup({
                email: signupData.email,
                username: signupData.fullName,
                password: signupData.password,
                gender: signupData.gender,
                phone_number: signupData.phone,
                location: "",
                bio: signupData.bio,
                instagram_profile: signupData.instagram,
              });

              setSuccessMessage(
                t('signup.verificationSent')
              );
              setShowSuccess(true);
              setTimeout(() => onNext(signupData.email), 2000);
            } catch (error) {
              const message = signupErrorMessage(error as AppError, t);
              toast({ variant: "destructive", description: message });
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
              {!isPasswordReset && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="email">
                        {t("signup.fields.email.label")}
                      </Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("signup.fields.email.placeholder")}
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

                    <div className="md:col-span-2">
                      <Label htmlFor="fullName">
                        {t("signup.fields.fullName.label")}
                      </Label>
                      <Field
                        as={Input}
                        id="fullName"
                        name="fullName"
                        placeholder={t("signup.fields.fullName.placeholder")}
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
                      <Label>{t("signup.fields.gender.label")}</Label>
                      <RadioGroup
                        value={values.gender}
                        onValueChange={(value) =>
                          setFieldValue("gender", value)
                        }
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">
                            {t("signup.fields.gender.male")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">
                            {t("signup.fields.gender.female")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="gender-other" />
                          <Label htmlFor="gender-other">
                            {t("signup.fields.gender.other")}
                          </Label>
                        </div>
                      </RadioGroup>
                      <ErrorMessage
                        name="gender"
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="birthdate">
                        {t("signup.fields.birthdate.label")}
                      </Label>
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
                            placeholder={t(
                              "signup.fields.birthdate.placeholder"
                            )}
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
                      <Label htmlFor="phone">
                        {t("signup.fields.phone.label")}
                      </Label>
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
                            placeholder={t("signup.fields.phone.placeholder")}
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
                      <Label htmlFor="instagram">
                        {t("signup.fields.instagram.label")}
                      </Label>
                      <Field
                        as={Input}
                        id="instagram"
                        name="instagram"
                        placeholder={t("signup.fields.instagram.placeholder")}
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

                    <div className="md:col-span-2">
                      <Label htmlFor="bio">{t('signup.fields.bio.label')}</Label>
                      <Field
                        as={Textarea}
                        id="bio"
                        name="bio"
                        placeholder={t('signup.fields.bio.placeholder')}
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
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("signup.fields.password.label")}
                </Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("signup.fields.password.placeholder")}
                    onBlur={handleBlur}
                    className={`pr-10 ${
                      errors.password && touched.password
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-destructive text-sm mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("signup.fields.confirmPassword.label")}
                </Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("signup.fields.confirmPassword.placeholder")}
                    onBlur={handleBlur}
                    className={`pr-10 ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-destructive text-sm mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg mt-6"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting
                  ? t("signup.buttons.submitting")
                  : isPasswordReset
                  ? t("signup.buttons.resetPassword")
                  : t("signup.buttons.submit")}
              </Button>

              {!isPasswordReset && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {t("signup.links.hasAccount")}{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    {t("signup.links.signIn")}
                  </Link>
                </p>
              )}
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
  );
};

export default EmailSignup;
