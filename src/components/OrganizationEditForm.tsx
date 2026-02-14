import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { debounce } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, ImageIcon, MapPin, Save, Loader2 } from "lucide-react";
import { GeocodingGateway } from "@/lib/GeocodingGateway";
import { useUpdateOrganization } from "@/api/organization/api";
import { updateOrganizationErrorMessage } from "@/api/organization/errors";
import { AppError } from "@/api/errors";
import { apiAuth } from "@/api/client";

const geocodingGateway = new GeocodingGateway();

interface Organization {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address_name: string;
  address_complement: string;
  logo: string;
}

interface FormValues {
  name: string;
  locationName: string;
  addressName: string;
  addressComplement: string;
  latitude: number | null;
  longitude: number | null;
  locationDisplayName: string;
  logo: string;
}

interface OrganizationEditFormProps {
  organization: Organization;
  onSuccess?: () => void;
}

const createOrganizationSchema = (t: any) => Yup.object().shape({
  name: Yup.string()
    .required(t("organizationCreation.fields.name.required"))
    .min(3, t("organizationCreation.fields.name.minLength"))
    .max(100, t("organizationCreation.fields.name.maxLength")),
  locationName: Yup.string()
    .required(t("organizationCreation.fields.locationName.required"))
    .min(3, t("organizationCreation.fields.locationName.minLength"))
    .max(100, t("organizationCreation.fields.locationName.maxLength")),
  addressName: Yup.string()
    .required(t("organizationCreation.fields.address.required"))
    .min(3, t("organizationCreation.fields.address.minLength")),
  latitude: Yup.number().required(t("organizationCreation.fields.address.selectLocation")),
  longitude: Yup.number().required(t("organizationCreation.fields.address.selectLocation")),
});

export const OrganizationEditForm: React.FC<OrganizationEditFormProps> = ({ organization, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(organization.logo || "");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { mutateAsync: updateOrganization, isPending } = useUpdateOrganization(organization.id);

  const initialValues: FormValues = {
    name: organization.name,
    locationName: organization.address_name,
    addressName: organization.address_name,
    addressComplement: organization.address_complement || "",
    latitude: organization.latitude,
    longitude: organization.longitude,
    locationDisplayName: "",
    logo: organization.logo || "",
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const searchLocationFn = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const results = await geocodingGateway.forwardGeocode(query);
      setLocationSuggestions(results);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const debouncedLocationSearch = useCallback(
    debounce((query: string) => {
      searchLocationFn(query);
    }, 500),
    []
  );

  const handleLocationSelect = (location: any, setFieldValue: any) => {
    const address = location.address || {};
    const name = location.name || '';
    const city = address.city || address.town || address.county || address.village || '';
    const state = address.state || '';
    const country = address.country || '';

    const addressParts = [name, city, state, country].filter(part => part && part.trim());
    const simplifiedAddress = addressParts.join(', ');

    setFieldValue("addressName", simplifiedAddress);
    setFieldValue("latitude", parseFloat(location.latitude));
    setFieldValue("longitude", parseFloat(location.longitude));
    setFieldValue("locationDisplayName", location.displayName);
    setShowLocationSuggestions(false);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      let logoKey = values.logo;

      if (imageFile) {
        const uniqueId = uuidv4();
        const fileExtension = imageFile.name.split(".").pop()?.toLowerCase();
        const key = `${uniqueId}.${fileExtension}`;

        const searchParams = new URLSearchParams({
          filename: key,
          content_type: imageFile.type,
        });
        
        const uploadUrlResponse = await apiAuth.get(
          `/private/organization/logo-upload-url?${searchParams}`
        );

        const { upload_url } = uploadUrlResponse.data;

        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: imageFile,
          headers: {
            "Content-Type": imageFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(t("organizationCreation.messages.uploadError"));
        }

        logoKey = key;
      }

      await updateOrganization({
        name: values.name,
        latitude: values.latitude!,
        longitude: values.longitude!,
        address_name: values.locationName,
        address_complement: values.addressComplement,
        logo: logoKey,
      });

      toast({
        title: t("organizationCreation.messages.success"),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = updateOrganizationErrorMessage(error as AppError, t);
      toast({
        title: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={createOrganizationSchema(t)}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit: formikSubmit }) => (
        <form onSubmit={formikSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("organizationCreation.sections.basicInfo.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t("organizationCreation.fields.name.label")} *</Label>
                <Input
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t("organizationCreation.fields.name.placeholder")}
                />
                {errors.name && touched.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label>{t("organizationCreation.fields.logo.label")}</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt={t("organizationCreation.fields.logo.preview")}
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {t("organizationCreation.fields.logo.uploadText")}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("organizationCreation.sections.location.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="locationName">{t("organizationCreation.fields.locationName.label")} *</Label>
                <Input
                  id="locationName"
                  name="locationName"
                  value={values.locationName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t("organizationCreation.fields.locationName.placeholder")}
                />
                {errors.locationName && touched.locationName && (
                  <p className="text-sm text-destructive mt-1">{errors.locationName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="addressName">{t("organizationCreation.fields.address.label")} *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="addressName"
                    name="addressName"
                    value={values.addressName}
                    onChange={(e) => {
                      handleChange(e);
                      debouncedLocationSearch(e.target.value);
                    }}
                    onBlur={handleBlur}
                    placeholder={t("organizationCreation.fields.address.placeholder")}
                    className="pl-10"
                  />
                  {errors.addressName && touched.addressName && (
                    <p className="text-sm text-destructive mt-1">{errors.addressName}</p>
                  )}

                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm text-foreground"
                          onClick={() => handleLocationSelect(suggestion, setFieldValue)}
                        >
                          {suggestion.displayName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="addressComplement">{t("organizationCreation.fields.addressComplement.label")}</Label>
                <Input
                  id="addressComplement"
                  name="addressComplement"
                  value={values.addressComplement}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t("organizationCreation.fields.addressComplement.placeholder")}
                />
              </div>

              {values.locationDisplayName && (
                <div className="text-sm text-muted-foreground">
                  {t("organizationCreation.fields.selected", { location: values.locationDisplayName })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
};
