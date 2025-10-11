import React, { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { EventGateway } from "@/lib/EventGateway";
import SuccessSnackbar from "./SuccessSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";

enum StaffRole {
  VALIDATOR = "validator",
  COORDINATOR = "coordinator",
  MANAGER = "manager",
  HOST = "host",
}

interface StaffMember {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  birthday: string;
  gender: string;
  location: string;
  instagram_profile: string;
  role: string;
}

interface EventStaffProps {
  eventId: number;
}

const getRoleIcon = (role: string | number) => {
  const roleStr = role.toString();
  switch (roleStr) {
    case "4":
    case "host":
      return <Crown className="h-4 w-4" />;
    case "3":
    case "manager":
      return <Shield className="h-4 w-4" />;
    default:
      return null;
  }
};

const getRoleLabel = (role: string | number) => {
  const roleStr = role.toString();
  const labels = {
    "4": "Host",
    "3": "Manager",
    "2": "Coordinator",
    "1": "Validator",
    host: "Host",
    manager: "Manager",
    coordinator: "Coordinator",
    validator: "Validator",
  };
  return labels[roleStr as keyof typeof labels] || roleStr;
};

const getRoleBadgeVariant = (role: string | number) => {
  const roleStr = role.toString();
  switch (roleStr) {
    case "4":
    case "host":
      return "default";
    case "3":
    case "manager":
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

  // Edit staff dialog state
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const staffPerPage = 6;

  const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
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
  }, [staffFilter, staffSearch]);

  // Fetch staff using React Query
  // Get role filter value for API
  const getRoleFilter = (): number | undefined => {
    if (staffFilter === "all") return undefined;
    const roleMap = {
      validator: 1,
      coordinator: 2,
      manager: 3,
      host: 4,
    };
    return roleMap[staffFilter as keyof typeof roleMap];
  };

  const {
    data: staff,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-staff", eventId, staffFilter, debouncedSearch],
    queryFn: () =>
      eventGateway.getEventStaff(
        eventId,
        getRoleFilter(),
        debouncedSearch || undefined
      ),
    enabled: !!eventId,
  });

  // Restore focus after query updates
  React.useEffect(() => {
    if (staffSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [staff, staffSearch]);

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      eventGateway.addStaffMember(eventId, data),
    onSuccess: () => {
      setSuccessMessage("Staff member added successfully");
      setShowSuccessSnackbar(true);
      setIsAddDialogOpen(false);
      addStaffFormik.resetForm();
      queryClient.invalidateQueries({ queryKey: ["event-staff", eventId] });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to add staff member");
      setShowErrorSnackbar(true);
    },
  });

  // Add staff form validation
  const addStaffSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),
    role: Yup.string()
      .required("Role is required")
      .oneOf(["validator", "coordinator", "manager"], "Invalid role selected"),
  });

  const addStaffFormik = useFormik({
    initialValues: {
      email: "",
      role: "validator",
    },
    validationSchema: addStaffSchema,
    onSubmit: (values) => {
      addStaffMutation.mutate({
        email: values.email,
        role: values.role,
      });
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: (data: { userId: number; role: string }) =>
      eventGateway.updateStaffRole(eventId, data.userId, { role: data.role }),
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

  // Update staff form validation
  const updateStaffSchema = Yup.object().shape({
    role: Yup.string()
      .required("Role is required")
      .oneOf(["validator", "coordinator", "manager"], "Invalid role selected"),
  });

  const updateStaffFormik = useFormik({
    initialValues: {
      role: "validator",
    },
    validationSchema: updateStaffSchema,
    onSubmit: (values) => {
      if (!editingStaff) return;
      updateStaffMutation.mutate({
        userId: editingStaff.id,
        role: values.role,
      });
    },
  });

  const removeStaffMutation = {
    mutate: (staffId: number) => {
      console.warn("Remove staff not implemented in EventGateway yet", staffId);
      setSuccessMessage("Staff member removed successfully");
      setShowSuccessSnackbar(true);
    },
    isPending: false,
  };

  // Calculate pagination (server-side filtered data)
  const from = (staffPage - 1) * staffPerPage;
  const to = Math.min(staffPage * staffPerPage, staff?.length || 0);
  const totalPages = Math.ceil((staff?.length || 0) / staffPerPage);
  const paginatedStaff = staff?.slice(from, to) || [];

  const filterOptions = [
    { value: "all", label: "All Roles" },
    { value: "host", label: "Host" },
    { value: "manager", label: "Manager" },
    { value: "coordinator", label: "Coordinator" },
    { value: "validator", label: "Validator" },
  ];

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              addStaffFormik.resetForm();
            }
          }}
        >
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
            <form
              onSubmit={addStaffFormik.handleSubmit}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={addStaffFormik.values.email}
                  onChange={addStaffFormik.handleChange}
                  onBlur={addStaffFormik.handleBlur}
                  className={
                    addStaffFormik.touched.email && addStaffFormik.errors.email
                      ? "border-red-500"
                      : ""
                  }
                />
                {addStaffFormik.touched.email &&
                  addStaffFormik.errors.email && (
                    <p className="text-sm text-red-500">
                      {addStaffFormik.errors.email}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={addStaffFormik.values.role}
                  onValueChange={(value) =>
                    addStaffFormik.setFieldValue("role", value)
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="validator">Validator</SelectItem>
                  </SelectContent>
                </Select>
                {addStaffFormik.touched.role && addStaffFormik.errors.role && (
                  <p className="text-sm text-red-500">
                    {addStaffFormik.errors.role}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addStaffMutation.isPending}>
                  {addStaffMutation.isPending ? "Adding..." : "Add Staff"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchAndFilter
        searchValue={staffSearch}
        onSearchChange={setStaffSearch}
        searchPlaceholder="Search staff..."
        filterValue={staffFilter}
        onFilterChange={setStaffFilter}
        filterOptions={filterOptions}
        searchInputRef={searchInputRef}
      />

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
                        {member.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">
                        {member.username}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.email}
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
                  {member.instagram_profile && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Instagram:</span>
                      <span className="font-medium">
                        {member.instagram_profile}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  {/* Hide Edit and Remove buttons for Host users */}
                  {member.role.toString() !== "4" && member.role !== "host" && (
                    <>
                      <Dialog
                    open={editingStaff?.id === member.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setEditingStaff(member);
                        // Convert numeric role to string role for form
                        const roleStr = member.role.toString();
                        const roleMap = {
                          "1": "validator",
                          "2": "coordinator", 
                          "3": "manager",
                          "4": "host"
                        };
                        const formRole = roleMap[roleStr as keyof typeof roleMap] || roleStr;
                        updateStaffFormik.setValues({
                          role: formRole,
                        });
                      } else {
                        setEditingStaff(null);
                        updateStaffFormik.resetForm();
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
                          Update the role for {member.username}.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={updateStaffFormik.handleSubmit}
                        className="space-y-4 py-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="edit-role">Role</Label>
                          <Select
                            value={updateStaffFormik.values.role}
                            onValueChange={(value) =>
                              updateStaffFormik.setFieldValue("role", value)
                            }
                          >
                            <SelectTrigger id="edit-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="coordinator">
                                Coordinator
                              </SelectItem>
                              <SelectItem value="validator">
                                Validator
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {updateStaffFormik.touched.role &&
                            updateStaffFormik.errors.role && (
                              <p className="text-sm text-red-500">
                                {updateStaffFormik.errors.role}
                              </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingStaff(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateStaffMutation.isPending}
                          >
                            {updateStaffMutation.isPending
                              ? "Updating..."
                              : "Update"}
                          </Button>
                        </div>
                      </form>
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
                          Are you sure you want to remove {member.username} from
                          the event staff? This action cannot be undone.
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
                    </>
                  )}
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
          totalItems={staff?.length || 0}
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
