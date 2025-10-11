import React from "react";
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

interface SendTicketsProps {
  eventId: number;
}

// Phone mask for any country code (same as signup form)
const PHONE_MASK = "+99 (99) 99999-9999";

const validateMobileNumber = (mobileNumber: string) => {
  if (!mobileNumber) {
    return { isValid: false, errorMessage: "Phone is required" };
  }

  const cleanValue = mobileNumber.replace(/[()\s-]/g, "");

  if (!cleanValue.startsWith("+")) {
    return {
      isValid: false,
      errorMessage: "Phone must start with country code (+)",
    };
  }

  if (cleanValue.startsWith("+55")) {
    // Brazilian validation
    const numberWithoutCountryCode = cleanValue.slice(3);
    if (numberWithoutCountryCode.length !== 11) {
      return {
        isValid: false,
        errorMessage: "Brazilian phone must have 11 digits",
      };
    }
  } else {
    // International validation
    const numberWithoutCountryCode = cleanValue.slice(1);
    if (
      numberWithoutCountryCode.length < 7 ||
      numberWithoutCountryCode.length > 15
    ) {
      return {
        isValid: false,
        errorMessage: "Phone must have between 7 and 15 digits",
      };
    }
  }

  return { isValid: true, errorMessage: "" };
};

const SendTickets: React.FC<SendTicketsProps> = ({ eventId }) => {
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
    queryFn: () => ticketPricingGateway.getTicketPricingByEvent(eventId, "Active"),
    enabled: !!eventId,
  });

  // Send courtesy ticket mutation
  const sendTicketMutation = useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      ticket_pricing_id: number;
    }) => inviteGateway.sendCourtesyTicket({
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

  // Form validation schema (same as signup form)
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("This field is required")
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "Please enter a valid name")
      .test("at-least-two-words", "Enter first and last name", (value) => {
        if (!value) return false;
        const words = value.trim().split(/\s+/);
        return words.length >= 2;
      }),
    email: Yup.string()
      .email("Invalid email")
      .required("This field is required"),
    phone: Yup.string()
      .test("phone-validation", (value, context) => {
        const result = validateMobileNumber(value || "");
        return result.isValid
          ? true
          : context.createError({ message: result.errorMessage });
      })
      .required("Phone is required"),
    ticket_pricing_id: Yup.number()
      .required("Ticket type is required")
      .positive("Please select a valid ticket type"),
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
            Send Courtesy Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
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
                <Label htmlFor="phone">Phone Number</Label>
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
                      placeholder="+55 (11) 99999-9999"
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
                <Label htmlFor="ticket_pricing_id">Ticket Type</Label>
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
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePricings.map((pricing) => (
                      <SelectItem
                        key={pricing.id}
                        value={pricing.id.toString()}
                      >
                        {pricing.ticket_type} - {pricing.gender === "male" ? "Masculino" : pricing.gender === "female" ? "Feminino" : pricing.gender} ({pricing.lot === 0 ? "Pré-venda" : `Lote ${pricing.lot}`})
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
                {sendTicketMutation.isPending ? "Sending..." : "Send Ticket"}
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
