import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TermsStepProps {
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onNext: () => void;
}

export const TermsStep: React.FC<TermsStepProps> = ({
  termsAccepted,
  onTermsChange,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Termos e Condições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg max-h-48 overflow-y-auto text-sm text-muted-foreground">
            <h4 className="font-semibold text-foreground mb-2">Política de Privacidade</h4>
            <p className="mb-3">
              Seus dados pessoais serão utilizados exclusivamente para processar sua compra 
              e fornecer os serviços relacionados ao evento. Não compartilhamos suas informações 
              com terceiros sem seu consentimento.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">Termos de Serviço</h4>
            <p className="mb-3">
              Ao prosseguir com a compra, você concorda com nossos termos de serviço. 
              Os ingressos são intransferíveis e não reembolsáveis, exceto em caso de 
              cancelamento do evento pelos organizadores.
            </p>
            
            <p>
              Para mais informações, consulte nossa política completa em nosso site.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsChange(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-foreground leading-relaxed">
              Eu li e concordo com os{' '}
              <span className="text-primary underline cursor-pointer">Termos de Serviço</span>{' '}
              e a{' '}
              <span className="text-primary underline cursor-pointer">Política de Privacidade</span>
            </label>
          </div>

          <Button
            onClick={onNext}
            disabled={!termsAccepted}
            className="w-full lg:hidden"
            size="lg"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};