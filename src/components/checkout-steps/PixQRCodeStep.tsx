import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PixQRCodeStepProps {
  ticketType: string;
  payerEmail: string;
  onClose: () => void;
}

export const PixQRCodeStep: React.FC<PixQRCodeStepProps> = ({
  ticketType,
  payerEmail,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [copied, setCopied] = useState(false);

  // Fake PIX code for demonstration
  const pixCode = "00020126580014br.gov.bcb.pix0136a123b456-c789-d012-e345-f678901234560204000053039865802BR5925EVENTO TICKET PAGAMENTO6009SAO PAULO62070503***63041234";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-32 lg:pb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Pagamento via PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Código válido por:
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div
                className="w-64 h-64 bg-cover bg-center rounded"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23000' width='200' height='200'/%3E%3Crect fill='%23fff' x='10' y='10' width='30' height='30'/%3E%3Crect fill='%23fff' x='50' y='10' width='10' height='10'/%3E%3Crect fill='%23fff' x='70' y='10' width='20' height='10'/%3E%3Crect fill='%23fff' x='100' y='10' width='10' height='20'/%3E%3Crect fill='%23fff' x='120' y='10' width='20' height='10'/%3E%3Crect fill='%23fff' x='150' y='10' width='10' height='10'/%3E%3Crect fill='%23fff' x='160' y='10' width='30' height='30'/%3E%3Crect fill='%23fff' x='10' y='50' width='10' height='10'/%3E%3Crect fill='%23fff' x='30' y='50' width='10' height='10'/%3E%3Crect fill='%23fff' x='50' y='50' width='20' height='10'/%3E%3Crect fill='%23fff' x='80' y='50' width='10' height='10'/%3E%3Crect fill='%23fff' x='100' y='50' width='20' height='10'/%3E%3Crect fill='%23fff' x='130' y='50' width='20' height='10'/%3E%3Crect fill='%23fff' x='160' y='50' width='10' height='10'/%3E%3Crect fill='%23fff' x='180' y='50' width='10' height='10'/%3E%3Crect fill='%23fff' x='10' y='70' width='10' height='20'/%3E%3Crect fill='%23fff' x='30' y='70' width='10' height='10'/%3E%3Crect fill='%23fff' x='50' y='70' width='10' height='10'/%3E%3Crect fill='%23fff' x='70' y='70' width='20' height='20'/%3E%3Crect fill='%23fff' x='100' y='70' width='10' height='10'/%3E%3Crect fill='%23fff' x='120' y='70' width='10' height='20'/%3E%3Crect fill='%23fff' x='140' y='70' width='10' height='10'/%3E%3Crect fill='%23fff' x='160' y='70' width='10' height='20'/%3E%3Crect fill='%23fff' x='180' y='70' width='10' height='10'/%3E%3Crect fill='%23fff' x='10' y='100' width='10' height='10'/%3E%3Crect fill='%23fff' x='30' y='100' width='10' height='10'/%3E%3Crect fill='%23fff' x='50' y='100' width='40' height='10'/%3E%3Crect fill='%23fff' x='100' y='100' width='30' height='10'/%3E%3Crect fill='%23fff' x='140' y='100' width='10' height='10'/%3E%3Crect fill='%23fff' x='160' y='100' width='10' height='10'/%3E%3Crect fill='%23fff' x='180' y='100' width='10' height='10'/%3E%3Crect fill='%23fff' x='10' y='120' width='30' height='10'/%3E%3Crect fill='%23fff' x='50' y='120' width='10' height='10'/%3E%3Crect fill='%23fff' x='70' y='120' width='20' height='10'/%3E%3Crect fill='%23fff' x='100' y='120' width='10' height='10'/%3E%3Crect fill='%23fff' x='120' y='120' width='20' height='10'/%3E%3Crect fill='%23fff' x='150' y='120' width='10' height='10'/%3E%3Crect fill='%23fff' x='160' y='120' width='30' height='10'/%3E%3Crect fill='%23fff' x='10' y='140' width='10' height='10'/%3E%3Crect fill='%23fff' x='30' y='140' width='10' height='10'/%3E%3Crect fill='%23fff' x='50' y='140' width='20' height='10'/%3E%3Crect fill='%23fff' x='80' y='140' width='30' height='10'/%3E%3Crect fill='%23fff' x='120' y='140' width='10' height='10'/%3E%3Crect fill='%23fff' x='140' y='140' width='20' height='10'/%3E%3Crect fill='%23fff' x='170' y='140' width='10' height='10'/%3E%3Crect fill='%23fff' x='10' y='160' width='30' height='30'/%3E%3Crect fill='%23fff' x='50' y='160' width='10' height='10'/%3E%3Crect fill='%23fff' x='70' y='160' width='10' height='20'/%3E%3Crect fill='%23fff' x='90' y='160' width='20' height='10'/%3E%3Crect fill='%23fff' x='120' y='160' width='10' height='20'/%3E%3Crect fill='%23fff' x='140' y='160' width='20' height='10'/%3E%3Crect fill='%23fff' x='160' y='160' width='30' height='30'/%3E%3C/svg%3E")`,
                }}
              />
            </div>
          </div>

          {/* PIX Code */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Ou copie o código PIX:
            </p>
            <div className="bg-muted rounded-lg p-3 break-all text-sm font-mono text-foreground">
              {pixCode}
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="w-full"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Código Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Código
                </>
              )}
            </Button>
          </div>

          {/* Order Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ingresso:</span>
              <span className="font-medium text-foreground">{ticketType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">E-mail do Pagador:</span>
              <span className="font-medium text-foreground">{payerEmail}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-foreground">
              Como pagar:
            </h4>
            <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full" size="lg">
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
