import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputMask from "react-input-mask";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send } from "lucide-react";
import { TicketPricingGateway } from "@/lib/TicketPricingGateway";
import { useSendCourtesyTicket } from "@/api/invite/api";
import { sendCourtesyTicketErrorMessage } from "@/api/invite/errors";
import { AppError } from "@/api/errors";
import { useToast } from "@/hooks/use-toast";
import { createCommonValidations, PHONE_MASK } from "@/lib/validationSchemas";

interface SendTicketsProps {
  eventId: number;
}

// Phone mask for any country code (same as signup form)
const SendTickets: React.FC<SendTicketsProps> = ({ eventId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDuplicateDialog, setShowDuplicateDialog] = React.useState(false);
  const [pendingFormData, setPendingFormData] = React.useState<any>(null);

  const ticketPricingGateway = new TicketPricingGateway(
    import.meta.env.VITE_API_BASE_URL
  );
  const queryClient = useQueryClient();

  // Fetch active ticket pricings
  const { data: ticketPricingsData, isLoading: isLoadingPricings } = useQuery({
    queryKey: ["ticket-pricings", eventId],
    queryFn: () =>
      ticketPricingGateway.getTicketPricingByEvent(eventId, 1, 100, "Active"),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const ticketPricings = ticketPricingsData?.ticket_pricings || [];

  // Send courtesy ticket mutation
  const { mutateAsync, isPending } = useSendCourtesyTicket();

  // Form validation schema using standardized validations
  const commonValidations = createCommonValidations(t);
  const validationSchema = Yup.object().shape({
    name: commonValidations.fullName,
    email: commonValidations.email,
    phone: commonValidations.phone,
    ticket_pricing_id: commonValidations.ticketType,
  });

  // Formik form
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "+55 ",
      ticket_pricing_id: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const requestData = {
        event_id: eventId,
        name: values.name,
        email: values.email,
        phone_number: values.phone.replace(/[()\\s-]/g, ""),
        ticket_pricing_id: parseInt(values.ticket_pricing_id),
      };

      try {
        await mutateAsync(requestData);
        toast({
          description: t("eventManagement.sendTickets.success"),
        });
        formik.resetForm();
      } catch (error) {
        const appError = error as AppError;
        
        // If duplicate ticket, show confirmation dialog
        if (appError.code === "DUPLICATE_TICKET") {
          setPendingFormData(requestData);
          setShowDuplicateDialog(true);
          setSubmitting(false);
          return;
        }

        const message = sendCourtesyTicketErrorMessage(appError, t);
        toast({
          variant: "destructive",
          description: message,
        });
      }
    },
  });

  const handleResendConfirm = async () => {
    if (!pendingFormData) return;

    try {
      await mutateAsync({
        ...pendingFormData,
        ignore_double_ticket: true,
      });
      toast({
        description: t("eventManagement.sendTickets.success"),
      });
      formik.resetForm();
      setShowDuplicateDialog(false);
      setPendingFormData(null);
    } catch (error) {
      const message = sendCourtesyTicketErrorMessage(error as AppError, t);
      toast({
        variant: "destructive",
        description: message,
      });
      setShowDuplicateDialog(false);
    }
  };

  const handleResendCancel = () => {
    setShowDuplicateDialog(false);
    setPendingFormData(null);
  };

  const activePricings = ticketPricings || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {t("eventManagement.sendTickets.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t("eventManagement.sendTickets.fields.fullName")}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t(
                    "eventManagement.sendTickets.fields.fullNamePlaceholder"
                  )}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-500">{formik.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("eventManagement.sendTickets.fields.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t(
                    "eventManagement.sendTickets.fields.emailPlaceholder"
                  )}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-red-500">{formik.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("eventManagement.sendTickets.fields.phone")}
                </Label>
                <InputMask
                  mask={PHONE_MASK}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      id="phone"
                      type="tel"
                      placeholder={t(
                        "eventManagement.sendTickets.fields.phonePlaceholder"
                      )}
                      className={
                        formik.touched.phone && formik.errors.phone
                          ? "border-red-500"
                          : ""
                      }
                    />
                  )}
                </InputMask>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-sm text-red-500">{formik.errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket_pricing_id">
                  {t("eventManagement.sendTickets.fields.ticketType")}
                </Label>
                <Select
                  value={formik.values.ticket_pricing_id}
                  onValueChange={(value) => {
                    formik.setFieldValue("ticket_pricing_id", value);
                  }}
                  disabled={isLoadingPricings}
                >
                  <SelectTrigger
                    id="ticket_pricing_id"
                    onBlur={() => formik.setFieldTouched("ticket_pricing_id", true)}
                    className={
                      formik.touched.ticket_pricing_id &&
                        formik.errors.ticket_pricing_id
                        ? "border-red-500"
                        : ""
                    }
                  >
                    <SelectValue
                      placeholder={t(
                        "eventManagement.sendTickets.fields.ticketTypePlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activePricings.map((pricing) => (
                      <SelectItem
                        key={pricing.id}
                        value={pricing.id.toString()}
                      >
                        {pricing.ticket_type} -{" "}
                        {pricing.gender === "male"
                          ? "Masculino"
                          : pricing.gender === "female"
                            ? "Feminino"
                            : pricing.gender}{" "}
                        (
                        {pricing.lot === 0
                          ? "Pré-venda"
                          : `Lote ${pricing.lot}`}
                        )
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.ticket_pricing_id &&
                  formik.errors.ticket_pricing_id && (
                    <p className="text-sm text-red-500">
                      {formik.errors.ticket_pricing_id}
                    </p>
                  )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isPending || isLoadingPricings}
                className="min-w-32"
              >
                {isPending
                  ? "Sending..."
                  : t("eventManagement.sendTickets.buttons.send")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Duplicate Ticket Confirmation Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("eventManagement.sendTickets.duplicateDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("eventManagement.sendTickets.duplicateDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleResendCancel}>
              {t("eventManagement.sendTickets.duplicateDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResendConfirm} disabled={isPending}>
              {isPending
                ? t("eventManagement.sendTickets.duplicateDialog.sending")
                : t("eventManagement.sendTickets.duplicateDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SendTickets;
