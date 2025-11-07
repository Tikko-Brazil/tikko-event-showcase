import React, { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  ticketTypes: Yup.array().when("isTicketSpecific", {
    is: true,
    then: (schema) => schema.min(1, "Selecione pelo menos um tipo de ingresso"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const EventCoupons = ({ eventId }: EventCouponsProps) => {
  const { t, i18n } = useTranslation();
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

  // Helper function to format numbers according to current locale
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return value.toLocaleString(locale, options);
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    const currency = i18n.language === 'pt' ? 'BRL' : 'USD';
    return value.toLocaleString(locale, {
      style: 'currency',
      currency: currency,
    });
  };

  const itemsPerPage = 8;
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
          ? values.ticketTypes.map((id: string) => parseInt(id))
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
        ticket_pricing_ids: values.isTicketSpecific
          ? values.ticketTypes.map((id: string) => parseInt(id))
          : [],
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
    queryKey: ["event-coupons", eventId, couponPage, couponFilter, debouncedSearch],
    queryFn: () => couponGateway.getEventCoupons(
      eventId,
      couponPage,
      itemsPerPage,
      undefined,
      couponFilter === "all" ? undefined : couponFilter,
      debouncedSearch || undefined
    ),
    enabled: !!eventId,
  });

  // Fetch active ticket pricings when checkbox is checked
  const { data: ticketPricingsData, isLoading: isLoadingTicketPricings } = useQuery(
    {
      queryKey: ["event-ticket-pricings", eventId],
      queryFn: () =>
        ticketPricingGateway.getTicketPricingByEvent(eventId, 1, 100, "Active"),
      enabled: !!eventId && currentFormValues.isTicketSpecific,
    }
  );

  const ticketPricings = ticketPricingsData?.ticket_pricings || [];

  // Restore focus after query updates
  React.useEffect(() => {
    if (couponSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [couponsData, couponSearch]);

  const allCoupons = couponsData?.coupons || [];
  const totalPages = couponsData?.total_pages || 1;
  const totalItems = couponsData?.total || 0;

  // Use backend pagination data directly
  const from = ((couponsData?.page || 1) - 1) * (couponsData?.limit || itemsPerPage);
  const to = Math.min(from + (couponsData?.limit || itemsPerPage), totalItems);
  const paginatedCoupons = allCoupons;

  const filterOptions = [
    { value: "all", label: t("eventManagement.coupons.search.filters.all") },
    { value: "active", label: t("eventManagement.coupons.search.filters.active") },
    { value: "inactive", label: t("eventManagement.coupons.search.filters.inactive") },
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
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">{t("eventManagement.coupons.title")}</h2>

        <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("eventManagement.coupons.actions.createCoupon")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("eventManagement.coupons.createDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("eventManagement.coupons.createDialog.description")}
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
                ticketTypes: [] as string[],
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
                      <Label htmlFor="code">{t("eventManagement.coupons.createDialog.fields.code")}</Label>
                      <Input
                        id="code"
                        name="code"
                        value={values.code}
                        onChange={(e) =>
                          setFieldValue("code", e.target.value.toUpperCase())
                        }
                        onBlur={handleBlur}
                        placeholder={t("eventManagement.coupons.createDialog.fields.codePlaceholder")}
                        className="uppercase"
                      />
                      {touched.code && errors.code && (
                        <div className="text-red-500 text-sm mt-1">
                          {String(errors.code)}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>{t("eventManagement.coupons.createDialog.fields.type")}</Label>
                      <Select
                        value={values.type}
                        onValueChange={(value) => setFieldValue("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            {t("eventManagement.coupons.types.percentage")}
                          </SelectItem>
                          <SelectItem value="fixed">
                            {t("eventManagement.coupons.types.fixed")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {values.type === "percentage" ? (
                      <div>
                        <Label>{t("eventManagement.coupons.createDialog.fields.value")}</Label>
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
                        <Label>{t("eventManagement.coupons.createDialog.fields.value")}</Label>
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
                      <Label>{t("eventManagement.coupons.createDialog.fields.maxUsage")}</Label>
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
                      <Label htmlFor="active">{t("eventManagement.coupons.status.active")}</Label>
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
                        {t("eventManagement.coupons.createDialog.fields.ticketSpecific")}
                      </Label>
                    </div>

                    {values.isTicketSpecific && (
                      <div>
                        <Label>Ticket Types</Label>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                          {isLoadingTicketPricings ? (
                            <div className="text-sm text-muted-foreground">
                              Carregando...
                            </div>
                          ) : ticketPricings && ticketPricings.length > 0 ? (
                            ticketPricings.map((pricing) => (
                              <div
                                key={pricing.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`pricing-${pricing.id}`}
                                  checked={values.ticketTypes.includes(
                                    pricing.id.toString()
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFieldValue("ticketTypes", [
                                        ...values.ticketTypes,
                                        pricing.id.toString(),
                                      ]);
                                    } else {
                                      setFieldValue(
                                        "ticketTypes",
                                        values.ticketTypes.filter(
                                          (id) => id !== pricing.id.toString()
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`pricing-${pricing.id}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {pricing.ticket_type} - {pricing.gender} (Lote{" "}
                                  {pricing.lot})
                                </Label>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Nenhum tipo de ingresso disponível
                            </div>
                          )}
                        </div>
                        {touched.ticketTypes && errors.ticketTypes && (
                          <div className="text-red-500 text-sm mt-1">
                            {String(errors.ticketTypes)}
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
                        {t("eventManagement.coupons.createDialog.buttons.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCouponMutation.isPending}
                      >
                        {createCouponMutation.isPending
                          ? "Criando..."
                          : t("eventManagement.coupons.createDialog.buttons.create")}
                      </Button>
                    </DialogFooter>
                  </form>
                );
              }}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <SearchAndFilter
        searchValue={couponSearch}
        onSearchChange={setCouponSearch}
        searchPlaceholder={t("eventManagement.coupons.search.placeholder")}
        filterValue={couponFilter}
        onFilterChange={setCouponFilter}
        filterOptions={filterOptions}
        searchInputRef={searchInputRef}
      />

      <Card>
        <CardHeader>
          <CardDescription>
            Mostrando {from + 1}-{to} de {totalItems} cupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mobile Header - Visible only on mobile */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2 md:hidden">
              <span className="col-span-4">{t("eventManagement.coupons.table.code")}</span>
              <span className="col-span-2">{t("eventManagement.coupons.table.value")}</span>
              <span className="col-span-2">{t("eventManagement.coupons.table.currentUsage")}</span>
              <span className="col-span-2 text-center">{t("eventManagement.coupons.table.status")}</span>
              <span className="col-span-1 text-center">{t("eventManagement.coupons.table.actions")}</span>
            </div>

            {/* Desktop Header - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <span className="col-span-4">{t("eventManagement.coupons.table.code")}</span>
              <span className="col-span-2">{t("eventManagement.coupons.table.value")}</span>
              <span className="col-span-3">{t("eventManagement.coupons.table.currentUsage")}</span>
              <span className="col-span-2 text-center">{t("eventManagement.coupons.table.status")}</span>
              <span className="col-span-1 text-center">{t("eventManagement.coupons.table.actions")}</span>
            </div>

            <div className="space-y-2">
              {paginatedCoupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("eventManagement.coupons.noCouponsFound")}
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
                          : formatCurrency(coupon.discount_value)}
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
                            width: `${(coupon.used_count / coupon.max_uses) * 100
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
                          className={`w-3 h-3 rounded-full ${coupon.active ? "bg-green-500" : "bg-gray-400"
                            }`}
                          title={coupon.active
                            ? t("eventManagement.coupons.status.active")
                            : t("eventManagement.coupons.status.inactive")}
                        />
                      </div>
                      {/* Desktop: Badge with text */}
                      <div className="hidden md:flex md:items-center md:justify-center">
                        <Badge
                          variant={coupon.active ? "default" : "secondary"}
                        >
                          {coupon.active
                            ? t("eventManagement.coupons.status.active")
                            : t("eventManagement.coupons.status.inactive")}
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
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={couponPage}
        totalPages={totalPages}
        onPageChange={setCouponPage}
        startIndex={from + 1}
        endIndex={to}
        totalItems={totalItems}
        itemName="cupons"
      />

      {/* Edit Coupon Dialog */}
      {editingCoupon && (
        <Dialog
          open={!!editingCoupon}
          onOpenChange={() => setEditingCoupon(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("eventManagement.coupons.editDialog.title")}: {editingCoupon.code}</DialogTitle>
              <DialogDescription>
                {t("eventManagement.coupons.editDialog.description")}
              </DialogDescription>
            </DialogHeader>

            <Formik
              initialValues={{
                maxUsage: editingCoupon.max_uses,
                isActive: editingCoupon.active,
                isTicketSpecific: !!(editingCoupon.ticket_pricings && editingCoupon.ticket_pricings.length > 0),
                ticketTypes: editingCoupon.ticket_pricings
                  ? editingCoupon.ticket_pricings.map((pricing: any) => pricing.id.toString())
                  : [],
              }}
              validationSchema={Yup.object({
                maxUsage: Yup.number()
                  .min(
                    editingCoupon.used_count,
                    `Uso máximo deve ser maior ou igual ao uso atual (${editingCoupon.used_count})`
                  )
                  .required("Uso máximo é obrigatório"),
                ticketTypes: Yup.array().when("isTicketSpecific", {
                  is: true,
                  then: (schema) =>
                    schema.min(1, "Selecione pelo menos um tipo de ingresso"),
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
                      <Label>{t("eventManagement.coupons.createDialog.fields.maxUsage")}</Label>
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
                      <Label htmlFor="editActive">{t("eventManagement.coupons.status.active")}</Label>
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
                        {t("eventManagement.coupons.createDialog.fields.ticketSpecific")}
                      </Label>
                    </div>

                    {values.isTicketSpecific && (
                      <div>
                        <Label>Ticket Types</Label>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                          {isLoadingTicketPricings ? (
                            <div className="text-sm text-muted-foreground">
                              Carregando...
                            </div>
                          ) : ticketPricings && ticketPricings.length > 0 ? (
                            ticketPricings.map((pricing) => (
                              <div
                                key={pricing.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`edit-pricing-${pricing.id}`}
                                  checked={values.ticketTypes.includes(
                                    pricing.id.toString()
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFieldValue("ticketTypes", [
                                        ...values.ticketTypes,
                                        pricing.id.toString(),
                                      ]);
                                    } else {
                                      setFieldValue(
                                        "ticketTypes",
                                        values.ticketTypes.filter(
                                          (id) => id !== pricing.id.toString()
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`edit-pricing-${pricing.id}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {pricing.ticket_type} - {pricing.gender} (Lote{" "}
                                  {pricing.lot})
                                </Label>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Nenhum tipo de ingresso disponível
                            </div>
                          )}
                        </div>
                        {touched.ticketTypes && errors.ticketTypes && (
                          <div className="text-red-500 text-sm mt-1">
                            {String(errors.ticketTypes)}
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
                        {t("eventManagement.coupons.editDialog.buttons.cancel")}
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
                            {t("eventManagement.coupons.editDialog.buttons.save")}
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
