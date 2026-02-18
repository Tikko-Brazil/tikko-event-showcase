import React, { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, DollarSign } from "lucide-react";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";
import { InviteGateway, InviteStatus } from "@/lib/InviteGateway";
import { PaymentGateway } from "@/lib/PaymentGateway";
import { formatCurrency } from "@/helpers/currency";
import SuccessSnackbar from "./SuccessSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";

interface EventParticipantsProps {
  eventId: number;
}

const formatTicketName = (ticket: any) => {
  const genderText =
    ticket?.gender === "male"
      ? "Masculino"
      : ticket?.gender === "female"
        ? "Feminino"
        : "Unissex";
  const lotText = ticket?.lot === 0 ? "Pré-venda" : `Lote ${ticket?.lot}`;
  return `${ticket?.ticket_type} - ${genderText} - ${lotText}`;
};

export const EventParticipants = ({ eventId }: EventParticipantsProps) => {
  const { t, i18n } = useTranslation();
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantFilter, setParticipantFilter] = useState("approved");
  const [participantPage, setParticipantPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const participantsPerPage = 6;

  const inviteGateway = new InviteGateway(
    import.meta.env.VITE_API_BASE_URL
  );
  const paymentGateway = new PaymentGateway(
    import.meta.env.VITE_API_BASE_URL
  );
  const queryClient = useQueryClient();

  // Helper function to format numbers according to current locale
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";
    return value.toLocaleString(locale, options);
  };

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((searchTerm: string) => {
      setDebouncedSearch(searchTerm);
    }, 500),
    []
  );

  // Update debounced search when participantSearch changes
  React.useEffect(() => {
    debouncedSetSearch(participantSearch);
  }, [participantSearch, debouncedSetSearch]);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setParticipantPage(1);
  }, [participantFilter, debouncedSearch]);

  // Map filter values to InviteStatus enum
  const getInviteStatus = (filter: string): InviteStatus | undefined => {
    switch (filter) {
      case "approved":
        return InviteStatus.ACCEPTED;
      case "rejected":
        return InviteStatus.REJECTED;
      default:
        return undefined;
    }
  };

  // Fetch invites using React Query with pagination
  const {
    data: invitesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-invites", eventId, participantPage, participantFilter, debouncedSearch],
    queryFn: () =>
      inviteGateway.getInvitesByEvent(
        eventId,
        participantPage,
        participantsPerPage,
        getInviteStatus(participantFilter),
        debouncedSearch || undefined
      ),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const invites = invitesData?.invites || [];
  const totalItems = invitesData?.total || 0;
  const totalPages = invitesData?.total_pages || 0;

  // Restore focus after query updates
  React.useEffect(() => {
    if (participantSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [invitesData, participantSearch]);

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: (invite: any) =>
      paymentGateway.processRefund({
        user_id: invite.user.id,
        event_id: eventId,
      }),
    onSuccess: () => {
      setShowSuccessSnackbar(true);
      queryClient.invalidateQueries({ queryKey: ["event-invites", eventId] });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Erro ao processar estorno");
      setShowErrorSnackbar(true);
    },
  });

  // Calculate pagination indices for display
  const from = (participantPage - 1) * participantsPerPage;
  const to = Math.min(from + invites.length, totalItems);

  const filterOptions = [
    {
      value: "approved",
      label: t("eventManagement.participants.search.filters.approved"),
    },
    {
      value: "rejected",
      label: t("eventManagement.participants.search.filters.rejected"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando participantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erro ao carregar participantes</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchAndFilter
        searchValue={participantSearch}
        onSearchChange={setParticipantSearch}
        searchPlaceholder={t("eventManagement.participants.search.placeholder")}
        filterValue={participantFilter}
        onFilterChange={setParticipantFilter}
        filterOptions={filterOptions}
        searchInputRef={searchInputRef}
      />

      {/* Participants Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {invites.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Nenhum participante encontrado
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          invites.map((invite, index) => (
            <Card
              key={`${invite.invite_id}-${participantPage}-${index}`}
              className="relative"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {invite.user.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">
                        {invite.user.username}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {invite.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      participantFilter === "approved"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {participantFilter === "approved"
                      ? t("eventManagement.participants.status.approved")
                      : t("eventManagement.participants.status.rejected")}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Instagram:</span>
                    <span className="font-medium">
                      {invite.user.instagram_profile || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("eventManagement.participants.labels.ticketType")}:
                    </span>
                    <Badge variant="outline">
                      {formatTicketName(invite.ticket_pricing)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("eventManagement.participants.labels.paidValue")}:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        invite.payment_details.authorized_amount ||
                        invite.ticket_pricing.price,
                        i18n.language === "pt" ? "pt-BR" : "en-US"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("eventManagement.participants.labels.coupon")}:
                    </span>
                    <span className="font-medium">
                      {invite.payment_details.coupon ? (
                        <Badge variant="secondary">
                          {invite.payment_details.coupon}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("eventManagement.participants.labels.no")}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("eventManagement.participants.labels.validated")}:
                    </span>
                    <div className="flex items-center gap-1">
                      {invite.is_validated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className="text-xs">
                        {invite.is_validated
                          ? t("eventManagement.participants.labels.yes")
                          : t("eventManagement.participants.labels.no")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        {t("eventManagement.participants.actions.refundTicket")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("eventManagement.participants.refundDialog.title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t(
                            "eventManagement.participants.refundDialog.description"
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t(
                            "eventManagement.participants.refundDialog.cancel"
                          )}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => refundMutation.mutate(invite)}
                          disabled={refundMutation.isPending}
                        >
                          {refundMutation.isPending
                            ? "..."
                            : t(
                              "eventManagement.participants.refundDialog.confirm"
                            )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={participantPage}
          totalPages={totalPages}
          onPageChange={setParticipantPage}
          startIndex={from + 1}
          endIndex={to}
          totalItems={totalItems}
          itemName={t("eventManagement.participants.pagination.participants")}
        />
      )}

      <SuccessSnackbar
        visible={showSuccessSnackbar}
        onDismiss={() => setShowSuccessSnackbar(false)}
        message="Estorno processado com sucesso"
      />

      <ErrorSnackbar
        visible={showErrorSnackbar}
        onDismiss={() => setShowErrorSnackbar(false)}
        message={errorMessage}
      />
    </div>
  );
};
