import { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessSnackbarProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const SuccessSnackbar = ({ message, visible, onDismiss, duration = 5000 }: SuccessSnackbarProps) => {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-green-600 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-3 max-w-md w-full">
        <CheckCircle className="h-5 w-5" />
        <span className="flex-1">{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-auto p-1 hover:bg-green-700 text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SuccessSnackbar;
