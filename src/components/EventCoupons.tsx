import React, { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, Edit, Save } from "lucide-react";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";
import { CouponGateway } from "@/lib/CouponGateway";
import { TicketPricingGateway } from "@/lib/TicketPricingGateway";

interface NewCoupon {
  code: string;
  type: string;
  value: number;
  maxUsage: number;
  isActive: boolean;
  isTicketSpecific: boolean;
  ticketType: string;
}

interface EventCouponsProps {
  eventId: number;
}

export const EventCoupons = ({ eventId }: EventCouponsProps) => {
  const [couponSearch, setCouponSearch] = useState("");
  const [couponFilter, setCouponFilter] = useState("all");
  const [couponPage, setCouponPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [newCoupon, setNewCoupon] = useState<NewCoupon>({
    code: "",
    type: "percentage",
    value: 10,
    maxUsage: 100,
    isActive: true,
    isTicketSpecific: false,
    ticketType: "",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 6;
  const couponGateway = new CouponGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );
  const ticketPricingGateway = new TicketPricingGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );
  const ticketTypes = ["VIP", "General", "Student"]; // Mock data

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((searchTerm: string) => {
      setDebouncedSearch(searchTerm);
    }, 500),
    []
  );

  // Update debounced search when couponSearch changes
  React.useEffect(() => {
    debouncedSetSearch(couponSearch);
  }, [couponSearch, debouncedSetSearch]);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCouponPage(1);
  }, [couponFilter, debouncedSearch]);

  // Fetch coupons using React Query
  const {
    data: couponsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-coupons", eventId],
    queryFn: () => couponGateway.getEventCoupons(eventId),
    enabled: !!eventId,
  });

  // Fetch active ticket pricings when checkbox is checked
  const { data: ticketPricings, isLoading: isLoadingTicketPricings } = useQuery(
    {
      queryKey: ["event-ticket-pricings", eventId],
      queryFn: () =>
        ticketPricingGateway.getTicketPricingByEvent(eventId, "Active"),
      enabled: !!eventId && newCoupon.isTicketSpecific,
    }
  );

  // Restore focus after query updates
  React.useEffect(() => {
    if (couponSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [couponsData, couponSearch]);

  const allCoupons = couponsData?.coupons || [];

  // Filter coupons based on search and filter
  const filteredCoupons = allCoupons.filter((coupon) => {
    const matchesSearch = coupon.code
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    const matchesFilter =
      couponFilter === "all" ||
      (couponFilter === "active" && coupon.active) ||
      (couponFilter === "inactive" && !coupon.active);
    return matchesSearch && matchesFilter;
  });

  // Pagination for coupons
  const totalCouponPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (couponPage - 1) * itemsPerPage;
  const paginatedCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const filterOptions = [
    { value: "all", label: "All Coupons" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const onCreateCoupon = () => {
    console.log("Creating coupon:", newCoupon);
    setIsCreateCouponOpen(false);
    setNewCoupon({
      code: "",
      type: "percentage",
      value: 10,
      maxUsage: 100,
      isActive: true,
      isTicketSpecific: false,
      ticketType: "",
    });
  };

  const onEditCoupon = (coupon: any) => {
    setEditingCoupon({ ...coupon });
  };

  const onSaveEdit = () => {
    console.log("Saving coupon:", editingCoupon);
    setEditingCoupon(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading coupons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading coupons</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Coupons Management</h2>

        <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Configure your new discount coupon settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="DISCOUNT20"
                  className="uppercase"
                />
              </div>

              <div>
                <Label>Discount Type</Label>
                <Select
                  value={newCoupon.type}
                  onValueChange={(value) =>
                    setNewCoupon({ ...newCoupon, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      Percentage Discount
                    </SelectItem>
                    <SelectItem value="fixed">Fixed Amount (BRL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCoupon.type === "percentage" ? (
                <div>
                  <Label>Discount Percentage: {newCoupon.value}%</Label>
                  <Slider
                    value={[newCoupon.value]}
                    onValueChange={(value) =>
                      setNewCoupon({ ...newCoupon, value: value[0] })
                    }
                    max={100}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="value">Fixed Amount (BRL)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="50"
                  />
                </div>
              )}

              <div>
                <Label>Max Usage: {newCoupon.maxUsage}</Label>
                <Slider
                  value={[newCoupon.maxUsage]}
                  onValueChange={(value) =>
                    setNewCoupon({ ...newCoupon, maxUsage: value[0] })
                  }
                  max={1000}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={newCoupon.isActive}
                  onCheckedChange={(checked) =>
                    setNewCoupon({ ...newCoupon, isActive: !!checked })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ticketSpecific"
                  checked={newCoupon.isTicketSpecific}
                  onCheckedChange={(checked) =>
                    setNewCoupon({
                      ...newCoupon,
                      isTicketSpecific: !!checked,
                    })
                  }
                />
                <Label htmlFor="ticketSpecific">
                  Apply to specific ticket type only
                </Label>
              </div>

              {newCoupon.isTicketSpecific && (
                <div>
                  <Label>Ticket Type</Label>
                  <Select
                    value={newCoupon.ticketType}
                    onValueChange={(value) =>
                      setNewCoupon({ ...newCoupon, ticketType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTicketPricings ? (
                        <SelectItem value="loading" disabled>
                          Carregando...
                        </SelectItem>
                      ) : (
                        ticketPricings?.map((pricing) => (
                          <SelectItem
                            key={pricing.id}
                            value={pricing.id.toString()}
                          >
                            {pricing.ticket_type} -{" "}
                            {pricing.gender === "male"
                              ? "Masculino"
                              : "Feminino"}{" "}
                            (Lote {pricing.lot})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateCouponOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={onCreateCoupon}>Create Coupon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <SearchAndFilter
        searchValue={couponSearch}
        onSearchChange={setCouponSearch}
        searchPlaceholder="Search coupons..."
        filterValue={couponFilter}
        onFilterChange={setCouponFilter}
        filterOptions={filterOptions}
        searchInputRef={searchInputRef}
      />

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mobile Header - Visible only on mobile */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2 md:hidden">
              <span className="col-span-4">Code</span>
              <span className="col-span-2">Value</span>
              <span className="col-span-2">Usage</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-1 text-center">Actions</span>
            </div>

            {/* Desktop Header - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <span className="col-span-4">Code</span>
              <span className="col-span-2">Value</span>
              <span className="col-span-3">Usage</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-1 text-center">Actions</span>
            </div>

            <div className="space-y-2">
              {paginatedCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="grid grid-cols-12 gap-2 md:gap-4 text-sm py-3 border-b border-border/50 last:border-0 items-center"
                >
                  {/* Code - Takes majority of width on mobile */}
                  <div className="col-span-4 md:col-span-4">
                    <span className="font-mono font-medium text-xs md:text-sm break-all">
                      {coupon.code}
                    </span>
                    {/* {coupon.isTicketSpecific && (
                      <div className="text-xs text-muted-foreground mt-1">
                        → {coupon.ticketType}
                      </div>
                    )} */}
                  </div>

                  {/* Value */}
                  <div className="col-span-2 md:col-span-2">
                    <span className="text-xs md:text-sm">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `R$ ${coupon.discount_value}`}
                    </span>
                  </div>

                  {/* Usage */}
                  <div className="col-span-2 md:col-span-3">
                    <div className="text-xs md:text-sm">
                      {coupon.used_count}/{coupon.max_uses}
                    </div>
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div
                        className="bg-primary h-1 rounded-full"
                        style={{
                          width: `${
                            (coupon.used_count / coupon.max_uses) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status - Different for mobile vs desktop */}
                  <div className="col-span-2 md:col-span-2">
                    {/* Mobile: Visual indicator only */}
                    <div className="md:hidden flex items-center justify-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          coupon.active ? "bg-green-500" : "bg-gray-400"
                        }`}
                        title={coupon.active ? "Active" : "Inactive"}
                      />
                    </div>
                    {/* Desktop: Badge with text */}
                    <div className="hidden md:flex md:items-center md:justify-center">
                      <Badge variant={coupon.active ? "default" : "secondary"}>
                        {coupon.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditCoupon(coupon)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={couponPage}
              totalPages={totalCouponPages}
              onPageChange={setCouponPage}
              startIndex={startIndex}
              endIndex={Math.min(
                startIndex + itemsPerPage,
                filteredCoupons.length
              )}
              totalItems={filteredCoupons.length}
              itemName="coupons"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Coupon Dialog */}
      {editingCoupon && (
        <Dialog
          open={!!editingCoupon}
          onOpenChange={() => setEditingCoupon(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Coupon: {editingCoupon.code}</DialogTitle>
              <DialogDescription>
                Modify coupon settings and restrictions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Max Usage: {editingCoupon.maxUsage}</Label>
                <Slider
                  value={[editingCoupon.maxUsage]}
                  onValueChange={(value) =>
                    setEditingCoupon({ ...editingCoupon, maxUsage: value[0] })
                  }
                  max={1000}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editActive"
                  checked={editingCoupon.isActive}
                  onCheckedChange={(checked) =>
                    setEditingCoupon({ ...editingCoupon, isActive: checked })
                  }
                />
                <Label htmlFor="editActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editTicketSpecific"
                  checked={editingCoupon.isTicketSpecific}
                  onCheckedChange={(checked) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      isTicketSpecific: checked,
                    })
                  }
                />
                <Label htmlFor="editTicketSpecific">
                  Apply to specific ticket type only
                </Label>
              </div>

              {editingCoupon.isTicketSpecific && (
                <div>
                  <Label>Ticket Type</Label>
                  <Select
                    value={editingCoupon.ticketType || ""}
                    onValueChange={(value) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        ticketType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCoupon(null)}>
                Cancel
              </Button>
              <Button onClick={onSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
