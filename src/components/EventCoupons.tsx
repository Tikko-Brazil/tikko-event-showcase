import React, { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Plus, Edit, Save, Trash2, Copy, Share2, Link as LinkIcon, Check } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";
import { useListCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/api/coupon/api";
import { couponManagementErrorMessage } from "@/api/coupon/errors";
import { AppError } from "@/api/errors";
import { toast } from "@/hooks/use-toast";
import { TicketPricingGateway } from "@/lib/TicketPricingGateway";

interface EventCouponsProps {
  eventId: number;
  eventSlug?: string;
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

export const EventCoupons = ({ eventId, eventSlug }: EventCouponsProps) => {
  const { t, i18n } = useTranslation();
  const [couponSearch, setCouponSearch] = useState("");
  const [couponFilter, setCouponFilter] = useState<"active" | "inactive" | "all">("all");
  const [couponPage, setCouponPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [currentFormValues, setCurrentFormValues] = useState({
    isTicketSpecific: false,
  });
  const [copiedCouponId, setCopiedCouponId] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const itemsPerPage = 8;

  const { mutateAsync: createCoupon } = useCreateCoupon();
  const { mutateAsync: updateCoupon } = useUpdateCoupon();
  const { mutateAsync: deleteCoupon } = useDeleteCoupon();

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

  const ticketPricingGateway = new TicketPricingGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );

  const handleCreateCoupon = async (values: any) => {
    try {
      await createCoupon({
        event_id: eventId,
        code: values.code,
        discount_type: values.type,
        discount_value: values.value,
        max_usage: values.maxUsage,
        is_active: values.isActive,
        ticket_pricing_ids: values.isTicketSpecific
          ? values.ticketTypes.map((id: string) => parseInt(id))
          : undefined,
      });
      toast({ description: t("eventManagement.coupons.createDialog.success") });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setIsCreateCouponOpen(false);
    } catch (error) {
      const message = couponManagementErrorMessage(error as AppError, t);
      toast({ variant: "destructive", description: message });
    }
  };

  const handleUpdateCoupon = async (id: number, values: any) => {
    try {
      await updateCoupon({
        id,
        data: {
          max_uses: values.maxUsage,
          active: values.isActive,
          ticket_pricing_ids: values.isTicketSpecific
            ? values.ticketTypes.map((id: string) => parseInt(id))
            : [],
        },
      });
      toast({ description: t("eventManagement.coupons.editDialog.success") });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setEditingCoupon(null);
    } catch (error) {
      const message = couponManagementErrorMessage(error as AppError, t);
      toast({ variant: "destructive", description: message });
    }
  };

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
  const { data: couponsData, isLoading } = useListCoupons({
    event_id: eventId,
    page: couponPage,
    limit: itemsPerPage,
    status: couponFilter,
    search: debouncedSearch || undefined,
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
              onSubmit={async (values, { resetForm }) => {
                await handleCreateCoupon(values);
                resetForm();
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
                isSubmitting,
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
                        disabled={isSubmitting}
                      >
                        {isSubmitting
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
        onFilterChange={(value) => setCouponFilter(value as "active" | "inactive" | "all")}
        filterOptions={filterOptions}
        searchInputRef={searchInputRef}
      />

      {/* Coupons Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedCoupons.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t("eventManagement.coupons.noCouponsFound")}
          </div>
        ) : (
          paginatedCoupons.map((coupon) => (
            <Card key={coupon.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-mono break-all">
                      {coupon.code}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={coupon.active ? "default" : "secondary"}
                      >
                        {coupon.active
                          ? t("eventManagement.coupons.status.active")
                          : t("eventManagement.coupons.status.inactive")}
                      </Badge>
                      <Badge variant="outline">
                        {coupon.discount_type === "percentage"
                          ? t("eventManagement.coupons.types.percentage")
                          : t("eventManagement.coupons.types.fixed")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        toast({
                          title: t("eventManagement.coupons.copiedToClipboard"),
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={async () => {
                          const eventPath = eventSlug ? eventSlug : `${eventId}`;
                          const url = `${window.location.origin}/event/${eventPath}?coupon=${encodeURIComponent(coupon.code)}`;
                          try {
                            await navigator.clipboard.writeText(url);
                            setCopiedCouponId(coupon.id);
                            toast({
                              title: t("eventManagement.coupons.linkCopied"),
                            });
                            setTimeout(() => setCopiedCouponId(null), 2000);
                          } catch (err) {
                            toast({
                              title: t("eventManagement.coupons.linkCopyError"),
                              variant: "destructive",
                            });
                          }
                        }}>
                          {copiedCouponId === coupon.id ? (
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                          ) : (
                            <LinkIcon className="w-4 h-4 mr-2" />
                          )}
                          {t("eventManagement.coupons.share.copyLink")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const eventPath = eventSlug ? eventSlug : `${eventId}`;
                          const url = `${window.location.origin}/event/${eventPath}?coupon=${encodeURIComponent(coupon.code)}`;
                          const text = `${t("eventManagement.coupons.share.useCode")} ${coupon.code}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                        }}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const eventPath = eventSlug ? eventSlug : `${eventId}`;
                          const url = `${window.location.origin}/event/${eventPath}?coupon=${encodeURIComponent(coupon.code)}`;
                          const text = `${t("eventManagement.coupons.share.useCode")} ${coupon.code}`;
                          window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                        }}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                          </svg>
                          Telegram
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const eventPath = eventSlug ? eventSlug : `${eventId}`;
                          const url = `${window.location.origin}/event/${eventPath}?coupon=${encodeURIComponent(coupon.code)}`;
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                        }}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const eventPath = eventSlug ? eventSlug : `${eventId}`;
                          const url = `${window.location.origin}/event/${eventPath}?coupon=${encodeURIComponent(coupon.code)}`;
                          const text = `${t("eventManagement.coupons.share.useCode")} ${coupon.code}`;
                          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                        }}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          Twitter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("eventManagement.coupons.table.value")}
                    </span>
                    <span className="text-lg font-bold">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : formatCurrency(coupon.discount_value)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{t("eventManagement.coupons.table.currentUsage")}</span>
                      <span className="font-medium">{coupon.used_count}/{coupon.max_uses} ({Math.round((coupon.used_count / coupon.max_uses) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((coupon.used_count / coupon.max_uses) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEditCoupon(coupon)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("eventManagement.coupons.actions.edit")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("eventManagement.coupons.deleteDialog.title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("eventManagement.coupons.deleteDialog.description")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("eventManagement.coupons.deleteDialog.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          {t("eventManagement.coupons.deleteDialog.confirm")}
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
                isActive: editingCoupon.is_active ?? editingCoupon.active,
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
              onSubmit={async (values) => {
                await handleUpdateCoupon(editingCoupon.id, values);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleSubmit,
                setFieldValue,
                isSubmitting,
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
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
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
    </div>
  );
};
