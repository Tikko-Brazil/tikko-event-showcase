import React, { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Formik } from "formik";
import * as Yup from "yup";
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
import SuccessSnackbar from "./SuccessSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";

interface EventCouponsProps {
  eventId: number;
}

const validationSchema = Yup.object({
  code: Yup.string().required("Código é obrigatório"),
  type: Yup.string().required("Tipo é obrigatório"),
  value: Yup.number()
    .min(1, "Valor deve ser maior que 0")
    .required("Valor é obrigatório"),
  maxUsage: Yup.number()
    .min(1, "Uso máximo deve ser maior que 0")
    .required("Uso máximo é obrigatório"),
  ticketType: Yup.string().when("isTicketSpecific", {
    is: true,
    then: (schema) => schema.required("Tipo de ingresso é obrigatório"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const EventCoupons = ({ eventId }: EventCouponsProps) => {
  const [couponSearch, setCouponSearch] = useState("");
  const [couponFilter, setCouponFilter] = useState("all");
  const [couponPage, setCouponPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [currentFormValues, setCurrentFormValues] = useState({
    isTicketSpecific: false,
  });
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const itemsPerPage = 6;
  const couponGateway = new CouponGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );
  const ticketPricingGateway = new TicketPricingGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: async (values: any) => {
      const couponData = {
        event_id: eventId,
        code: values.code,
        discount_type: values.type,
        discount_value: values.value,
        max_uses: values.maxUsage,
        active: values.isActive,
        ticket_pricing_id: values.isTicketSpecific
          ? [parseInt(values.ticketType)]
          : null,
      };
      return couponGateway.createCoupon(couponData);
    },
    onSuccess: () => {
      setShowSuccessSnackbar(true);
      queryClient.invalidateQueries({ queryKey: ["event-coupons", eventId] });
      setIsCreateCouponOpen(false);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Erro ao criar cupom");
      setShowErrorSnackbar(true);
    },
  });

  // Update coupon mutation
  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: any }) => {
      const updateData = {
        max_uses: values.maxUsage,
        active: values.isActive,
        ticket_pricing_id: values.isTicketSpecific
          ? parseInt(values.ticketType)
          : null,
      };
      return couponGateway.updateCoupon(id, updateData);
    },
    onSuccess: () => {
      setShowSuccessSnackbar(true);
      queryClient.invalidateQueries({ queryKey: ["event-coupons", eventId] });
      setEditingCoupon(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Erro ao atualizar cupom");
      setShowErrorSnackbar(true);
    },
  });

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
      enabled: !!eventId && currentFormValues.isTicketSpecific,
    }
  );

  // Restore focus after query updates
  React.useEffect(() => {
    if (couponSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [couponsData, couponSearch]);

  const allCoupons = couponsData?.coupons || [];

  // Filter coupons based on status and search
  const filteredCoupons = allCoupons.filter((coupon) => {
    const matchesStatus =
      couponFilter === "all" ||
      (couponFilter === "active" && coupon.active) ||
      (couponFilter === "inactive" && !coupon.active);
    const matchesSearch = coupon.code
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate pagination
  const from = (couponPage - 1) * itemsPerPage;
  const to = Math.min(couponPage * itemsPerPage, filteredCoupons.length);
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice(from, to);

  const filterOptions = [
    { value: "all", label: "All Coupons" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const onEditCoupon = (coupon: any) => {
    setEditingCoupon({ ...coupon });
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
      <div className="flex justify-between items-center">
        <SearchAndFilter
          searchValue={couponSearch}
          onSearchChange={setCouponSearch}
          searchPlaceholder="Buscar cupons..."
          filterValue={couponFilter}
          onFilterChange={setCouponFilter}
          filterOptions={filterOptions}
          searchInputRef={searchInputRef}
        />

        <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
              <DialogDescription>
                Crie um novo cupom de desconto para o evento.
              </DialogDescription>
            </DialogHeader>

            <Formik
              initialValues={{
                code: "",
                type: "percentage",
                value: 10,
                maxUsage: 100,
                isActive: true,
                isTicketSpecific: false,
                ticketType: "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) => {
                createCouponMutation.mutate(values, {
                  onSuccess: () => {
                    resetForm();
                  },
                });
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
              }) => {
                // Update state for query when isTicketSpecific changes
                React.useEffect(() => {
                  setCurrentFormValues({
                    isTicketSpecific: values.isTicketSpecific,
                  });
                }, [values.isTicketSpecific]);

                return (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="code">Coupon Code</Label>
                      <Input
                        id="code"
                        name="code"
                        value={values.code}
                        onChange={(e) =>
                          setFieldValue("code", e.target.value.toUpperCase())
                        }
                        onBlur={handleBlur}
                        placeholder="DISCOUNT20"
                        className="uppercase"
                      />
                      {touched.code && errors.code && (
                        <div className="text-red-500 text-sm mt-1">
                          {String(errors.code)}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Discount Type</Label>
                      <Select
                        value={values.type}
                        onValueChange={(value) => setFieldValue("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage Discount
                          </SelectItem>
                          <SelectItem value="fixed">
                            Fixed Amount (R$)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {values.type === "percentage" ? (
                      <div>
                        <Label>Discount Percentage</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[values.value]}
                            onValueChange={(value) =>
                              setFieldValue("value", value[0])
                            }
                            max={100}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              1%
                            </span>
                            <Input
                              type="number"
                              value={values.value}
                              onChange={(e) =>
                                setFieldValue(
                                  "value",
                                  Math.min(
                                    100,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                )
                              }
                              className="w-20 text-center"
                              min={1}
                              max={100}
                            />
                            <span className="text-sm text-muted-foreground">
                              100%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label>Fixed Discount Amount (BRL)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[values.value]}
                            onValueChange={(value) =>
                              setFieldValue("value", value[0])
                            }
                            max={500}
                            min={1}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              R$ 1
                            </span>
                            <Input
                              type="number"
                              value={values.value}
                              onChange={(e) =>
                                setFieldValue(
                                  "value",
                                  Math.min(
                                    500,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                )
                              }
                              className="w-20 text-center"
                              min={1}
                              max={500}
                              step={5}
                            />
                            <span className="text-sm text-muted-foreground">
                              R$ 500
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Max Usage</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[values.maxUsage]}
                          onValueChange={(value) =>
                            setFieldValue("maxUsage", value[0])
                          }
                          max={1000}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            1
                          </span>
                          <Input
                            type="number"
                            value={values.maxUsage}
                            onChange={(e) =>
                              setFieldValue(
                                "maxUsage",
                                Math.min(
                                  1000,
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              )
                            }
                            className="w-20 text-center"
                            min={1}
                            max={1000}
                          />
                          <span className="text-sm text-muted-foreground">
                            1000
                          </span>
                        </div>
                      </div>
                      {touched.maxUsage && errors.maxUsage && (
                        <div className="text-red-500 text-sm mt-1">
                          {String(errors.maxUsage)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={values.isActive}
                        onCheckedChange={(checked) =>
                          setFieldValue("isActive", !!checked)
                        }
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ticketSpecific"
                        checked={values.isTicketSpecific}
                        onCheckedChange={(checked) =>
                          setFieldValue("isTicketSpecific", !!checked)
                        }
                      />
                      <Label htmlFor="ticketSpecific">
                        Apply to specific ticket type only
                      </Label>
                    </div>

                    {values.isTicketSpecific && (
                      <div>
                        <Label>Ticket Type</Label>
                        <Select
                          value={values.ticketType}
                          onValueChange={(value) =>
                            setFieldValue("ticketType", value)
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
                                  {pricing.ticket_type} - {pricing.gender} (Lote{" "}
                                  {pricing.lot})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {touched.ticketType && errors.ticketType && (
                          <div className="text-red-500 text-sm mt-1">
                            {String(errors.ticketType)}
                          </div>
                        )}
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateCouponOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCouponMutation.isPending}
                      >
                        {createCouponMutation.isPending
                          ? "Criando..."
                          : "Create Coupon"}
                      </Button>
                    </DialogFooter>
                  </form>
                );
              }}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cupons do Evento</CardTitle>
          <CardDescription>
            Mostrando {from + 1}-{to} de {filteredCoupons.length} cupons
          </CardDescription>
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
              {paginatedCoupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum cupom encontrado
                </div>
              ) : (
                paginatedCoupons.map((coupon, index) => (
                  <div
                    key={`${coupon.id}-${couponPage}-${index}`}
                    className="grid grid-cols-12 gap-2 md:gap-4 text-sm py-3 border-b border-border/50 last:border-0 items-center"
                  >
                    {/* Code */}
                    <div className="col-span-4 md:col-span-4">
                      <span className="font-mono font-medium text-xs md:text-sm break-all">
                        {coupon.code}
                      </span>
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

                    {/* Status */}
                    <div className="col-span-2 md:col-span-2">
                      {/* Mobile: Visual indicator only */}
                      <div className="md:hidden flex items-center justify-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            coupon.active ? "bg-green-500" : "bg-gray-400"
                          }`}
                          title={coupon.active ? "Ativo" : "Inativo"}
                        />
                      </div>
                      {/* Desktop: Badge with text */}
                      <div className="hidden md:flex md:items-center md:justify-center">
                        <Badge
                          variant={coupon.active ? "default" : "secondary"}
                        >
                          {coupon.active ? "Ativo" : "Inativo"}
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
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={couponPage}
                totalPages={totalPages}
                onPageChange={setCouponPage}
                startIndex={from + 1}
                endIndex={to}
                totalItems={filteredCoupons.length}
                itemName="cupons"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Coupon Dialog */}
      {editingCoupon && (
        <Dialog
          open={!!editingCoupon}
          onOpenChange={() => setEditingCoupon(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Coupon: {editingCoupon.code}</DialogTitle>
              <DialogDescription>
                Modify coupon settings and restrictions.
              </DialogDescription>
            </DialogHeader>

            <Formik
              initialValues={{
                maxUsage: editingCoupon.max_uses,
                isActive: editingCoupon.active,
                isTicketSpecific: !!editingCoupon.ticket_pricing_id,
                ticketType: editingCoupon.ticket_pricing_id?.toString() || "",
              }}
              validationSchema={Yup.object({
                maxUsage: Yup.number()
                  .min(
                    editingCoupon.used_count,
                    `Uso máximo deve ser maior ou igual ao uso atual (${editingCoupon.used_count})`
                  )
                  .required("Uso máximo é obrigatório"),
                ticketType: Yup.string().when("isTicketSpecific", {
                  is: true,
                  then: (schema) =>
                    schema.required("Tipo de ingresso é obrigatório"),
                  otherwise: (schema) => schema.notRequired(),
                }),
              })}
              onSubmit={(values) => {
                updateCouponMutation.mutate({ id: editingCoupon.id, values });
              }}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleSubmit,
                setFieldValue,
              }) => {
                // Update state for query when isTicketSpecific changes
                React.useEffect(() => {
                  setCurrentFormValues({
                    isTicketSpecific: values.isTicketSpecific,
                  });
                }, [values.isTicketSpecific]);

                return (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Max Usage</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[values.maxUsage]}
                          onValueChange={(value) =>
                            setFieldValue("maxUsage", value[0])
                          }
                          max={1000}
                          min={editingCoupon.used_count}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {editingCoupon.used_count}
                          </span>
                          <Input
                            type="number"
                            value={values.maxUsage}
                            onChange={(e) =>
                              setFieldValue(
                                "maxUsage",
                                Math.min(
                                  1000,
                                  Math.max(
                                    editingCoupon.used_count,
                                    parseInt(e.target.value) ||
                                      editingCoupon.used_count
                                  )
                                )
                              )
                            }
                            className="w-20 text-center"
                            min={editingCoupon.used_count}
                            max={1000}
                          />
                          <span className="text-sm text-muted-foreground">
                            1000
                          </span>
                        </div>
                      </div>
                      {touched.maxUsage && errors.maxUsage && (
                        <div className="text-red-500 text-sm mt-1">
                          {String(errors.maxUsage)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editActive"
                        checked={values.isActive}
                        onCheckedChange={(checked) =>
                          setFieldValue("isActive", checked)
                        }
                      />
                      <Label htmlFor="editActive">Active</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editTicketSpecific"
                        checked={values.isTicketSpecific}
                        onCheckedChange={(checked) =>
                          setFieldValue("isTicketSpecific", checked)
                        }
                      />
                      <Label htmlFor="editTicketSpecific">
                        Apply to specific ticket type only
                      </Label>
                    </div>

                    {values.isTicketSpecific && (
                      <div>
                        <Label>Ticket Type</Label>
                        <Select
                          value={values.ticketType}
                          onValueChange={(value) =>
                            setFieldValue("ticketType", value)
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
                                  {pricing.ticket_type} - {pricing.gender} (Lote{" "}
                                  {pricing.lot})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {touched.ticketType && errors.ticketType && (
                          <div className="text-red-500 text-sm mt-1">
                            {String(errors.ticketType)}
                          </div>
                        )}
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingCoupon(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateCouponMutation.isPending}
                      >
                        {updateCouponMutation.isPending ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                );
              }}
            </Formik>
          </DialogContent>
        </Dialog>
      )}

      <SuccessSnackbar
        visible={showSuccessSnackbar}
        onDismiss={() => setShowSuccessSnackbar(false)}
        message="Cupom criado com sucesso"
      />

      <ErrorSnackbar
        visible={showErrorSnackbar}
        onDismiss={() => setShowErrorSnackbar(false)}
        message={errorMessage}
      />
    </div>
  );
};
