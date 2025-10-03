import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface SuccessStepProps {
  onClose: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Compra Realizada!</h2>
            <p className="text-muted-foreground">
              Seu ingresso foi emitido com sucesso. Em breve você receberá 
              um email com todas as informações.
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full"
            size="lg"
          >
            Voltar ao Evento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};