import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle2, DollarSign } from "lucide-react";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";

interface Participant {
  id: number;
  name: string;
  email: string;
  instagram: string;
  ticketType: string;
  paidValue: number;
  coupon: string | null;
  validated: boolean;
  status: string;
}

interface EventParticipantsProps {
  participantsData: Participant[];
  participantSearch: string;
  setParticipantSearch: (value: string) => void;
  participantFilter: string;
  setParticipantFilter: (value: string) => void;
  participantPage: number;
  setParticipantPage: (page: number) => void;
  participantsPerPage: number;
  onRefund: (participantId: number) => void;
}

export const EventParticipants = ({
  participantsData,
  participantSearch,
  setParticipantSearch,
  participantFilter,
  setParticipantFilter,
  participantPage,
  setParticipantPage,
  participantsPerPage,
  onRefund,
}: EventParticipantsProps) => {
  // Filter participants based on status and search
  const filteredParticipants = participantsData.filter((participant) => {
    const matchesStatus =
      participantFilter === "all" || participant.status === participantFilter;
    const matchesSearch =
      participantSearch === "" ||
      participant.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      participant.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
      participant.instagram.toLowerCase().includes(participantSearch.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalParticipants = filteredParticipants.length;
  const totalPages = Math.ceil(totalParticipants / participantsPerPage);
  const startIndex = (participantPage - 1) * participantsPerPage;
  const endIndex = Math.min(startIndex + participantsPerPage, totalParticipants);
  const paginatedParticipants = filteredParticipants.slice(startIndex, endIndex);

  const filterOptions = [
    { value: "all", label: "All Participants" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Participants</h2>
          <p className="text-muted-foreground">
            Manage event participants and their ticket information
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchValue={participantSearch}
        onSearchChange={setParticipantSearch}
        searchPlaceholder="Search participants..."
        filterValue={participantFilter}
        onFilterChange={setParticipantFilter}
        filterOptions={filterOptions}
      />

      {/* Participants Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedParticipants.map((participant) => (
          <Card key={participant.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm leading-none">
                      {participant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {participant.email}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    participant.status === "approved" ? "default" : "destructive"
                  }
                >
                  {participant.status}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Instagram:</span>
                  <span className="font-medium">{participant.instagram}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket Type:</span>
                  <Badge variant="outline">{participant.ticketType}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid Value:</span>
                  <span className="font-medium">R${participant.paidValue}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coupon:</span>
                  <span className="font-medium">
                    {participant.coupon ? (
                      <Badge variant="secondary">{participant.coupon}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Validated:</span>
                  <div className="flex items-center gap-1">
                    {participant.validated ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-xs">
                      {participant.validated ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Refund Ticket
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to refund the ticket for{" "}
                        {participant.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onRefund(participant.id)}
                      >
                        Refund
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={participantPage}
        totalPages={totalPages}
        onPageChange={setParticipantPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalParticipants}
        itemName="participants"
      />
    </div>
  );
};
