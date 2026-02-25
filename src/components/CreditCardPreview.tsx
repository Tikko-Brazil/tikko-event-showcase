import React from "react";
import { CardBrandInfo } from "@/lib/cardUtils";
import { CreditCard, Wifi } from "lucide-react";

interface CreditCardPreviewProps {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  brand: CardBrandInfo;
  isFlipped: boolean;
  cvv: string;
}

const CardBrandLogo: React.FC<{ brand: CardBrandInfo }> = ({ brand }) => {
  if (brand.brand === "unknown") return null;

  const logos: Record<string, React.ReactNode> = {
    visa: (
      <span className="font-bold text-xl tracking-wider italic text-white">VISA</span>
    ),
    mastercard: (
      <div className="flex items-center -space-x-2">
        <div className="w-7 h-7 rounded-full bg-red-500 opacity-80" />
        <div className="w-7 h-7 rounded-full bg-yellow-500 opacity-80" />
      </div>
    ),
    amex: (
      <span className="font-bold text-sm tracking-wider text-white">AMEX</span>
    ),
    elo: (
      <span className="font-bold text-sm tracking-wider text-yellow-400">elo</span>
    ),
    hipercard: (
      <span className="font-bold text-xs tracking-wider text-white">HIPERCARD</span>
    ),
    diners: (
      <span className="font-bold text-xs tracking-wider text-white">DINERS</span>
    ),
    discover: (
      <span className="font-bold text-xs tracking-wider text-orange-400">DISCOVER</span>
    ),
    jcb: (
      <span className="font-bold text-xs tracking-wider text-white">JCB</span>
    ),
  };

  return logos[brand.brand] || null;
};

const CardBrandIcon: React.FC<{ brand: CardBrandInfo; size?: "sm" | "md" }> = ({ brand, size = "md" }) => {
  if (brand.brand === "unknown") return null;

  const sizeClass = size === "sm" ? "scale-75" : "";

  const icons: Record<string, React.ReactNode> = {
    visa: <span className={`font-bold text-sm italic text-blue-700 ${sizeClass}`}>VISA</span>,
    mastercard: (
      <div className={`flex items-center -space-x-1.5 ${sizeClass}`}>
        <div className="w-5 h-5 rounded-full bg-red-500 opacity-80" />
        <div className="w-5 h-5 rounded-full bg-yellow-500 opacity-80" />
      </div>
    ),
    amex: <span className={`font-bold text-xs text-blue-600 ${sizeClass}`}>AMEX</span>,
    elo: <span className={`font-bold text-xs text-yellow-500 ${sizeClass}`}>elo</span>,
    hipercard: <span className={`font-bold text-[10px] text-red-600 ${sizeClass}`}>HIPER</span>,
    diners: <span className={`font-bold text-[10px] text-blue-700 ${sizeClass}`}>DINERS</span>,
    discover: <span className={`font-bold text-[10px] text-orange-500 ${sizeClass}`}>DISC</span>,
    jcb: <span className={`font-bold text-[10px] text-green-600 ${sizeClass}`}>JCB</span>,
  };

  return <>{icons[brand.brand] || null}</>;
};

export { CardBrandIcon };

export const CreditCardPreview: React.FC<CreditCardPreviewProps> = ({
  cardNumber,
  cardholderName,
  expiry,
  brand,
  isFlipped,
  cvv,
}) => {
  const displayNumber = cardNumber || "•••• •••• •••• ••••";
  const displayName = cardholderName || "SEU NOME AQUI";
  const displayExpiry = expiry || "MM/YY";

  return (
    <div className="perspective-1000 w-full max-w-[380px] mx-auto mb-6">
      <div
        className={`relative w-full aspect-[1.586/1] transition-transform duration-700 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-br ${brand.gradientFrom} ${brand.gradientTo} shadow-elegant overflow-hidden`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
          </div>

          {/* Top row - chip & contactless & brand */}
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              {/* Chip */}
              <div className="w-10 h-7 sm:w-12 sm:h-8 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner flex items-center justify-center">
                <div className="w-7 h-5 sm:w-9 sm:h-6 rounded-sm border border-yellow-600/30 grid grid-cols-3 gap-px">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-yellow-600/20 rounded-[1px]" />
                  ))}
                </div>
              </div>
              <Wifi className="w-5 h-5 text-white/60 rotate-90" />
            </div>
            <CardBrandLogo brand={brand} />
          </div>

          {/* Card number */}
          <div className="relative z-10">
            <p className="text-white text-lg sm:text-xl font-mono tracking-[0.2em] drop-shadow-md">
              {displayNumber}
            </p>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
                Card Holder
              </p>
              <p className="text-white text-xs sm:text-sm font-medium tracking-wider uppercase truncate max-w-[200px]">
                {displayName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
                Valid Thru
              </p>
              <p className="text-white text-xs sm:text-sm font-mono">
                {displayExpiry}
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl flex flex-col justify-between bg-gradient-to-br ${brand.gradientFrom} ${brand.gradientTo} shadow-elegant overflow-hidden`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Magnetic stripe */}
          <div className="w-full h-12 bg-black/70 mt-6" />

          {/* CVV area */}
          <div className="px-6 flex flex-col items-end gap-1">
            <p className="text-white/50 text-[10px] uppercase tracking-wider">
              CVV
            </p>
            <div className="w-full h-9 bg-white/90 rounded flex items-center justify-end px-4">
              <span className="text-black font-mono text-sm tracking-wider">
                {cvv || "•••"}
              </span>
            </div>
          </div>

          {/* Bottom */}
          <div className="px-6 pb-5 flex justify-end">
            <CardBrandLogo brand={brand} />
          </div>
        </div>
      </div>
    </div>
  );
};
