import React, { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CheckCircle2, X, UserPlus, Search } from "lucide-react";
import { Pagination } from "./Pagination";
import { InviteGateway, InviteStatus } from "@/lib/InviteGateway";
import SuccessSnackbar from "./SuccessSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";

interface EventJoinRequestsProps {
  eventId: number;
}

export const EventJoinRequests = ({ eventId }: EventJoinRequestsProps) => {
  const [requestSearch, setRequestSearch] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const requestsPerPage = 6;
  const inviteGateway = new InviteGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );
  const queryClient = useQueryClient();

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((searchTerm: string) => {
      setDebouncedSearch(searchTerm);
    }, 500),
    []
  );

  // Update debounced search when requestSearch changes
  React.useEffect(() => {
    debouncedSetSearch(requestSearch);
  }, [requestSearch, debouncedSetSearch]);

  // Reset page when search changes
  React.useEffect(() => {
    setRequestPage(1);
  }, [debouncedSearch]);

  // Fetch pending invites using React Query
  const {
    data: invitesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-join-requests", eventId, debouncedSearch],
    queryFn: () =>
      inviteGateway.getInvitesByEvent(
        eventId,
        InviteStatus.PENDING,
        debouncedSearch || undefined
      ),
    enabled: !!eventId,
  });

  // Accept join request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      return inviteGateway.approveOrRejectJoinRequest({
        invite_id: inviteId,
        approved: true,
      });
    },
    onSuccess: () => {
      setSuccessMessage("Solicitação aceita com sucesso");
      setShowSuccessSnackbar(true);
      queryClient.invalidateQueries({
        queryKey: ["event-join-requests", eventId],
      });
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Erro ao aceitar solicitação");
      setShowErrorSnackbar(true);
    },
  });

  // Reject join request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      return inviteGateway.approveOrRejectJoinRequest({
        invite_id: inviteId,
        approved: false,
      });
    },
    onSuccess: () => {
      setSuccessMessage("Solicitação rejeitada com sucesso");
      setShowSuccessSnackbar(true);
      queryClient.invalidateQueries({
        queryKey: ["event-join-requests", eventId],
      });
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Erro ao rejeitar solicitação");
      setShowErrorSnackbar(true);
    },
  });

  // Restore focus after query updates
  React.useEffect(() => {
    if (requestSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [invitesData, requestSearch]);

  const allRequests = invitesData?.invites || [];

  // Pagination
  const totalRequests = allRequests.length;
  const totalPages = Math.ceil(totalRequests / requestsPerPage);
  const startIndex = (requestPage - 1) * requestsPerPage;
  const endIndex = Math.min(startIndex + requestsPerPage, totalRequests);
  const paginatedRequests = allRequests.slice(startIndex, endIndex);

  const onAcceptRequest = (requestId: number) => {
    acceptRequestMutation.mutate(requestId);
  };

  const onRejectRequest = (requestId: number) => {
    rejectRequestMutation.mutate(requestId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading join requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading join requests</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Join Requests</h2>
          <p className="text-muted-foreground">
            Review and approve pending join requests from ticket purchasers
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search join requests..."
            value={requestSearch}
            onChange={(e) => setRequestSearch(e.target.value)}
            className="pl-9"
            ref={searchInputRef}
          />
        </div>
      </div>

      {/* Join Requests Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedRequests.map((request) => (
          <Card key={request.invite_id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-yellow-500 text-yellow-50">
                      {request.user.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm leading-none">
                      {request.user.username}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {request.user.email}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Instagram:</span>
                  <span className="font-medium">
                    {request.user.instagram_profile || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket Type:</span>
                  <Badge variant="outline">
                    {request.ticket_pricing.ticket_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid Value:</span>
                  <span className="font-medium">
                    R$ {request.payment_details.authorized_amount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coupon:</span>
                  <span className="font-medium">
                    {request.payment_details.coupon ? (
                      <Badge variant="secondary">
                        {request.payment_details.coupon}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={
                        rejectRequestMutation.isPending ||
                        acceptRequestMutation.isPending
                      }
                    >
                      <X className="h-4 w-4 mr-2" />
                      {rejectRequestMutation.isPending
                        ? "Rejeitando..."
                        : "Reject"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Join Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {request.user.username}
                        's join request? They will be notified of this decision.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onRejectRequest(request.invite_id)}
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={
                        acceptRequestMutation.isPending ||
                        rejectRequestMutation.isPending
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {acceptRequestMutation.isPending
                        ? "Aceitando..."
                        : "Accept"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept Join Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to accept {request.user.username}
                        's join request? They will be added to the approved
                        participants list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onAcceptRequest(request.invite_id)}
                      >
                        Accept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {allRequests.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No join requests</h3>
          <p className="text-muted-foreground">
            {requestSearch
              ? "No requests match your search."
              : "All join requests have been processed."}
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={requestPage}
        totalPages={totalPages}
        onPageChange={setRequestPage}
        startIndex={startIndex + 1}
        endIndex={endIndex}
        totalItems={totalRequests}
        itemName="requests"
      />

      <SuccessSnackbar
        visible={showSuccessSnackbar}
        onDismiss={() => setShowSuccessSnackbar(false)}
        message={successMessage}
      />

      <ErrorSnackbar
        visible={showErrorSnackbar}
        onDismiss={() => setShowErrorSnackbar(false)}
        message={errorMessage}
      />
    </div>
  );
};
