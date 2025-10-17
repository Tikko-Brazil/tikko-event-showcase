import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps
}) => {
  const steps = [
    'Dados',
    'Cupom', 
    'Pagamento',
    'Confirmação'
  ];

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isConnected = index < steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`
                text-xs mt-1 hidden sm:block
                ${isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}
              `}>
                {step}
              </span>
            </div>
            
            {isConnected && (
              <div className={`
                flex-1 h-0.5 mx-2 transition-all
                ${isCompleted ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};