import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Formik, FieldArray, FormikProps } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash";
import InputMask from "react-input-mask";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ImageIcon,
  X,
  Plus,
  Save,
  Trash2,
  MapPin,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import SuccessSnackbar from "@/components/SuccessSnackbar";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import { useIsMobile } from "@/hooks/use-mobile";
import logoLight from "@/assets/logoLight.png";
import { EventGateway } from "@/lib/EventGateway";
import { GeocodingGateway } from "@/lib/GeocodingGateway";

// Interfaces
interface TicketPricing {
  ticketType: string;
  gender: "male" | "female";
  price: string;
}

interface FormValues {
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationName: string;
  addressName: string;
  addressComplement: string;
  latitude: number | null;
  longitude: number | null;
  locationDisplayName: string;
  autoAccept: boolean;
  isPrivate: boolean;
  isActive: boolean;
  ticketPricings: TicketPricing[];
}

// Validation schema
const EventCreationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Nome do evento é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: Yup.string()
    .required("Descrição do evento é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1500, "Descrição deve ter no máximo 1500 caracteres"),
  startDate: Yup.string().required("Data de início é obrigatória"),
  startTime: Yup.string()
    .required("Horário de início é obrigatório")
    .matches(
      /^([01][0-9]|2[0-3]):([0-5][0-9])$/,
      "Formato de horário inválido (HH:MM)"
    ),
  endDate: Yup.string().required("Data de término é obrigatória"),
  endTime: Yup.string()
    .required("Horário de término é obrigatório")
    .matches(
      /^([01][0-9]|2[0-3]):([0-5][0-9])$/,
      "Formato de horário inválido (HH:MM)"
    ),
  locationName: Yup.string()
    .required("Nome do local é obrigatório")
    .min(3, "Nome do local deve ter pelo menos 3 caracteres")
    .max(100, "Nome do local deve ter no máximo 100 caracteres"),
  addressName: Yup.string()
    .required("Endereço é obrigatório")
    .min(5, "Endereço deve ter pelo menos 5 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres"),
  latitude: Yup.number()
    .nullable()
    .test(
      "has-location",
      "Selecione uma localização no mapa",
      function (value, context) {
        const { longitude } = context.parent;
        if (value === null || longitude === null) {
          return false;
        }
        return true;
      }
    ),
  longitude: Yup.number().nullable(),
  autoAccept: Yup.boolean(),
  isPrivate: Yup.boolean(),
  isActive: Yup.boolean(),
  ticketPricings: Yup.array()
    .of(
      Yup.object().shape({
        ticketType: Yup.string()
          .required("Tipo de ingresso é obrigatório")
          .min(3, "Tipo de ingresso deve ter pelo menos 3 caracteres")
          .max(50, "Tipo de ingresso deve ter no máximo 50 caracteres"),
        gender: Yup.string().required("Gênero é obrigatório"),
        price: Yup.string()
          .required("Preço é obrigatório")
          .matches(
            /^\d+$/,
            "Preço deve ser um número inteiro (ex: 10, 25, 100)"
          ),
      })
    )
    .min(1, "Pelo menos um tipo de ingresso é necessário"),
});

const combineDateTime = (date: string, time: string): string => {
  const [hours, minutes] = time.split(":");
  return new Date(`${date}T${hours}:${minutes}:00Z`).toISOString();
};

