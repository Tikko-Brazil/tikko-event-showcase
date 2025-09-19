import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const passwordResetSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface EmailSignupProps {
  onNext: (email?: string) => void;
  onBack: () => void;
  isPasswordReset?: boolean;
}

const EmailSignup: React.FC<EmailSignupProps> = ({ onNext, onBack, isPasswordReset = false }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const initialValues = isPasswordReset 
    ? { password: '', confirmPassword: '' }
    : { email: '', password: '', confirmPassword: '' };

  const validationSchema = isPasswordReset ? passwordResetSchema : signupSchema;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isPasswordReset ? 'Set New Password' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {isPasswordReset 
            ? 'Enter your new password below'
            : 'Fill in your details to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              console.log('Form submitted:', values);
              setSubmitting(false);
              onNext(isPasswordReset ? undefined : (values as any).email);
            }, 400);
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              {!isPasswordReset && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className={errors.email && touched.email ? 'border-destructive' : ''}
                  />
                  <ErrorMessage name="email" component="p" className="text-sm text-destructive" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`pr-10 ${errors.password && touched.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className={`pr-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="p" className="text-sm text-destructive" />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg mt-6" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting 
                  ? (isPasswordReset ? 'Updating...' : 'Creating Account...') 
                  : (isPasswordReset ? 'Update Password' : 'Create Account')
                }
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default EmailSignup;