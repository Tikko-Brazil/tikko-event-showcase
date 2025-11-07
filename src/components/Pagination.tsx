import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  itemName?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
  itemName,
}: PaginationProps) => {
  const { t, i18n } = useTranslation();

  // Helper function to format numbers according to current locale
  const formatNumber = (value: number) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return value.toLocaleString(locale);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs md:text-sm text-muted-foreground">
        {t("eventManagement.participants.pagination.showing")} {formatNumber(startIndex)} {t("eventManagement.participants.pagination.to")} {formatNumber(endIndex)} {t("eventManagement.participants.pagination.of")} {formatNumber(totalItems)} {itemName}
      </p>

      <div className="flex items-center gap-2">
        {/* Desktop pagination with labels */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("eventManagement.participants.pagination.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            {t("eventManagement.participants.pagination.next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Mobile pagination with icons only */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
