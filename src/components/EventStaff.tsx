import React, { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Pencil, Trash2, Shield, Crown } from "lucide-react";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";
import { StaffGateway, StaffRole, StaffMember } from "@/lib/StaffGateway";
import SuccessSnackbar from "./SuccessSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";

interface EventStaffProps {
  eventId: number;
}

const getRoleIcon = (role: StaffRole) => {
  switch (role) {
    case StaffRole.HOST:
      return <Crown className="h-4 w-4" />;
    case StaffRole.MANAGER:
      return <Shield className="h-4 w-4" />;
    default:
      return null;
  }
};

const getRoleLabel = (role: StaffRole) => {
  const labels = {
    [StaffRole.HOST]: "Host",
    [StaffRole.MANAGER]: "Manager",
    [StaffRole.COORDINATOR]: "Coordinator",
    [StaffRole.VALIDATOR]: "Validator",
  };
  return labels[role] || role;
};

const getRoleBadgeVariant = (role: StaffRole) => {
  switch (role) {
    case StaffRole.HOST:
      return "default";
    case StaffRole.MANAGER:
      return "secondary";
    default:
      return "outline";
  }
};

export const EventStaff = ({ eventId }: EventStaffProps) => {
  const [staffSearch, setStaffSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [staffPage, setStaffPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add staff dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>(StaffRole.VALIDATOR);

  // Edit staff dialog state
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editStaffRole, setEditStaffRole] = useState<StaffRole>(StaffRole.VALIDATOR);

  const staffPerPage = 6;

  const staffGateway = new StaffGateway(import.meta.env.VITE_BACKEND_BASE_URL);
  const queryClient = useQueryClient();

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((searchTerm: string) => {
      setDebouncedSearch(searchTerm);
    }, 500),
    []
  );

  // Update debounced search when staffSearch changes
  React.useEffect(() => {
    debouncedSetSearch(staffSearch);
  }, [staffSearch, debouncedSetSearch]);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setStaffPage(1);
  }, [staffFilter, debouncedSearch]);

  // Get role filter value
  const getRoleFilter = (): StaffRole | undefined => {
    if (staffFilter === "all") return undefined;
    return staffFilter as StaffRole;
  };

  // Fetch staff using React Query
  const {
    data: staffData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-staff", eventId, staffFilter, debouncedSearch],
    queryFn: () =>
      staffGateway.getEventStaff(
        eventId,
        getRoleFilter(),
        debouncedSearch || undefined
      ),
    enabled: !!eventId,
  });

  const staff = staffData?.staff || [];

  // Restore focus after query updates
  React.useEffect(() => {
    if (staffSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [staffData, staffSearch]);

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: (data: { user_email: string; role: StaffRole }) =>
      staffGateway.addStaffMember({
        user_email: data.user_email,
        event_id: eventId,
        role: data.role,
      }),
    onSuccess: () => {
      setSuccessMessage("Staff member added successfully");
      setShowSuccessSnackbar(true);
      setIsAddDialogOpen(false);
      setNewStaffEmail("");
      setNewStaffRole(StaffRole.VALIDATOR);
      queryClient.invalidateQueries({ queryKey: ["event-staff", eventId] });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to add staff member");
      setShowErrorSnackbar(true);
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: (data: { staff_id: string; role: StaffRole }) =>
      staffGateway.updateStaffMember(data),
    onSuccess: () => {
      setSuccessMessage("Staff member updated successfully");
      setShowSuccessSnackbar(true);
      setEditingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["event-staff", eventId] });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to update staff member");
      setShowErrorSnackbar(true);
    },
  });

  // Remove staff mutation
  const removeStaffMutation = useMutation({
    mutationFn: (staffId: string) => staffGateway.removeStaffMember(staffId),
    onSuccess: () => {
      setSuccessMessage("Staff member removed successfully");
      setShowSuccessSnackbar(true);
      queryClient.invalidateQueries({ queryKey: ["event-staff", eventId] });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to remove staff member");
      setShowErrorSnackbar(true);
    },
  });

  // Calculate pagination
  const from = (staffPage - 1) * staffPerPage;
  const to = Math.min(staffPage * staffPerPage, staff.length);
  const totalPages = Math.ceil(staff.length / staffPerPage);
  const paginatedStaff = staff.slice(from, to);

  const filterOptions = [
    { value: "all", label: "All Roles" },
    { value: StaffRole.HOST, label: "Host" },
    { value: StaffRole.MANAGER, label: "Manager" },
    { value: StaffRole.COORDINATOR, label: "Coordinator" },
    { value: StaffRole.VALIDATOR, label: "Validator" },
  ];

  const handleAddStaff = () => {
    if (!newStaffEmail) {
      setErrorMessage("Please enter an email address");
      setShowErrorSnackbar(true);
      return;
    }
    addStaffMutation.mutate({ user_email: newStaffEmail, role: newStaffRole });
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;
    updateStaffMutation.mutate({
      staff_id: editingStaff.id,
      role: editStaffRole,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading staff...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Failed to load staff</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchAndFilter
          searchValue={staffSearch}
          onSearchChange={setStaffSearch}
          searchPlaceholder="Search staff..."
          filterValue={staffFilter}
          onFilterChange={setStaffFilter}
          filterOptions={filterOptions}
          searchInputRef={searchInputRef}
        />

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                Add a new staff member to your event team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newStaffRole}
                  onValueChange={(value) => setNewStaffRole(value as StaffRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StaffRole.HOST}>Host</SelectItem>
                    <SelectItem value={StaffRole.MANAGER}>Manager</SelectItem>
                    <SelectItem value={StaffRole.COORDINATOR}>
                      Coordinator
                    </SelectItem>
                    <SelectItem value={StaffRole.VALIDATOR}>
                      Validator
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStaff}
                disabled={addStaffMutation.isPending}
              >
                {addStaffMutation.isPending ? "Adding..." : "Add Staff"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedStaff.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No staff members found</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          paginatedStaff.map((member, index) => (
            <Card
              key={`${member.id}-${staffPage}-${index}`}
              className="relative"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.user.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">
                        {member.user.username}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <span>{getRoleLabel(member.role)}</span>
                    </div>
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  {member.user.instagram_profile && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Instagram:</span>
                      <span className="font-medium">
                        {member.user.instagram_profile}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Dialog
                    open={editingStaff?.id === member.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setEditingStaff(member);
                        setEditStaffRole(member.role);
                      } else {
                        setEditingStaff(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                        <DialogDescription>
                          Update the role for {member.user.username}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-role">Role</Label>
                          <Select
                            value={editStaffRole}
                            onValueChange={(value) =>
                              setEditStaffRole(value as StaffRole)
                            }
                          >
                            <SelectTrigger id="edit-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={StaffRole.HOST}>
                                Host
                              </SelectItem>
                              <SelectItem value={StaffRole.MANAGER}>
                                Manager
                              </SelectItem>
                              <SelectItem value={StaffRole.COORDINATOR}>
                                Coordinator
                              </SelectItem>
                              <SelectItem value={StaffRole.VALIDATOR}>
                                Validator
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingStaff(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateStaff}
                          disabled={updateStaffMutation.isPending}
                        >
                          {updateStaffMutation.isPending
                            ? "Updating..."
                            : "Update"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.user.username}{" "}
                          from the event staff? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => removeStaffMutation.mutate(member.id)}
                          disabled={removeStaffMutation.isPending}
                        >
                          {removeStaffMutation.isPending
                            ? "Removing..."
                            : "Remove"}
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
          currentPage={staffPage}
          totalPages={totalPages}
          onPageChange={setStaffPage}
          startIndex={from + 1}
          endIndex={to}
          totalItems={staff.length}
          itemName="staff members"
        />
      )}

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
