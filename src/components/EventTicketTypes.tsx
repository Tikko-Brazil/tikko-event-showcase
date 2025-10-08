import React, { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, X } from "lucide-react";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";
import { TicketPricingGateway } from "@/lib/TicketPricingGateway";

interface EventTicketTypesProps {
  eventId: number;
}

export const EventTicketTypes = ({ eventId }: EventTicketTypesProps) => {
  const [ticketTypeSearch, setTicketTypeSearch] = useState("");
  const [ticketTypeFilter, setTicketTypeFilter] = useState("all");
  const [ticketTypePage, setTicketTypePage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 6;
  const ticketPricingGateway = new TicketPricingGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((searchTerm: string) => {
      setDebouncedSearch(searchTerm);
    }, 500),
    []
  );

  // Update debounced search when ticketTypeSearch changes
  React.useEffect(() => {
    debouncedSetSearch(ticketTypeSearch);
  }, [ticketTypeSearch, debouncedSetSearch]);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setTicketTypePage(1);
  }, [ticketTypeFilter, debouncedSearch]);

  // Get filter status for API call
  const getFilterStatus = (filter: string) => {
    switch (filter) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      default:
        return "All";
    }
  };

  // Fetch ticket pricings using React Query
  const {
    data: ticketPricingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-ticket-pricings", eventId, ticketTypeFilter],
    queryFn: () =>
      ticketPricingGateway.getTicketPricingByEvent(
        eventId,
        getFilterStatus(ticketTypeFilter)
      ),
    enabled: !!eventId,
  });

  // Restore focus after query updates
  React.useEffect(() => {
    if (ticketTypeSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [ticketPricingsData, ticketTypeSearch]);

  const allTicketTypes = ticketPricingsData || [];

  // Filter ticket types based on search
  const filteredTicketTypes = allTicketTypes.filter((ticketType) => {
    const matchesSearch =
      debouncedSearch === "" ||
      ticketType.ticket_type
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      ticketType.gender.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesSearch;
  });

  // Pagination for ticket types
  const totalTicketTypePages = Math.ceil(
    filteredTicketTypes.length / itemsPerPage
  );
  const startIndex = (ticketTypePage - 1) * itemsPerPage;
  const paginatedTicketTypes = filteredTicketTypes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const filterOptions = [
    { value: "all", label: "All Ticket Types" },
    { value: "active", label: "Active Only" },
    { value: "inactive", label: "Inactive Only" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading ticket types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading ticket types</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Ticket Types Management</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Ticket Type</DialogTitle>
              <DialogDescription>
                Configure your new ticket type settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ticket Type Name</Label>
                <Input id="name" placeholder="Early Bird" />
              </div>
              <div>
                <Label>Gender</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="all" name="gender" value="all" />
                    <Label htmlFor="all" className="text-sm font-normal">
                      All
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="male" name="gender" value="male" />
                    <Label htmlFor="male" className="text-sm font-normal">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="female"
                    />
                    <Label htmlFor="female" className="text-sm font-normal">
                      Female
                    </Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="value">Ticket Value (BRL)</Label>
                <Input id="value" type="number" placeholder="50" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Ticket Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <SearchAndFilter
        searchValue={ticketTypeSearch}
        onSearchChange={setTicketTypeSearch}
        searchPlaceholder="Search ticket types..."
        filterValue={ticketTypeFilter}
        onFilterChange={setTicketTypeFilter}
        filterOptions={filterOptions}
        searchInputRef={searchInputRef}
      />

      {/* Ticket Types Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedTicketTypes.map((ticketType) => (
          <Card key={ticketType.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {ticketType.ticket_type}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={ticketType.active ? "default" : "secondary"}
                    >
                      {ticketType.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{ticketType.gender}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-lg font-bold">
                    R$ {ticketType.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lot</span>
                  <span className="text-sm font-medium">{ticketType.lot}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Sold
                  </span>
                  <span className="text-sm font-medium">
                    {ticketType.sold_count}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={ticketTypePage}
        totalPages={totalTicketTypePages}
        onPageChange={setTicketTypePage}
        startIndex={startIndex}
        endIndex={Math.min(
          startIndex + itemsPerPage,
          filteredTicketTypes.length
        )}
        totalItems={filteredTicketTypes.length}
        itemName="ticket types"
      />
    </div>
  );
};
