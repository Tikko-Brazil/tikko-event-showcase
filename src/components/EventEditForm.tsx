import React, { useState } from "react";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  X,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Save,
} from "lucide-react";

interface EditEventData {
  name: string;
  image: string;
  description: string;
  startDate: Date;
  endDate: Date;
  locationName: string;
  location: string;
  autoAcceptRequests: boolean;
  isActive: boolean;
}

interface FormValues {
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationName: string;
  location: string;
  autoAcceptRequests: boolean;
  isActive: boolean;
}

interface EventEditFormProps {
  editEventData: EditEventData;
  onSave: (values: FormValues) => void;
  locationSuggestions: string[];
}

const EventEditSchema = Yup.object().shape({
  name: Yup.string()
    .required("Event name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1500, "Description must be at most 1500 characters"),
  startDate: Yup.string().required("Start date is required"),
  startTime: Yup.string()
    .required("Start time is required")
    .matches(
      /^([01][0-9]|2[0-3]):([0-5][0-9])$/,
      "Invalid time format (HH:MM)"
    ),
  endDate: Yup.string().required("End date is required"),
  endTime: Yup.string()
    .required("End time is required")
    .matches(
      /^([01][0-9]|2[0-3]):([0-5][0-9])$/,
      "Invalid time format (HH:MM)"
    ),
  locationName: Yup.string()
    .required("Location name is required")
    .min(3, "Location name must be at least 3 characters")
    .max(100, "Location name must be at most 100 characters"),
  location: Yup.string()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be at most 200 characters"),
  autoAcceptRequests: Yup.boolean(),
  isActive: Yup.boolean(),
});

export const EventEditForm = ({
  editEventData,
  onSave,
  locationSuggestions,
}: EventEditFormProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editEventData.image);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const initialValues: FormValues = {
    name: editEventData.name,
    description: editEventData.description,
    startDate: format(editEventData.startDate, "yyyy-MM-dd"),
    startTime: format(editEventData.startDate, "HH:mm"),
    endDate: format(editEventData.endDate, "yyyy-MM-dd"),
    endTime: format(editEventData.endDate, "HH:mm"),
    locationName: editEventData.locationName,
    location: editEventData.location,
    autoAcceptRequests: editEventData.autoAcceptRequests,
    isActive: editEventData.isActive,
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (location: string, setFieldValue: any) => {
    setFieldValue("location", location);
    setShowLocationSuggestions(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={EventEditSchema}
        onSubmit={onSave}
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
                  Event Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Edit your event's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Event Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter event name"
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
                    Event Image
                  </Label>
                  <div className="flex flex-col space-y-4">
                    {imagePreview && (
                      <div className="relative w-full max-w-md">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setSelectedImage(null);
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
                        <ImageIcon className="h-4 w-4" />
                        <span>Select Image</span>
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
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Describe your event..."
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
                      Start Date and Time *
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
                              ? format(new Date(values.startDate), "MM/dd/yyyy")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          name="startTime"
                          value={values.startTime}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={cn(
                            "w-32",
                            errors.startTime &&
                              touched.startTime &&
                              "border-red-500"
                          )}
                        />
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
                      End Date and Time *
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
                              ? format(new Date(values.endDate), "MM/dd/yyyy")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          name="endTime"
                          value={values.endTime}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={cn(
                            "w-32",
                            errors.endTime &&
                              touched.endTime &&
                              "border-red-500"
                          )}
                        />
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
                      Location Name *
                    </Label>
                    <Input
                      id="locationName"
                      name="locationName"
                      value={values.locationName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ex: Aurora Concert Hall"
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
                  <div className="space-y-2 relative">
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-foreground"
                    >
                      Address *
                    </Label>
                    <div className="relative">
                      <Input
                        id="location"
                        name="location"
                        value={values.location}
                        onChange={(e) => {
                          handleChange(e);
                          setShowLocationSuggestions(e.target.value.length > 2);
                        }}
                        onBlur={handleBlur}
                        onFocus={() =>
                          setShowLocationSuggestions(values.location.length > 2)
                        }
                        placeholder="Enter full address"
                        className={cn(
                          "w-full pr-10",
                          errors.location &&
                            touched.location &&
                            "border-red-500"
                        )}
                      />
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    {errors.location && touched.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                    {showLocationSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                        {locationSuggestions
                          .filter((suggestion) =>
                            suggestion
                              .toLowerCase()
                              .includes(values.location.toLowerCase())
                          )
                          .map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-accent cursor-pointer text-sm text-foreground"
                              onClick={() =>
                                handleLocationSelect(suggestion, setFieldValue)
                              }
                            >
                              {suggestion}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-medium text-foreground">
                    Settings
                  </h3>

                  {/* Auto Accept Requests */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="autoAcceptRequests"
                      checked={values.autoAcceptRequests}
                      onCheckedChange={(checked) =>
                        setFieldValue("autoAcceptRequests", !!checked)
                      }
                    />
                    <Label
                      htmlFor="autoAcceptRequests"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Join requests will be accepted automatically
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
                      Event is active
                    </Label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </Formik>
    </div>
  );
};
