import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

interface SuccessStepProps {
  onClose: () => void;
  autoAccept?: boolean;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({
  onClose,
  autoAccept = true,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                autoAccept ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              {autoAccept ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Clock className="w-8 h-8 text-yellow-600" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {autoAccept ? "Compra Realizada!" : "Solicitação Enviada!"}
            </h2>
            <p className="text-muted-foreground">
              {autoAccept
                ? "Seu ingresso foi emitido com sucesso. Você receberá um email e WhatsApp com todas as informações."
                : "Sua solicitação de participação foi recebida. Assim que o organizador aceitar, você receberá o ingresso por email e WhatsApp. Em caso de rejeição, o valor será reembolsado automaticamente em até 5 dias úteis."}
            </p>
          </div>

          <Button onClick={onClose} className="w-full" size="lg">
            Voltar ao Evento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
