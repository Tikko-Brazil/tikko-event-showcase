import React, { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface EventParticipantsProps {
  eventId: number;
}

export const EventParticipants = ({ eventId }: EventParticipantsProps) => {
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantFilter, setParticipantFilter] = useState("approved");
  const [participantPage, setParticipantPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const participantsPerPage = 6;

  const inviteGateway = new InviteGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );

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

  // Fetch invites using React Query
  const {
    data: invitesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-invites", eventId, participantFilter, debouncedSearch],
    queryFn: () =>
      inviteGateway.getInvitesByEvent(
        eventId,
        getInviteStatus(participantFilter),
        debouncedSearch || undefined
      ),
    enabled: !!eventId,
  });

  const invites = invitesData?.invites || [];

  // Restore focus after query updates
  React.useEffect(() => {
    if (participantSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [invitesData, participantSearch]);

  // Calculate pagination (following coupons.tsx pattern)
  const from = (participantPage - 1) * participantsPerPage;
  const to = Math.min(participantPage * participantsPerPage, invites.length);
  const totalPages = Math.ceil(invites.length / participantsPerPage);
  const paginatedInvites = invites.slice(from, to);

  const filterOptions = [
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
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
        searchPlaceholder="Buscar participantes..."
        filterValue={participantFilter}
        onFilterChange={setParticipantFilter}
        filterOptions={filterOptions}
        searchInputRef={searchInputRef}
      />

      {/* Participants Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedInvites.length === 0 ? (
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
          paginatedInvites.map((invite, index) => (
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
                    {participantFilter === "approved" ? "approved" : "rejected"}
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
                    <span className="text-muted-foreground">Ticket Type:</span>
                    <Badge variant="outline">
                      {invite.ticket_pricing.ticket_type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paid Value:</span>
                    <span className="font-medium">
                      R$
                      {invite.payment_details.authorized_amount ||
                        invite.ticket_pricing.price}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coupon:</span>
                    <span className="font-medium">
                      {invite.payment_details.coupon ? (
                        <Badge variant="secondary">
                          {invite.payment_details.coupon}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Validated:</span>
                    <div className="flex items-center gap-1">
                      {invite.is_validated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className="text-xs">
                        {invite.is_validated ? "Yes" : "No"}
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
                        Refund Ticket
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to refund the ticket for{" "}
                          {invite.user.username}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() =>
                            console.log(
                              `Refunding participant ${invite.invite_id}`
                            )
                          }
                        >
                          Refund
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
          totalItems={invites.length}
          itemName="participants"
        />
      )}
    </div>
  );
};
