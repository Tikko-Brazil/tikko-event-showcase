import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import QRCodeCanvas from "react-qrcode-logo";
import markLogo from "@/assets/mark.png";

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
  const pixCode =
    "00020126580014br.gov.bcb.pix0136a123b456-c789-d012-e345-f678901234560204000053039865802BR5925EVENTO TICKET PAGAMENTO6009SAO PAULO62070503***63041234";

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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">
            Pagamento via PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer */}
          <div className="bg-muted/50 rounded-lg p-2 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Código válido por:
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-lg shadow-md">
              <QRCodeCanvas
                value={pixCode}
                size={176}
                logoImage={markLogo}
                logoWidth={40}
                logoHeight={40}
                logoOpacity={1}
                quietZone={0}
                removeQrCodeBehindLogo={true}
                qrStyle="squares"
                eyeRadius={{ outer: 4, inner: 4 }}
                eyeColor={{
                  outer: "hsl(215 28% 17%)",
                  inner: "hsl(263 70% 50%)",
                }}
              />
            </div>
          </div>

          {/* PIX Code */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Ou copie o código PIX:
            </p>
            <div className="bg-muted rounded-lg p-2 break-all text-xs font-mono text-foreground max-h-16 overflow-y-auto">
              {pixCode}
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="w-full"
              size="sm"
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

          {/* Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
            <h4 className="font-semibold text-xs mb-1 text-foreground">
              Como pagar:
            </h4>
            <ol className="text-xs space-y-0.5 text-muted-foreground list-decimal list-inside">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full mb-8">
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
