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
import { useForgotPassword } from "@/api/auth/api";
import { forgotPasswordErrorMessage } from "@/api/auth/errors";
import { AppError } from "@/api/errors";
import { toast } from "@/hooks/use-toast";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import SuccessSnackbar from "@/components/SuccessSnackbar";

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
});

interface ForgotPasswordProps {
  onNext: (email: string) => void;
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const { mutateAsync: forgotPassword } = useForgotPassword();
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
        <CardDescription>
          Digite seu email e enviaremos um código de redefinição
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ email: "" }}
          validationSchema={forgotPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await forgotPassword({ email: values.email });
              setSuccessMessage(
                t('forgotPassword.success')
              );
              setShowSuccess(true);
            } catch (error) {
              const message = forgotPasswordErrorMessage(error as AppError, t);
              toast({ variant: "destructive", description: message });
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

              <Button
                type="submit"
                className="w-full h-12 text-lg mt-6"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Enviando Código..." : "Enviar Código"}
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
  );
};

export default ForgotPassword;
