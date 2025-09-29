import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthGateway } from '@/lib/AuthGateway';
import ErrorSnackbar from '@/components/ErrorSnackbar';
import SuccessSnackbar from '@/components/SuccessSnackbar';

interface VerificationScreenProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  title?: string;
  description?: string;
  isResetFlow?: boolean;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ 
  email, 
  onSuccess, 
  onBack, 
  title,
  description,
  isResetFlow = false
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const authGateway = new AuthGateway('http://localhost:3000');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit) && newCode.join('').length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    if (codeToVerify.length !== 6) return;

    setIsVerifying(true);
    try {
      const response = await authGateway.verify({
        email,
        code: codeToVerify,
      });
      
      localStorage.setItem('accessToken', response.token_pair.access_token);
      localStorage.setItem('refreshToken', response.token_pair.refresh_token);
      
      onSuccess();
    } catch (error: any) {
      setErrorMessage(error.message);
      setShowError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await authGateway.regenerateCode({ email });
      setCountdown(response.next_regenerate_in || 60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      setSuccessMessage('Código reenviado para seu email!');
      setShowSuccess(true);
      document.getElementById('code-0')?.focus();
    } catch (error: any) {
      setErrorMessage(error.message);
      setShowError(true);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {title || 'Verifique seu Email'}
        </CardTitle>
        <CardDescription>
          {description || `Enviamos um código de 6 dígitos para ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Código de Verificação</Label>
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-mono"
                aria-label={`Dígito ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={() => handleVerify()}
          className="w-full h-12 text-lg"
          disabled={code.join('').length !== 6 || isVerifying}
          size="lg"
        >
          {isVerifying ? 'Verificando...' : (isResetFlow ? 'Verificar Código' : 'Verificar Email')}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Não recebeu o código?
          </p>
          <Button
            variant="link"
            onClick={handleResendCode}
            disabled={!canResend}
            className="text-sm p-0 h-auto"
          >
            {canResend ? 'Reenviar Código' : `Reenviar em ${countdown}s`}
          </Button>
        </div>
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

export default VerificationScreen;