import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowLeft, Home } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import logoLight from "@/assets/logoLight.png";
import EmailSignup from "@/components/auth/EmailSignup";
import EmailLogin from "@/components/auth/EmailLogin";
import VerificationScreen from "@/components/auth/VerificationScreen";
import ForgotPassword from "@/components/auth/ForgotPassword";
import { AuthGateway } from "@/lib/AuthGateway";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import SuccessSnackbar from "@/components/SuccessSnackbar";

export type AuthScreen =
  | "entry"
  | "signup"
  | "login"
  | "verification"
  | "forgot-password"
  | "reset-code"
  | "new-password";

const Auth = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("entry");
  const [userEmail, setUserEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  const authGateway = new AuthGateway(import.meta.env.VITE_BACKEND_BASE_URL);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setCurrentScreen("new-password");
    }
  }, [searchParams]);

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const redirectUri = `${window.location.origin}${
      import.meta.env.VITE_PUBLIC_GOOGLE_REDIRECT_ROUTE || "/login"
    }`;

    sessionStorage.setItem("codeVerifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const exchangeCodeWithBackend = async (code: string) => {
    const codeVerifier = sessionStorage.getItem("codeVerifier");
    const redirectUri = `${window.location.origin}${
      import.meta.env.VITE_PUBLIC_GOOGLE_REDIRECT_ROUTE || "/login"
    }`;

    try {
      const data = await authGateway.exchange({
        code,
        redirectUri,
        codeVerifier: codeVerifier || "",
        identity_provider: "google",
      });

      localStorage.setItem("accessToken", data.token_pair.access_token);
      localStorage.setItem("refreshToken", data.token_pair.refresh_token);

      sessionStorage.removeItem("codeVerifier");

      if (data.user.is_first_access) {
        localStorage.setItem("isFirstAccess", "true");
        window.location.href = "/profile-completion";
      } else {
        window.location.href = "/feed";
      }
    } catch (error: any) {
      console.error("OAuth exchange failed:", error);
      setErrorMessage(`Authentication failed: ${error.message}`);
      setShowError(true);
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      setErrorMessage("Authentication failed");
      setShowError(true);
      setIsGoogleLoading(false);
      return;
    }

    if (code) {
      exchangeCodeWithBackend(code);
    }
  }, []);

  const handleBack = () => {
    switch (currentScreen) {
      case "signup":
      case "login":
        setCurrentScreen("entry");
        break;
      case "verification":
        setCurrentScreen("signup");
        break;
      case "forgot-password":
        setCurrentScreen("login");
        break;
      case "reset-code":
      case "new-password":
        setCurrentScreen("forgot-password");
        break;
      default:
        setCurrentScreen("entry");
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "entry":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <img src={logoLight} alt="Tikko" className="h-12 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">
                Welcome to Tikko
              </CardTitle>
              <CardDescription>Your gateway to amazing events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setCurrentScreen("signup")}
                className="w-full h-12 text-lg"
                size="lg"
              >
                Create Account
              </Button>
              <Button
                onClick={() => setCurrentScreen("login")}
                variant="outline"
                className="w-full h-12 text-lg"
                size="lg"
              >
                Sign In
              </Button>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-muted-foreground text-sm">
                  or
                </span>
              </div>

              <Button
                onClick={handleGoogleAuth}
                variant="outline"
                className="w-full h-12 text-lg"
                size="lg"
                disabled={isGoogleLoading}
              >
                <Mail className="mr-2 h-5 w-5" />
                {isGoogleLoading ? "Signing in..." : "Continue with Google"}
              </Button>
            </CardContent>
          </Card>
        );

      case "signup":
        return (
          <EmailSignup
            onNext={(email) => {
              setUserEmail(email);
              setCurrentScreen("verification");
            }}
            onBack={handleBack}
          />
        );

      case "login":
        return (
          <EmailLogin
            onForgotPassword={() => setCurrentScreen("forgot-password")}
            onBack={handleBack}
          />
        );

      case "verification":
        return (
          <VerificationScreen
            email={userEmail}
            onSuccess={() => {
              setSuccessMessage("Email verificado com sucesso!");
              setShowSuccess(true);
              setTimeout(() => (window.location.href = "/"), 2000);
            }}
            onBack={handleBack}
          />
        );

      case "forgot-password":
        return (
          <ForgotPassword
            onNext={(email) => {
              setUserEmail(email);
              setCurrentScreen("reset-code");
            }}
            onBack={handleBack}
          />
        );

      case "reset-code":
        return (
          <VerificationScreen
            email={userEmail}
            title="Enter Reset Code"
            description="We've sent a reset code to your email"
            onSuccess={() => setCurrentScreen("new-password")}
            onBack={handleBack}
            isResetFlow={true}
          />
        );

      case "new-password":
        return (
          <EmailSignup
            isPasswordReset={true}
            resetToken={searchParams.get("token") || ""}
            onNext={() => {
              setSuccessMessage("Senha atualizada com sucesso!");
              setShowSuccess(true);
              setTimeout(() => setCurrentScreen("login"), 2000);
            }}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          {currentScreen !== "entry" ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="hover:bg-accent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div></div>
          )}
          <Button variant="ghost" asChild className="hover:bg-accent">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
        {renderScreen()}
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

export default Auth;
