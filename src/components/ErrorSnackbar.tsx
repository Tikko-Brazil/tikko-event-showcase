import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorSnackbarProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const ErrorSnackbar = ({
  message,
  visible,
  onDismiss,
  duration = 7000,
}: ErrorSnackbarProps) => {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] flex justify-center">
      <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-md shadow-lg flex items-center gap-3 max-w-md w-full">
        <span className="flex-1">{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-auto p-1 hover:bg-destructive/80"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ErrorSnackbar;