const EventCreation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // State
  const [image, setImage] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | undefined>();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  // Gateways
  const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
  const geocodingGateway = new GeocodingGateway();

  // Initial form values
  const initialValues: FormValues = {
    name: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    locationName: "",
    addressName: "",
    addressComplement: "",
    latitude: null,
    longitude: null,
    locationDisplayName: "",
    autoAccept: true,
    isPrivate: false,
    isActive: true,
    ticketPricings: [],
  };

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const uniqueId = uuidv4();
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const key = `${uniqueId}.${fileExtension}`;

      // Get upload URL
      const uploadResponse = await eventGateway.getUploadUrl(key, file.type);

      // Upload to S3
      await fetch(uploadResponse.upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      return uploadResponse.key;
    },
    onSuccess: (key) => {
      setImageKey(key);
      setIsImageUploading(false);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Erro ao fazer upload da imagem");
      setShowError(true);
      setIsImageUploading(false);
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const eventData = {
        event: {
          name: values.name,
          description: values.description,
          start_date: combineDateTime(values.startDate, values.startTime),
          end_date: combineDateTime(values.endDate, values.endTime),
          address_name: values.locationName,
          longitude: values.longitude!,
          latitude: values.latitude!,
          address_complement: values.addressComplement || "",
          is_private: values.isPrivate,
          auto_accept: values.autoAccept,
          is_active: values.isActive,
          image: imageKey || "",
        },
        ticket_pricing: values.ticketPricings.map((tp) => ({
          ticket_type: tp.ticketType,
          gender: tp.gender,
          price: parseInt(tp.price),
          start_date: combineDateTime(values.startDate, values.startTime),
          end_date: combineDateTime(values.endDate, values.endTime),
          active: true,
        })),
      };

      return eventGateway.createEvent(eventData);
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/my-events");
      }, 2000);
    },
    onError: (error: any) => {
      setErrorMessage(
        error.message || "Erro ao criar evento. Tente novamente."
      );
      setShowError(true);
    },
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Apenas imagens JPG, JPEG e PNG são aceitas");
        setShowError(true);
        return;
      }

      setIsImageUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      uploadImageMutation.mutate(file);
    }
  };

  // Handle location search with debouncing
  const debouncedLocationSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length > 2) {
        try {
          const results = await geocodingGateway.forwardGeocode(query, 5);
          setLocationSuggestions(results);
          setShowLocationSuggestions(true);
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      } else {
        setShowLocationSuggestions(false);
      }
    }, 800),
    []
  );

  // Handle location selection
  const handleLocationSelect = (location: any, setFieldValue: any) => {
    // Create simplified address format: name, city/town/municipality, state, country
    const address = location.address || {};
    const name = location.name || "";
    const city =
      address.municipality ||
      address.town ||
      address.city ||
      address.city_district ||
      address.village ||
      "";
    const state = address.state || "";
    const country = address.country || "";

    const addressParts = [name, city, state, country].filter(
      (part) => part && part.trim()
    );
    const simplifiedAddress = addressParts.join(", ");

    setFieldValue("addressName", simplifiedAddress);
    setFieldValue("latitude", parseFloat(location.latitude));
    setFieldValue("longitude", parseFloat(location.longitude));
    setShowLocationSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/my-events")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {!isMobile && (
              <div className="flex items-center gap-3">
                <img src={logoLight} alt="Logo" className="h-8" />
                <div className="h-6 w-px bg-border" />
                <h1 className="text-xl font-bold">Create Event</h1>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Formik
            initialValues={initialValues}
            validationSchema={EventCreationSchema}
            onSubmit={(values) => createEventMutation.mutate(values)}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              handleSubmit,
            }: FormikProps<FormValues>) => (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Event Information Card */}
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl text-foreground">
                      Informações do Evento
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Detalhes básicos sobre seu evento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Event Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground"
                      >
                        Nome do Evento *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Digite o nome do evento"
                        className={
                          errors.name && touched.name ? "border-red-500" : ""
                        }
                      />
                      {errors.name && touched.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Event Image */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Imagem do Evento
                      </Label>
                      <div className="flex flex-col space-y-4">
                        {image && (
                          <div className="relative w-full max-w-md">
                            <img
                              src={image}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border border-border"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImage(null);
                                setImageKey(undefined);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleImageChange}
                            className="hidden"
                            id="eventImage"
                          />
                          <Label
                            htmlFor="eventImage"
                            className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                          >
                            {isImageUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                            <span>
                              {isImageUploading
                                ? "Uploading..."
                                : "Select Image"}
                            </span>
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-foreground"
                      >
                        Descrição *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Describe your event..."
                        className={`min-h-[100px] resize-y ${
                          errors.description && touched.description
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {errors.description && touched.description && (
                        <p className="text-sm text-red-500">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Date and Time Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Start Date and Time */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-foreground">
                          Data e Horário de Início *
                        </Label>
                        <div className="space-y-3">
                          <Popover
                            open={startDateOpen}
                            onOpenChange={setStartDateOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !values.startDate && "text-muted-foreground",
                                  errors.startDate &&
                                    touched.startDate &&
                                    "border-red-500"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {values.startDate
                                  ? format(
                                      new Date(values.startDate),
                                      "dd/MM/yyyy"
                                    )
                                  : "Selecionar data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={
                                  values.startDate
                                    ? new Date(values.startDate)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  if (date) {
                                    setFieldValue(
                                      "startDate",
                                      format(date, "yyyy-MM-dd")
                                    );
                                    setStartDateOpen(false);
                                  }
                                }}
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.startDate && touched.startDate && (
                            <p className="text-sm text-red-500">
                              {errors.startDate}
                            </p>
                          )}
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <InputMask
                              mask="99:99"
                              name="startTime"
                              value={values.startTime}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            >
                              {(inputProps: any) => (
                                <Input
                                  {...inputProps}
                                  placeholder="Horário de início"
                                  className={cn(
                                    "pl-10",
                                    errors.startTime && touched.startTime
                                      ? "border-red-500"
                                      : ""
                                  )}
                                />
                              )}
                            </InputMask>
                          </div>
                          {errors.startTime && touched.startTime && (
                            <p className="text-sm text-red-500">
                              {errors.startTime}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* End Date and Time */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-foreground">
                          Data e Horário de Término *
                        </Label>
                        <div className="space-y-3">
                          <Popover
                            open={endDateOpen}
                            onOpenChange={setEndDateOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !values.endDate && "text-muted-foreground",
                                  errors.endDate &&
                                    touched.endDate &&
                                    "border-red-500"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {values.endDate
                                  ? format(
                                      new Date(values.endDate),
                                      "dd/MM/yyyy"
                                    )
                                  : "Selecionar data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={
                                  values.endDate
                                    ? new Date(values.endDate)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  if (date) {
                                    setFieldValue(
                                      "endDate",
                                      format(date, "yyyy-MM-dd")
                                    );
                                    setEndDateOpen(false);
                                  }
                                }}
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.endDate && touched.endDate && (
                            <p className="text-sm text-red-500">
                              {errors.endDate}
                            </p>
                          )}
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <InputMask
                              mask="99:99"
                              name="endTime"
                              value={values.endTime}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            >
                              {(inputProps: any) => (
                                <Input
                                  {...inputProps}
                                  placeholder="Horário de término"
                                  className={cn(
                                    "pl-10",
                                    errors.endTime && touched.endTime
                                      ? "border-red-500"
                                      : ""
                                  )}
                                />
                              )}
                            </InputMask>
                          </div>
                          {errors.endTime && touched.endTime && (
                            <p className="text-sm text-red-500">
                              {errors.endTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                      {/* Location Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="locationName"
                          className="text-sm font-medium text-foreground"
                        >
                          Nome do Local *
                        </Label>
                        <Input
                          id="locationName"
                          name="locationName"
                          value={values.locationName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Ex: Aurora Concert Hall"
                          className={
                            errors.locationName && touched.locationName
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors.locationName && touched.locationName && (
                          <p className="text-sm text-red-500">
                            {errors.locationName}
                          </p>
                        )}
                      </div>

                      {/* Address Search */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                          Endereço *
                        </Label>
                        <div className="relative">
                          <Input
                            name="addressName"
                            value={values.addressName}
                            onChange={(e) => {
                              handleChange(e);
                              debouncedLocationSearch(e.target.value);
                            }}
                            onBlur={handleBlur}
                            placeholder="Digite o endereço completo"
                            className={`pr-10 ${
                              errors.addressName && touched.addressName
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />

                          {showLocationSuggestions &&
                            locationSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                {locationSuggestions.map(
                                  (suggestion, index) => (
                                    <div
                                      key={index}
                                      className="px-3 py-2 hover:bg-accent cursor-pointer text-sm text-foreground"
                                      onClick={() =>
                                        handleLocationSelect(
                                          suggestion,
                                          setFieldValue
                                        )
                                      }
                                    >
                                      {suggestion.displayName}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        {errors.addressName && touched.addressName && (
                          <p className="text-sm text-red-500">
                            {errors.addressName}
                          </p>
                        )}
                        {errors.latitude && touched.latitude && (
                          <p className="text-sm text-red-500">
                            {errors.latitude}
                          </p>
                        )}
                      </div>

                      <Input
                        name="addressComplement"
                        value={values.addressComplement}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Address complement (optional)"
                      />
                    </div>

                    {/* Settings */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="text-lg font-medium text-foreground">
                        Configurações
                      </h3>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="autoAccept"
                          checked={values.autoAccept}
                          onCheckedChange={(checked) =>
                            setFieldValue("autoAccept", checked)
                          }
                        />
                        <Label
                          htmlFor="autoAccept"
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          Aceitar solicitações automaticamente
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="isPrivate"
                          checked={values.isPrivate}
                          onCheckedChange={(checked) =>
                            setFieldValue("isPrivate", checked)
                          }
                        />
                        <Label
                          htmlFor="isPrivate"
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          Evento privado
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="isActive"
                          checked={values.isActive}
                          onCheckedChange={(checked) =>
                            setFieldValue("isActive", checked)
                          }
                        />
                        <Label
                          htmlFor="isActive"
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          Event ativo
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ticket Types Card */}
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl text-foreground">
                      Tipos de Ingresso
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Defina diferentes tipos de ingresso para seu evento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FieldArray name="ticketPricings">
                      {({ push, remove }) => (
                        <>
                          {/* Add New Ticket Type Form */}
                          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                            <h3 className="font-semibold text-foreground">
                              Adicionar Tipo de Ingresso
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Input
                                placeholder="Nome do ingresso (ex: VIP, Pista)"
                                id="newTicketName"
                              />

                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="gender-male"
                                      name="newGender"
                                      value="male"
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor="gender-male"
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      Masculino
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="gender-female"
                                      name="newGender"
                                      value="female"
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor="gender-female"
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      Feminino
                                    </Label>
                                  </div>
                                </div>
                              </div>

                              <Input
                                type="number"
                                placeholder="Preço (R$)"
                                id="newTicketPrice"
                              />
                            </div>

                            <Button
                              type="button"
                              onClick={() => {
                                const nameInput = document.getElementById(
                                  "newTicketName"
                                ) as HTMLInputElement;
                                const genderInput = document.querySelector(
                                  'input[name="newGender"]:checked'
                                ) as HTMLInputElement;
                                const priceInput = document.getElementById(
                                  "newTicketPrice"
                                ) as HTMLInputElement;

                                if (
                                  nameInput?.value &&
                                  genderInput?.value &&
                                  priceInput?.value
                                ) {
                                  const newTicket = {
                                    ticketType: nameInput.value,
                                    gender: genderInput.value,
                                    price: priceInput.value,
                                  };

                                  // Use setFieldValue to ensure proper form state update
                                  setFieldValue("ticketPricings", [
                                    ...values.ticketPricings,
                                    newTicket,
                                  ]);

                                  // Clear inputs
                                  nameInput.value = "";
                                  priceInput.value = "";
                                  const radios = document.querySelectorAll(
                                    'input[name="newGender"]'
                                  ) as NodeListOf<HTMLInputElement>;
                                  radios.forEach(
                                    (radio) => (radio.checked = false)
                                  );
                                }
                              }}
                              className="w-full md:w-auto"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Tipo de Ingresso
                            </Button>
                          </div>

                          {/* Ticket Types List */}
                          {values.ticketPricings.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="font-semibold text-foreground">
                                Tipos de Ingresso Adicionados
                              </h3>
                              <div className="grid gap-3">
                                {values.ticketPricings.map((ticket, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-foreground">
                                          {ticket.ticketType}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-sm text-muted-foreground">
                                            {ticket.gender === "male"
                                              ? "Apenas Masculino"
                                              : "Apenas Feminino"}
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            •
                                          </span>
                                          <span className="text-sm font-medium text-foreground">
                                            R$ {ticket.price}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {errors.ticketPricings && touched.ticketPricings && (
                            <p className="text-sm text-red-500">
                              {typeof errors.ticketPricings === "string"
                                ? errors.ticketPricings
                                : "Pelo menos um tipo de ingresso é necessário"}
                            </p>
                          )}
                        </>
                      )}
                    </FieldArray>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={createEventMutation.isPending || isImageUploading}
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Criar Evento
                    </>
                  )}
                </Button>
              </form>
            )}
          </Formik>
        </div>
      </main>

      <SuccessSnackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        message="Evento criado com sucesso!"
      />
      <ErrorSnackbar
        message={errorMessage}
        visible={showError}
        onDismiss={() => setShowError(false)}
      />
    </div>
  );
};

export default EventCreation;
