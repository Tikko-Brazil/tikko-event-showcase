import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
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
import { Eye, EyeOff } from "lucide-react";
import { AuthGateway } from "@/lib/AuthGateway";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import { createCommonValidations } from "@/lib/validationSchemas";

interface EmailLoginProps {
  onForgotPassword: () => void;
  onBack: () => void;
}

const EmailLogin: React.FC<EmailLoginProps> = ({
  onForgotPassword,
  onBack,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);

  const authGateway = new AuthGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  const commonValidations = createCommonValidations(t);
  const loginSchema = Yup.object().shape({
    email: commonValidations.email,
    password: Yup.string().required(t("validation.required")),
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Bem-vindo de Volta</CardTitle>
        <CardDescription>Entre na sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const response = await authGateway.login({
                email: values.email,
                password: values.password,
              });

              localStorage.setItem(
                "accessToken",
                response.token_pair.access_token
              );
              localStorage.setItem(
                "refreshToken",
                response.token_pair.refresh_token
              );

              window.location.href = "/explore";
            } catch (error: any) {
              setErrorMessage(error.message);
              setShowError(true);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  className={
                    errors.email && touched.email ? "border-destructive" : ""
                  }
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-destructive text-sm mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
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

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  onClick={onForgotPassword}
                  className="text-sm p-0 h-auto text-primary hover:text-primary/80"
                >
                  Esqueceu a senha?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg mt-6"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
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
    </Card>
  );
};

export default EmailLogin;
