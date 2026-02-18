import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash";
import InputMask from "react-input-mask";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createCommonValidations } from "@/lib/validationSchemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn, formatEventTime } from "@/lib/utils";
import { EventGateway } from "@/lib/EventGateway";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import SuccessSnackbar from "@/components/SuccessSnackbar";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import {
  X,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";

const eventGateway = new EventGateway(import.meta.env.VITE_BACKEND_BASE_URL);
const geocodingGateway = new GeocodingGateway();

interface Event {
  id: number;
  name: string;
  description: string;
  image: string | null;
  start_date: string;
  end_date: string;
  address_name: string;
  location: string;
  latitude: number;
  longitude: number;
  address_complement: string | null;
  is_private: boolean;
  auto_accept: boolean;
  is_active: boolean;
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
  autoAccept: boolean;
  isActive: boolean;
}

interface EventEditFormProps {
  event: Event;
}

export const EventEditForm = ({ event }: EventEditFormProps) => {
  const { t } = useTranslation();

  const commonValidations = createCommonValidations(t);

  const EventEditSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("eventManagement.editEvent.validation.nameRequired"))
      .min(3, t("eventManagement.editEvent.validation.nameMinLength"))
      .max(100, t("eventManagement.editEvent.validation.nameMaxLength")),
    description: Yup.string()
      .required(t("eventManagement.editEvent.validation.descriptionRequired"))
      .min(10, t("eventManagement.editEvent.validation.descriptionMinLength"))
      .max(
        1500,
        t("eventManagement.editEvent.validation.descriptionMaxLength")
      ),
    startDate: Yup.string().required(
      t("eventManagement.editEvent.validation.startDateRequired")
    ),
    startTime: Yup.string()
      .required(t("eventManagement.editEvent.validation.startTimeRequired"))
      .matches(
        /^([01][0-9]|2[0-3]):([0-5][0-9])$/,
        t("eventManagement.editEvent.validation.startTimeFormat")
      ),
    endDate: Yup.string().required(
      t("eventManagement.editEvent.validation.endDateRequired")
    ),
    endTime: Yup.string()
      .required(t("eventManagement.editEvent.validation.endTimeRequired"))
      .matches(
        /^([01][0-9]|2[0-3]):([0-5][0-9])$/,
        t("eventManagement.editEvent.validation.endTimeFormat")
      ),
    locationName: Yup.string()
      .required(t("eventManagement.editEvent.validation.locationRequired"))
      .min(3, t("eventManagement.editEvent.validation.nameMinLength"))
      .max(100, t("eventManagement.editEvent.validation.nameMaxLength")),
    addressName: Yup.string()
      .required(t("eventManagement.editEvent.validation.locationRequired"))
      .min(5, t("validation.required"))
      .max(400, "Endereço deve ter no máximo 400 caracteres"),
    latitude: Yup.number()
      .nullable()
      .required(t("eventManagement.editEvent.validation.coordinatesRequired")),
    longitude: Yup.number()
      .nullable()
      .required(t("eventManagement.editEvent.validation.coordinatesRequired")),
    autoAccept: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  // Extract S3 key from signed URL
  const extractS3Key = (url: string | null): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      return null;
    }
  };

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(event.image || "");
  const [imageKey, setImageKey] = useState<string | null>(extractS3Key(event.image));
  const [imageChanged, setImageChanged] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch address from coordinates
  const { data: addressData, isLoading: addressLoading } = useQuery({
    queryKey: ["geocode", event.latitude, event.longitude],
    queryFn: () =>
      geocodingGateway.reverseGeocode(event.latitude, event.longitude),
    enabled: !!(event.latitude && event.longitude),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

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
      setImageChanged(true);
      setIsImageUploading(false);
    },
    onError: (error: any) => {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
      setIsImageUploading(false);
    },
  });

  // Debounced location search
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

  const updateEventMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const updateData: any = {
        name: values.name,
        description: values.description,
        start_date: `${values.startDate}T${values.startTime}:00Z`,
        end_date: `${values.endDate}T${values.endTime}:00Z`,
        address_name: values.locationName,
        longitude: values.longitude!,
        latitude: values.latitude!,
        address_complement: values.addressComplement,
        is_private: false,
        auto_accept: values.autoAccept,
        is_active: values.isActive,
      };
      
      // Only include image if it was changed
      if (imageChanged && imageKey) {
        updateData.image = imageKey;
      }
      
      return eventGateway.updateEvent(event.id, updateData);
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (error: any) => {
      setErrorMessage(
        error.message || "Failed to update event. Please try again."
      );
      setShowError(true);
    },
  });

  const getAddressFromGeocode = () => {
    if (addressData?.displayName) {
      return addressData.displayName;
    }
    return event.location || "Localização não disponível";
  };

  const initialValues: FormValues = {
    name: event.name,
    description: event.description,
    startDate: format(parseISO(event.start_date), "yyyy-MM-dd"),
    startTime: formatEventTime(event.start_date),
    endDate: format(parseISO(event.end_date), "yyyy-MM-dd"),
    endTime: formatEventTime(event.end_date),
    locationName: event.address_name,
    addressName: getAddressFromGeocode(),
    addressComplement: event.address_complement || "",
    latitude: event.latitude,
    longitude: event.longitude,
    autoAccept: event.auto_accept,
    isActive: event.is_active,
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setIsImageUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      uploadImageMutation.mutate(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={EventEditSchema}
        enableReinitialize={true}
        onSubmit={(values) => updateEventMutation.mutate(values)}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }: FormikProps<FormValues>) => (
          <form onSubmit={handleSubmit}>
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">
                  {t("eventManagement.editEvent.sections.eventInfo")}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t("eventManagement.editEvent.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("eventManagement.editEvent.fields.eventName")} *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t(
                      "eventManagement.editEvent.fields.eventNamePlaceholder"
                    )}
                    className={cn(
                      "w-full",
                      errors.name && touched.name && "border-red-500"
                    )}
                  />
                  {errors.name && touched.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Event Image */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    {t("eventManagement.editEvent.fields.eventImage")}
                  </Label>
                  <div className="flex flex-col space-y-4">
                    {imagePreview && (
                      <div className="relative w-full max-w-md">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full aspect-square object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setSelectedImage(null);
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
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="eventImage"
                      />
                      <Label
                        htmlFor="eventImage"
                        className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                      >
                        {isImageUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Carregando...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            <span>
                              {t(
                                "eventManagement.editEvent.buttons.selectImage"
                              )}
                            </span>
                          </>
                        )}
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
                    {t("eventManagement.editEvent.fields.description")} *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t(
                      "eventManagement.editEvent.fields.descriptionPlaceholder"
                    )}
                    className={cn(
                      "min-h-[100px] resize-y",
                      errors.description &&
                      touched.description &&
                      "border-red-500"
                    )}
                  />
                  {errors.description && touched.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* Date and Time Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Start Date and Time */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-foreground">
                      {t("eventManagement.editEvent.fields.startDate")} e{" "}
                      {t("eventManagement.editEvent.fields.startTime")} *
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
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {values.startDate
                              ? format(new Date(values.startDate + "T00:00:00"), "dd/MM/yyyy")
                              : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={
                              values.startDate
                                ? new Date(values.startDate + "T00:00:00")
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setFieldValue(
                                  "startDate",
                                  format(date, "yyyy-MM-dd")
                                );
                              }
                              setStartDateOpen(false);
                            }}
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
                              placeholder={t(
                                "eventManagement.editEvent.fields.startTimePlaceholder"
                              )}
                              className={cn(
                                "w-full pl-10",
                                errors.startTime &&
                                touched.startTime &&
                                "border-red-500"
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
                      {t("eventManagement.editEvent.fields.endDate")} e{" "}
                      {t("eventManagement.editEvent.fields.endTime")} *
                    </Label>
                    <div className="space-y-3">
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
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
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {values.endDate
                              ? format(new Date(values.endDate + "T00:00:00"), "dd/MM/yyyy")
                              : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={
                              values.endDate
                                ? new Date(values.endDate + "T00:00:00")
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setFieldValue(
                                  "endDate",
                                  format(date, "yyyy-MM-dd")
                                );
                              }
                              setEndDateOpen(false);
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.endDate && touched.endDate && (
                        <p className="text-sm text-red-500">{errors.endDate}</p>
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
                              placeholder={t(
                                "eventManagement.editEvent.fields.endTimePlaceholder"
                              )}
                              className={cn(
                                "w-full pl-10",
                                errors.endTime &&
                                touched.endTime &&
                                "border-red-500"
                              )}
                            />
                          )}
                        </InputMask>
                      </div>
                      {errors.endTime && touched.endTime && (
                        <p className="text-sm text-red-500">{errors.endTime}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Location Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="locationName"
                      className="text-sm font-medium text-foreground"
                    >
                      {t("eventManagement.editEvent.fields.location")} *
                    </Label>
                    <Input
                      id="locationName"
                      name="locationName"
                      value={values.locationName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t(
                        "eventManagement.editEvent.fields.locationPlaceholder"
                      )}
                      className={cn(
                        "w-full",
                        errors.locationName &&
                        touched.locationName &&
                        "border-red-500"
                      )}
                    />
                    {errors.locationName && touched.locationName && (
                      <p className="text-sm text-red-500">
                        {errors.locationName}
                      </p>
                    )}
                  </div>

                  {/* Location Address */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="addressName"
                      className="text-sm font-medium text-foreground"
                    >
                      {t("eventManagement.editEvent.fields.address")} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="addressName"
                        name="addressName"
                        value={
                          addressLoading
                            ? "Carregando endereço..."
                            : values.addressName
                        }
                        onChange={(e) => {
                          handleChange(e);
                          debouncedLocationSearch(e.target.value);
                        }}
                        onBlur={handleBlur}
                        placeholder={t(
                          "eventManagement.editEvent.fields.addressPlaceholder"
                        )}
                        disabled={addressLoading}
                        className={cn(
                          "w-full pl-10",
                          errors.addressName &&
                          touched.addressName &&
                          "border-red-500"
                        )}
                      />
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      {/* Location Suggestions */}
                      {showLocationSuggestions &&
                        locationSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {locationSuggestions.map((location, index) => {
                              const { road, suburb, city, state } = location;
                              const formattedAddress = `${road || ""}${road && suburb ? ", " : ""
                                }${suburb || ""}${(road || suburb) && city ? ", " : ""
                                }${city}${state ? ` - ${state}` : ""}`;

                              return (
                                <div
                                  key={index}
                                  className="px-4 py-2 hover:bg-accent cursor-pointer text-sm"
                                  onClick={() =>
                                    handleLocationSelect(
                                      location,
                                      setFieldValue
                                    )
                                  }
                                >
                                  <div className="font-medium">
                                    {location.displayName ||
                                      location.name ||
                                      "Unknown location"}
                                  </div>
                                  {city && (
                                    <div className="text-xs text-muted-foreground">
                                      {city}
                                      {state ? `, ${state}` : ""}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                    {errors.addressName && touched.addressName && (
                      <p className="text-sm text-red-500">
                        {errors.addressName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Complement */}
                <div className="space-y-2">
                  <Label
                    htmlFor="addressComplement"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("eventManagement.editEvent.fields.addressComplement")}
                  </Label>
                  <Input
                    id="addressComplement"
                    name="addressComplement"
                    value={values.addressComplement}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t(
                      "eventManagement.editEvent.fields.addressComplementPlaceholder"
                    )}
                    className="w-full"
                  />
                </div>

                {/* Settings */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-medium text-foreground">
                    {t("eventManagement.editEvent.sections.settings")}
                  </h3>

                  {/* Auto Accept Requests */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="autoAccept"
                      checked={values.autoAccept}
                      onCheckedChange={(checked) =>
                        setFieldValue("autoAccept", !!checked)
                      }
                    />
                    <Label
                      htmlFor="autoAccept"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {t(
                        "eventManagement.editEvent.fields.autoAcceptDescription"
                      )}
                    </Label>
                  </div>
                  {/* Event Active Status */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isActive"
                      checked={values.isActive}
                      onCheckedChange={(checked) =>
                        setFieldValue("isActive", !!checked)
                      }
                    />
                    <Label
                      htmlFor="isActive"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {t("eventManagement.editEvent.fields.activeEvent")}
                    </Label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={updateEventMutation.isPending}
                  >
                    {updateEventMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t("eventManagement.editEvent.buttons.saveChanges")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </Formik>

      <SuccessSnackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        message={t("eventManagement.editEvent.messages.eventUpdated")}
      />

      <ErrorSnackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        message={errorMessage}
      />
    </div>
  );
};
