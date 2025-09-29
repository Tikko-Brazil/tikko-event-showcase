import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email("E-mail inválido")
    .required("Este campo é obrigatório"),
  fullName: Yup.string()
    .required("Este campo é obrigatório")
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "Por favor, insira um nome válido")
    .test("at-least-two-words", "Digite seu nome e sobrenome", (value) => {
      if (!value) return false;
      const words = value.trim().split(/\s+/);
      return words.length >= 2;
    }),
  password: Yup.string()
    .required("Este campo é obrigatório")
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .matches(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .matches(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .matches(/[0-9]/, "A senha deve conter pelo menos um número")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "A senha deve conter pelo menos um caractere especial (Ex: !@#$%^&*()_+)"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não conferem")
    .required("Este campo é obrigatório"),
  gender: Yup.string().required("Este campo é obrigatório"),
  birthdate: Yup.date()
    .max(
      new Date(Date.now() - 568025136000),
      "Você deve ter pelo menos 18 anos"
    )
    .required("Data de nascimento é obrigatória"),
  phone: Yup.string()
    .test("phone-validation", (value, context) => {
      const result = validateMobileNumber(value || "");
      return result.isValid
        ? true
        : context.createError({ message: result.errorMessage });
    })
    .required("Telefone é obrigatório"),
  instagram: Yup.string()
    .matches(/^[^@]+$/, "Não é necessário incluir o '@'")
    .matches(
      /^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/,
      "Conta inválida: deve possuir entre 3 e 30 caracteres, e só deve possuir letras, números, '.' ou '_'"
    )
    .required("Este campo é obrigatório"),
  bio: Yup.string()
    .max(500, "Bio deve ter menos de 500 caracteres")
    .required("Bio é obrigatória"),
});

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
}

const EmailSignup: React.FC<EmailSignupProps> = ({
  onNext,
  onBack,
  isPasswordReset = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

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

  const validationSchema = isPasswordReset ? passwordResetSchema : signupSchema;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isPasswordReset ? "Definir Nova Senha" : "Criar Conta"}
        </CardTitle>
        <CardDescription>
          {isPasswordReset
            ? "Digite sua nova senha abaixo"
            : "Preencha seus dados para começar"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              console.log("Form submitted:", values);
              setSubmitting(false);
              onNext(isPasswordReset ? undefined : (values as any).email);
            }, 400);
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
                      <Label>Gênero *</Label>
                      <RadioGroup
                        value={values.gender}
                        onValueChange={(value) =>
                          setFieldValue("gender", value)
                        }
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
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
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
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
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
                  ? isPasswordReset
                    ? "Atualizando..."
                    : "Criando Conta..."
                  : isPasswordReset
                  ? "Atualizar Senha"
                  : "Criar Conta"}
              </Button>

              {!isPasswordReset && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Já tem uma conta?{" "}
                  <Link to="/auth" className="text-primary hover:underline">
                    Entrar
                  </Link>
                </p>
              )}
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default EmailSignup;
