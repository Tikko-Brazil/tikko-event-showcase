import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, X } from "lucide-react";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";

interface TicketType {
  id: number;
  name: string;
  gender: string;
  value: number;
  isActive: boolean;
  totalSold: number;
}

interface NewTicketType {
  name: string;
  gender: string;
  value: number;
  isActive: boolean;
}

interface EventTicketTypesProps {
  allTicketTypes: TicketType[];
  ticketTypeSearch: string;
  setTicketTypeSearch: (value: string) => void;
  ticketTypeFilter: string;
  setTicketTypeFilter: (value: string) => void;
  ticketTypePage: number;
  setTicketTypePage: (page: number) => void;
  itemsPerPage: number;
  isCreateTicketTypeOpen: boolean;
  setIsCreateTicketTypeOpen: (open: boolean) => void;
  newTicketType: NewTicketType;
  setNewTicketType: (ticketType: NewTicketType) => void;
  editingTicketType: TicketType | null;
  setEditingTicketType: (ticketType: TicketType | null) => void;
  onCreateTicketType: () => void;
  onEditTicketType: (ticketType: TicketType) => void;
  onSaveEdit: () => void;
  onDeleteTicketType: (id: number) => void;
}

export const EventTicketTypes = ({
  allTicketTypes,
  ticketTypeSearch,
  setTicketTypeSearch,
  ticketTypeFilter,
  setTicketTypeFilter,
  ticketTypePage,
  setTicketTypePage,
  itemsPerPage,
  isCreateTicketTypeOpen,
  setIsCreateTicketTypeOpen,
  newTicketType,
  setNewTicketType,
  editingTicketType,
  setEditingTicketType,
  onCreateTicketType,
  onEditTicketType,
  onSaveEdit,
  onDeleteTicketType,
}: EventTicketTypesProps) => {
  // Filter ticket types based on search and filter
  const filteredTicketTypes = allTicketTypes.filter((ticketType) => {
    const matchesSearch = ticketType.name
      .toLowerCase()
      .includes(ticketTypeSearch.toLowerCase());
    const matchesFilter =
      ticketTypeFilter === "all" ||
      (ticketTypeFilter === "active" && ticketType.isActive) ||
      (ticketTypeFilter === "inactive" && !ticketType.isActive);
    return matchesSearch && matchesFilter;
  });

  // Pagination for ticket types
  const totalTicketTypePages = Math.ceil(filteredTicketTypes.length / itemsPerPage);
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

  const GenderRadioGroup = ({
    value,
    onChange,
    namePrefix,
  }: {
    value: string;
    onChange: (value: string) => void;
    namePrefix: string;
  }) => (
    <div className="flex items-center space-x-4">
      {[
        { value: "all", label: "All" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ].map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${namePrefix}-${option.value}`}
            name={namePrefix}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4"
          />
          <Label htmlFor={`${namePrefix}-${option.value}`} className="text-sm font-normal">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Ticket Types Management</h2>

        <Dialog open={isCreateTicketTypeOpen} onOpenChange={setIsCreateTicketTypeOpen}>
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
                <Input
                  id="name"
                  value={newTicketType.name}
                  onChange={(e) =>
                    setNewTicketType({ ...newTicketType, name: e.target.value })
                  }
                  placeholder="Early Bird"
                />
              </div>

              <div>
                <Label>Gender</Label>
                <div className="mt-2">
                  <GenderRadioGroup
                    value={newTicketType.gender}
                    onChange={(value) =>
                      setNewTicketType({ ...newTicketType, gender: value })
                    }
                    namePrefix="gender"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="value">Ticket Value (BRL)</Label>
                <Input
                  id="value"
                  type="number"
                  value={newTicketType.value}
                  onChange={(e) =>
                    setNewTicketType({
                      ...newTicketType,
                      value: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={newTicketType.isActive}
                  onCheckedChange={(checked) =>
                    setNewTicketType({ ...newTicketType, isActive: !!checked })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateTicketTypeOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={onCreateTicketType}>Create Ticket Type</Button>
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
      />

      {/* Ticket Types Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedTicketTypes.map((ticketType) => (
          <Card key={ticketType.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{ticketType.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={ticketType.isActive ? "default" : "secondary"}>
                      {ticketType.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {ticketType.gender === "all"
                        ? "All Genders"
                        : ticketType.gender === "male"
                        ? "Male Only"
                        : "Female Only"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditTicketType(ticketType)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteTicketType(ticketType.id)}
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
                  <span className="text-lg font-bold">R$ {ticketType.value}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Sold</span>
                  <span className="text-sm font-medium">{ticketType.totalSold}</span>
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
        endIndex={Math.min(startIndex + itemsPerPage, filteredTicketTypes.length)}
        totalItems={filteredTicketTypes.length}
        itemName="ticket types"
      />

      {/* Edit Ticket Type Dialog */}
      {editingTicketType && (
        <Dialog open={!!editingTicketType} onOpenChange={() => setEditingTicketType(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Ticket Type: {editingTicketType.name}</DialogTitle>
              <DialogDescription>
                Modify ticket type settings and pricing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Ticket Type Name</Label>
                <Input
                  id="editName"
                  value={editingTicketType.name}
                  onChange={(e) =>
                    setEditingTicketType({
                      ...editingTicketType,
                      name: e.target.value,
                    })
                  }
                  placeholder="Early Bird"
                />
              </div>

              <div>
                <Label>Gender</Label>
                <div className="mt-2">
                  <GenderRadioGroup
                    value={editingTicketType.gender}
                    onChange={(value) =>
                      setEditingTicketType({
                        ...editingTicketType,
                        gender: value,
                      })
                    }
                    namePrefix="edit-gender"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editValue">Ticket Value (BRL)</Label>
                <Input
                  id="editValue"
                  type="number"
                  value={editingTicketType.value}
                  onChange={(e) =>
                    setEditingTicketType({
                      ...editingTicketType,
                      value: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editActive"
                  checked={editingTicketType.isActive}
                  onCheckedChange={(checked) =>
                    setEditingTicketType({
                      ...editingTicketType,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="editActive">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTicketType(null)}>
                Cancel
              </Button>
              <Button onClick={onSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
