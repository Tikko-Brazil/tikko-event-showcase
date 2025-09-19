import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

interface ForgotPasswordProps {
  onNext: (email: string) => void;
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNext, onBack }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a reset code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              console.log('Password reset requested for:', values.email);
              setSubmitting(false);
              onNext(values.email);
            }, 400);
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
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

              <Button 
                type="submit" 
                className="w-full h-12 text-lg mt-6" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Sending Reset Code...' : 'Send Reset Code'}
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;