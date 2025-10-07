import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle2, X, UserPlus, Search } from "lucide-react";
import { Pagination } from "./Pagination";

interface JoinRequest {
  id: number;
  name: string;
  email: string;
  instagram: string;
  ticketType: string;
  paidValue: number;
  coupon: string | null;
}

interface EventJoinRequestsProps {
  joinRequestsData: JoinRequest[];
  requestSearch: string;
  setRequestSearch: (value: string) => void;
  requestPage: number;
  setRequestPage: (page: number) => void;
  requestsPerPage: number;
  onAcceptRequest: (requestId: number) => void;
  onRejectRequest: (requestId: number) => void;
}

export const EventJoinRequests = ({
  joinRequestsData,
  requestSearch,
  setRequestSearch,
  requestPage,
  setRequestPage,
  requestsPerPage,
  onAcceptRequest,
  onRejectRequest,
}: EventJoinRequestsProps) => {
  // Filter join requests based on search
  const filteredRequests = joinRequestsData.filter((request) => {
    const matchesSearch =
      requestSearch === "" ||
      request.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
      request.email.toLowerCase().includes(requestSearch.toLowerCase()) ||
      request.instagram.toLowerCase().includes(requestSearch.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const totalRequests = filteredRequests.length;
  const totalPages = Math.ceil(totalRequests / requestsPerPage);
  const startIndex = (requestPage - 1) * requestsPerPage;
  const endIndex = Math.min(startIndex + requestsPerPage, totalRequests);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

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
          />
        </div>
      </div>

      {/* Join Requests Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedRequests.map((request) => (
          <Card key={request.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-yellow-500 text-yellow-50">
                      {request.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm leading-none">
                      {request.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {request.email}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Instagram:</span>
                  <span className="font-medium">{request.instagram}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket Type:</span>
                  <Badge variant="outline">{request.ticketType}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid Value:</span>
                  <span className="font-medium">R${request.paidValue}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coupon:</span>
                  <span className="font-medium">
                    {request.coupon ? (
                      <Badge variant="secondary">{request.coupon}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Join Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {request.name}'s join
                        request? They will be notified of this decision.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onRejectRequest(request.id)}
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="flex-1">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept Join Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to accept {request.name}'s join
                        request? They will be added to the approved
                        participants list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onAcceptRequest(request.id)}>
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
      {filteredRequests.length === 0 && (
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
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalRequests}
        itemName="requests"
      />
    </div>
  );
};
