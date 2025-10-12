import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Send } from "lucide-react";
import { InviteGateway } from "@/lib/InviteGateway";
import { TicketPricingGateway } from "@/lib/TicketPricingGateway";
import SuccessSnackbar from "./SuccessSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";
import { createCommonValidations, PHONE_MASK } from "@/lib/validationSchemas";

interface SendTicketsProps {
  eventId: number;
}

// Phone mask for any country code (same as signup form)
const SendTickets: React.FC<SendTicketsProps> = ({ eventId }) => {
  const { t } = useTranslation();
  const [showSuccessSnackbar, setShowSuccessSnackbar] = React.useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const inviteGateway = new InviteGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );
  const ticketPricingGateway = new TicketPricingGateway(
    import.meta.env.VITE_BACKEND_BASE_URL
  );
  const queryClient = useQueryClient();

  // Fetch active ticket pricings
  const { data: ticketPricings, isLoading: isLoadingPricings } = useQuery({
    queryKey: ["ticket-pricings", eventId],
    queryFn: () =>
      ticketPricingGateway.getTicketPricingByEvent(eventId, "Active"),
    enabled: !!eventId,
  });

  // Send courtesy ticket mutation
  const sendTicketMutation = useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      ticket_pricing_id: number;
    }) =>
      inviteGateway.sendCourtesyTicket({
        event_id: eventId,
        name: data.name,
        email: data.email,
        phone_number: data.phone,
        ticket_pricing_id: data.ticket_pricing_id,
      }),
    onSuccess: () => {
      setSuccessMessage("Courtesy ticket sent successfully");
      setShowSuccessSnackbar(true);
      formik.resetForm();
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to send courtesy ticket");
      setShowErrorSnackbar(true);
    },
  });

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
    onSubmit: (values) => {
      sendTicketMutation.mutate({
        name: values.name,
        email: values.email,
        phone: values.phone.replace(/[()\\s-]/g, ""),
        ticket_pricing_id: parseInt(values.ticket_pricing_id),
      });
    },
  });

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
                  onValueChange={(value) =>
                    formik.setFieldValue("ticket_pricing_id", value)
                  }
                  disabled={isLoadingPricings}
                >
                  <SelectTrigger
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
                disabled={sendTicketMutation.isPending || isLoadingPricings}
                className="min-w-32"
              >
                {sendTicketMutation.isPending
                  ? "Sending..."
                  : t("eventManagement.sendTickets.buttons.send")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SuccessSnackbar
        message={successMessage}
        visible={showSuccessSnackbar}
        onDismiss={() => setShowSuccessSnackbar(false)}
      />

      <ErrorSnackbar
        message={errorMessage}
        visible={showErrorSnackbar}
        onDismiss={() => setShowErrorSnackbar(false)}
      />
    </div>
  );
};

export default SendTickets;
