import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import InputMask from 'react-input-mask';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserData } from '../CheckoutOverlay';

interface UserInfoStepProps {
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
  onNext: () => void;
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .required('Nome completo é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  phone: Yup.string()
    .test('phone-validation', 'Telefone inválido', function(value) {
      if (!value) return false;
      if (value.startsWith('+55')) {
        return value.length >= 17; // Brazilian format validation
      }
      return value.length >= 8; // International format - minimum 8 chars
    })
    .required('Telefone é obrigatório'),
  identification: Yup.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .required('CPF é obrigatório'),
  birthdate: Yup.date()
    .max(new Date(Date.now() - 568025136000), 'Você deve ter pelo menos 18 anos')
    .required('Data de nascimento é obrigatória'),
  instagram: Yup.string()
    .transform((value) => value?.replace('@', '') || '')
    .required('Instagram é obrigatório')
});

export const UserInfoStep: React.FC<UserInfoStepProps> = ({
  userData,
  onUserDataChange,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={userData}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              onUserDataChange(values);
              onNext();
            }}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Field
                      as={Input}
                      id="fullName"
                      name="fullName"
                      placeholder="Seu nome completo"
                      className={errors.fullName && touched.fullName ? 'border-destructive' : ''}
                    />
                    <ErrorMessage name="fullName" component="div" className="text-destructive text-sm mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className={errors.email && touched.email ? 'border-destructive' : ''}
                    />
                    <ErrorMessage name="email" component="div" className="text-destructive text-sm mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    {values.phone.startsWith('+55') ? (
                      <InputMask
                        mask="+55 (99) 99999-9999"
                        value={values.phone}
                        onChange={(e) => setFieldValue('phone', e.target.value)}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="phone"
                            placeholder="+55 (11) 99999-9999"
                            className={errors.phone && touched.phone ? 'border-destructive' : ''}
                          />
                        )}
                      </InputMask>
                    ) : (
                      <Input
                        id="phone"
                        value={values.phone}
                        onChange={(e) => setFieldValue('phone', e.target.value)}
                        placeholder="+1 555 123-4567"
                        className={errors.phone && touched.phone ? 'border-destructive' : ''}
                      />
                    )}
                    <ErrorMessage name="phone" component="div" className="text-destructive text-sm mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite o código do país + número (ex: +55 para Brasil, +1 para EUA)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="identification">CPF *</Label>
                    <InputMask
                      mask="999.999.999-99"
                      value={values.identification}
                      onChange={(e) => setFieldValue('identification', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="identification"
                          placeholder="000.000.000-00"
                          className={errors.identification && touched.identification ? 'border-destructive' : ''}
                        />
                      )}
                    </InputMask>
                    <ErrorMessage name="identification" component="div" className="text-destructive text-sm mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="birthdate">Data de Nascimento *</Label>
                    <InputMask
                      mask="99/99/9999"
                      value={values.birthdate}
                      onChange={(e) => setFieldValue('birthdate', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="birthdate"
                          placeholder="dd/mm/aaaa"
                          className={errors.birthdate && touched.birthdate ? 'border-destructive' : ''}
                        />
                      )}
                    </InputMask>
                    <ErrorMessage name="birthdate" component="div" className="text-destructive text-sm mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram *</Label>
                    <Field
                      as={Input}
                      id="instagram"
                      name="instagram"
                      placeholder="seu_usuario"
                      className={errors.instagram && touched.instagram ? 'border-destructive' : ''}
                    />
                    <ErrorMessage name="instagram" component="div" className="text-destructive text-sm mt-1" />
                  </div>
                </div>

              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};