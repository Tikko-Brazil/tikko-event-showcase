import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EventInfoHeaderProps {
  status: string;
  id: number;
  title: string;
  date: string;
  time?: string;
  location: string;
}

export const EventInfoHeader = ({
  status,
  id,
  title,
  date,
  time,
  location,
}: EventInfoHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-3 mb-3 md:gap-2 md:mb-2">
        <Badge variant="outline">{t(`eventManagement.tags.${status}`)}</Badge>
        <span className="text-sm text-muted-foreground md:text-xs">
          <span className="md:hidden">Event ID: {id}</span>
          <span className="hidden md:inline">ID: {id}</span>
        </span>
      </div>
      <h1 className="text-xl font-bold mb-2 md:text-base md:font-semibold">
        {title}
      </h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground md:space-y-1 md:flex-col md:items-start md:gap-0">
        <div className="flex items-center gap-1 md:gap-2">
          <Calendar className="h-4 w-4 md:h-3 md:w-3" />
          <span>
            {date}
            <br></br>
            {time && `${time}`}
          </span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <MapPin className="h-4 w-4 md:h-3 md:w-3" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
};
