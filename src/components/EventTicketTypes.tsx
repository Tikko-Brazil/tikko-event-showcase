import React, { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
import SuccessSnackbar from "./SuccessSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";

// Gender enum similar to InviteStatus
export enum TicketGender {
  MALE = "male",
  FEMALE = "female",
  ANY = "any",
}

interface EventTicketTypesProps {
  eventId: number;
}

export const EventTicketTypes = ({ eventId }: EventTicketTypesProps) => {
  const [ticketTypeSearch, setTicketTypeSearch] = useState("");
  const [ticketTypeFilter, setTicketTypeFilter] = useState("all");
  const [ticketTypePage, setTicketTypePage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 6;
  const ticketPricingGateway = new TicketPricingGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );
  const queryClient = useQueryClient();

  // Validation schema for create
  const createValidationSchema = Yup.object({
    ticket_type: Yup.string().required("Ticket type is required"),
    gender: Yup.string().required("Gender is required"),
    price: Yup.number()
      .required("Price is required")
      .min(0, "Price must be greater than or equal to 0"),
  });

  // Validation schema for edit (includes active field)
  const editValidationSchema = Yup.object({
    ticket_type: Yup.string().required("Ticket type is required"),
    gender: Yup.string().required("Gender is required"),
    price: Yup.number()
      .required("Price is required")
      .min(0, "Price must be greater than or equal to 0"),
    active: Yup.boolean().required(),
  });

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

  // Create ticket pricing mutation
  const createTicketPricingMutation = useMutation({
    mutationFn: async (values: any) => {
      const ticketData = {
        event_id: eventId,
        ticket_type: values.ticket_type,
        gender: values.gender,
        price: values.price,
      };
      return ticketPricingGateway.createTicketPricing(ticketData);
    },
    onSuccess: () => {
      setSuccessMessage("Ticket type created successfully");
      setShowSuccessSnackbar(true);
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["event-ticket-pricings", eventId],
      });
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Error creating ticket type");
      setShowErrorSnackbar(true);
    },
  });

  // Update ticket pricing mutation
  const updateTicketPricingMutation = useMutation({
    mutationFn: async (values: any) => {
      const ticketData = {
        ticket_type: values.ticket_type,
        gender: values.gender,
        price: values.price,
        active: values.active,
      };
      return ticketPricingGateway.updateTicketPricing(editingTicket.id, ticketData);
    },
    onSuccess: () => {
      setSuccessMessage("Ticket type updated successfully");
      setShowSuccessSnackbar(true);
      setIsEditDialogOpen(false);
      setEditingTicket(null);
      queryClient.invalidateQueries({ queryKey: ["event-ticket-pricings", eventId] });
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Error updating ticket type");
      setShowErrorSnackbar(true);
    },
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

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <Formik
              initialValues={{
                ticket_type: "",
                gender: "",
                price: "",
              }}
              validationSchema={createValidationSchema}
              onSubmit={(values) => {
                createTicketPricingMutation.mutate({
                  ...values,
                  price: parseFloat(values.price),
                });
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <Label htmlFor="ticket_type">Ticket Type Name</Label>
                    <Field
                      as={Input}
                      id="ticket_type"
                      name="ticket_type"
                      placeholder="VIP, General Admission, etc."
                    />
                    <ErrorMessage
                      name="ticket_type"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          id="male"
                          name="gender"
                          value={TicketGender.MALE}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="male" className="text-sm font-normal">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          id="female"
                          name="gender"
                          value={TicketGender.FEMALE}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="female" className="text-sm font-normal">
                          Female
                        </Label>
                      </div>
                    </div>
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (R$)</Label>
                    <Field
                      as={Input}
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                    />
                    <ErrorMessage
                      name="price"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || createTicketPricingMutation.isPending
                      }
                    >
                      {createTicketPricingMutation.isPending
                        ? "Creating..."
                        : "Create Ticket Type"}
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
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
                    <Badge variant="outline">
                      {ticketType.gender === "male" ? "Masculino" : "Feminino"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingTicket(ticketType);
                      setIsEditDialogOpen(true);
                    }}
                  >
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

      {/* Edit Ticket Type Dialog */}
      {editingTicket && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Ticket Type</DialogTitle>
              <DialogDescription>
                Modify ticket type settings and pricing.
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{
                ticket_type: editingTicket.ticket_type,
                gender: editingTicket.gender,
                price: editingTicket.price.toString(),
                active: editingTicket.active,
              }}
              validationSchema={editValidationSchema}
              onSubmit={(values) => {
                updateTicketPricingMutation.mutate({
                  ...values,
                  price: parseFloat(values.price),
                });
              }}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-4">
                  <div>
                    <Label htmlFor="edit_ticket_type">Ticket Type Name</Label>
                    <Field
                      as={Input}
                      id="edit_ticket_type"
                      name="ticket_type"
                      placeholder="VIP, General Admission, etc."
                    />
                    <ErrorMessage
                      name="ticket_type"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          id="edit_male"
                          name="gender"
                          value={TicketGender.MALE}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="edit_male" className="text-sm font-normal">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          id="edit_female"
                          name="gender"
                          value={TicketGender.FEMALE}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="edit_female" className="text-sm font-normal">Female</Label>
                      </div>
                    </div>
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_price">Price (R$)</Label>
                    <Field
                      as={Input}
                      id="edit_price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                    />
                    <ErrorMessage
                      name="price"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Field
                      type="checkbox"
                      id="edit_active"
                      name="active"
                      checked={values.active}
                      onChange={(e: any) => setFieldValue("active", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="edit_active">Active</Label>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setEditingTicket(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || updateTicketPricingMutation.isPending}
                    >
                      {updateTicketPricingMutation.isPending ? "Updating..." : "Update Ticket Type"}
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
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
