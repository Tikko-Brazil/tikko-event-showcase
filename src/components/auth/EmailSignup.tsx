import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import InputMask from 'react-input-mask';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

// Phone mask for any country code
const PHONE_MASK = "+99 (99) 99999-9999";

const validateMobileNumber = (mobileNumber: string) => {
  if (!mobileNumber) {
    return { isValid: false, errorMessage: "Phone number is required" };
  }

  const cleanValue = mobileNumber.replace(/[()\s-]/g, "");

  if (!cleanValue.startsWith("+")) {
    return {
      isValid: false,
      errorMessage: "Phone number must start with country code (+)",
    };
  }

  if (cleanValue.length < 8) {
    return { isValid: false, errorMessage: "Invalid phone number" };
  }

  return { isValid: true, errorMessage: "" };
};

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  fullName: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  gender: Yup.string()
    .required('Gender is required'),
  birthdate: Yup.date()
    .max(new Date(Date.now() - 568025136000), 'You must be at least 18 years old')
    .required('Birth date is required'),
  phone: Yup.string()
    .test('phone-validation', (value, context) => {
      const result = validateMobileNumber(value || '');
      return result.isValid
        ? true
        : context.createError({ message: result.errorMessage });
    })
    .required('Phone number is required'),
  instagram: Yup.string()
    .transform((value) => value?.replace('@', '') || '')
    .required('Instagram username is required'),
  bio: Yup.string()
    .max(500, 'Bio must be less than 500 characters')
    .required('Bio is required'),
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
    : { 
        email: '', 
        fullName: '', 
        password: '', 
        confirmPassword: '', 
        gender: '', 
        birthdate: '', 
        phone: '', 
        instagram: '', 
        bio: '' 
      };

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
          {({ isSubmitting, errors, touched, values, handleChange, handleBlur, setFieldValue }) => (
            <Form className="space-y-4">
              {!isPasswordReset && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
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

                    <div className="md:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Field
                        as={Input}
                        id="fullName"
                        name="fullName"
                        placeholder="Your full name"
                        className={errors.fullName && touched.fullName ? 'border-destructive' : ''}
                      />
                      <ErrorMessage name="fullName" component="p" className="text-sm text-destructive" />
                    </div>

                    <div>
                      <Label>Gender *</Label>
                      <RadioGroup
                        value={values.gender}
                        onValueChange={(value) => setFieldValue('gender', value)}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="gender-other" />
                          <Label htmlFor="gender-other">Other</Label>
                        </div>
                      </RadioGroup>
                      <ErrorMessage name="gender" component="p" className="text-sm text-destructive" />
                    </div>

                    <div>
                      <Label htmlFor="birthdate">Birth Date *</Label>
                      <InputMask
                        mask="99/99/9999"
                        value={values.birthdate}
                        onChange={handleChange('birthdate')}
                        onBlur={handleBlur('birthdate')}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="birthdate"
                            placeholder="dd/mm/yyyy"
                            className={errors.birthdate && touched.birthdate ? 'border-destructive' : ''}
                          />
                        )}
                      </InputMask>
                      <ErrorMessage name="birthdate" component="p" className="text-sm text-destructive" />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <InputMask
                        mask={PHONE_MASK}
                        value={values.phone}
                        onChange={handleChange('phone')}
                        onBlur={handleBlur('phone')}
                        beforeMaskedStateChange={({ nextState }) => {
                          if (nextState.value.length < 2) {
                            return { ...nextState, value: '+' };
                          }
                          return nextState;
                        }}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            className={errors.phone && touched.phone ? 'border-destructive' : ''}
                          />
                        )}
                      </InputMask>
                      <ErrorMessage name="phone" component="p" className="text-sm text-destructive" />
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram Username *</Label>
                      <Field
                        as={Input}
                        id="instagram"
                        name="instagram"
                        placeholder="your_username"
                        className={errors.instagram && touched.instagram ? 'border-destructive' : ''}
                      />
                      <ErrorMessage name="instagram" component="p" className="text-sm text-destructive" />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio *</Label>
                      <Field
                        as={Textarea}
                        id="bio"
                        name="bio"
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className={errors.bio && touched.bio ? 'border-destructive' : ''}
                      />
                      <ErrorMessage name="bio" component="p" className="text-sm text-destructive" />
                    </div>
                  </div>
                </>
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

              {!isPasswordReset && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in
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