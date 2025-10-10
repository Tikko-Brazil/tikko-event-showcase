import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
import { AuthGateway } from "@/lib/AuthGateway";
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
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const authGateway = new AuthGateway(import.meta.env.VITE_BACKEND_BASE_URL);
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
              await authGateway.forgotPassword({ email: values.email });
              setSuccessMessage(
                "Código de redefinição enviado para seu email!"
              );
              setShowSuccess(true);
              setTimeout(() => onNext(values.email), 2000);
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
