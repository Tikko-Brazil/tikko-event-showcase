import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const ValidatePage = () => {
  return (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Validate Tickets</h3>
      <p className="text-muted-foreground mb-4">
        Scan and validate tickets at the event entrance.
      </p>
      <Button>Coming Soon</Button>
    </div>
  );
};
