import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Download, Mail } from 'lucide-react';

interface SuccessStepProps {
  onClose: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
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

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              Número do Pedido
            </div>
            <div className="font-mono text-lg font-semibold">
              #TKK{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Simulate download
                alert('Download do ingresso iniciado!');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Ingresso
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Simulate email
                alert('Email enviado!');
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Reenviar por Email
            </Button>

            <Button
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              Voltar ao Evento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};