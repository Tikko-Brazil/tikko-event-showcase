import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoLight from '@/assets/logoLight.png';
import EmailSignup from '@/components/auth/EmailSignup';
import EmailLogin from '@/components/auth/EmailLogin';
import VerificationScreen from '@/components/auth/VerificationScreen';
import ForgotPassword from '@/components/auth/ForgotPassword';

export type AuthScreen = 'entry' | 'signup' | 'login' | 'verification' | 'forgot-password' | 'reset-code' | 'new-password';

const Auth = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('entry');
  const [userEmail, setUserEmail] = useState('');

  const handleGoogleAuth = () => {
    console.log('Google authentication clicked');
    // Mock success - in real app this would handle OAuth
    alert('Google authentication would be handled here');
  };

  const handleBack = () => {
    switch (currentScreen) {
      case 'signup':
      case 'login':
        setCurrentScreen('entry');
        break;
      case 'verification':
        setCurrentScreen('signup');
        break;
      case 'forgot-password':
        setCurrentScreen('login');
        break;
      case 'reset-code':
      case 'new-password':
        setCurrentScreen('forgot-password');
        break;
      default:
        setCurrentScreen('entry');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'entry':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <img src={logoLight} alt="Tikko" className="h-12 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">Welcome to Tikko</CardTitle>
              <CardDescription>Your gateway to amazing events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setCurrentScreen('signup')} 
                className="w-full h-12 text-lg"
                size="lg"
              >
                Create Account
              </Button>
              <Button 
                onClick={() => setCurrentScreen('login')} 
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
              >
                <Mail className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        );

      case 'signup':
        return (
          <EmailSignup 
            onNext={(email) => {
              setUserEmail(email);
              setCurrentScreen('verification');
            }}
            onBack={handleBack}
          />
        );

      case 'login':
        return (
          <EmailLogin 
            onForgotPassword={() => setCurrentScreen('forgot-password')}
            onBack={handleBack}
          />
        );

      case 'verification':
        return (
          <VerificationScreen 
            email={userEmail}
            onSuccess={() => {
              alert('Email verified successfully!');
              window.location.href = '/';
            }}
            onBack={handleBack}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPassword
            onNext={(email) => {
              setUserEmail(email);
              setCurrentScreen('reset-code');
            }}
            onBack={handleBack}
          />
        );

      case 'reset-code':
        return (
          <VerificationScreen 
            email={userEmail}
            title="Enter Reset Code"
            description="We've sent a reset code to your email"
            onSuccess={() => setCurrentScreen('new-password')}
            onBack={handleBack}
            isResetFlow={true}
          />
        );

      case 'new-password':
        return (
          <EmailSignup 
            isPasswordReset={true}
            onNext={() => {
              alert('Password updated successfully!');
              window.location.href = '/';
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
          {currentScreen !== 'entry' ? (
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
          <Button
            variant="ghost"
            asChild
            className="hover:bg-accent"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
        {renderScreen()}
      </div>
    </div>
  );
};

export default Auth;