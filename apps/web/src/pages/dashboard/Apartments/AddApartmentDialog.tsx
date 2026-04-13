import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Clock, X } from "lucide-react";
import { propertyRequestService } from "@/services/api/propertyRequest";
import { authService } from "@/services/api/authService";
import {
  CreateApartmentDto,
  Apartment,
  PREDEFINED_AMENITIES,
} from "@/types/apartment.type";
import { createApartment } from "@/services/api/apartmentService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ALBANIAN_CITIES } from "@/lib/albanianCities";

interface AddApartmentDialogProps {
  onApartmentAdded: (apartment: Apartment) => void;
}

export const AddApartmentDialog: React.FC<AddApartmentDialogProps> = ({
  onApartmentAdded,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<CreateApartmentDto>({
    name: "",
    address: "",
    location: "",
    rating: 0,
    rooms: 1,
    beds: 1,
    kitchens: 1,
    bathrooms: 1,
    livingRooms: 1,
    price: 0,
    status: "review",
    imageUrls: [],
    description: "",
    amenities: [],
    lat: undefined,
    lng: undefined,
  });

  const tk = {
    dialogBg: isDark ? "#111115" : "#ffffff",
    dialogText: isDark ? "#ffffff" : "#111115",
    labelText: isDark ? "rgba(255,255,255,0.55)" : "#44403c",
    inputBg: isDark ? "rgba(255,255,255,0.04)" : "#faf8f5",
    inputBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    inputText: isDark ? "#ffffff" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : "#6b6663",
    optionBg: isDark ? "#1a1a1a" : "#ffffff",
    chipSelectedBg: isDark ? "rgba(232,25,44,0.12)" : "#dbeafe",
    chipSelectedText: isDark ? "#E8192C" : "#1d4ed8",
    chipSelectedBorder: isDark ? "rgba(232,25,44,0.30)" : "#93c5fd",
    chipUnselBg: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6",
    chipUnselText: isDark ? "rgba(255,255,255,0.60)" : "#374151",
    chipUnselBorder: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
    ghostBtnBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    ghostBtnText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    successPendingBg: isDark ? "rgba(234,179,8,0.10)" : "#fefce8",
    successPendingBorder: isDark ? "rgba(234,179,8,0.25)" : "#fde047",
    successPendingText: isDark ? "#fde047" : "#854d0e",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    color: tk.inputText,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "rating" ||
        name === "rooms" ||
        name === "beds" ||
        name === "kitchens" ||
        name === "bathrooms" ||
        name === "livingRooms" ||
        name === "price"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleLocationSelect = React.useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  }, []);

  const handleAddressSelect = React.useCallback((address: string) => {
    setFormData((prev) => ({ ...prev, address }));
  }, []);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];
      const isSelected = currentAmenities.includes(amenity);
      return {
        ...prev,
        amenities: isSelected
          ? currentAmenities.filter((a) => a !== amenity)
          : [...currentAmenities, amenity],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) {
      alert(t("apartment.requiredFields"));
      return;
    }
    if (selectedImageFiles.length === 0) {
      alert(t("apartment.uploadImage"));
      return;
    }
    setLoading(true);
    try {
      const providerId = await authService.getCurrentUserId();
      if (!providerId) throw new Error("User not authenticated");

      const apartmentData: CreateApartmentDto = {
        ...formData,
        status: "review",
      };
      const newApartment = await createApartment(
        apartmentData,
        selectedImageFiles,
      );
      await propertyRequestService.createRequest(
        providerId,
        newApartment.id.toString(),
        "apartment",
        `New apartment listing: ${formData.name}`,
      );
      onApartmentAdded(newApartment);
      setSubmissionSuccess(true);
      setFormData({
        name: "",
        address: "",
        location: "",
        rating: 0,
        rooms: 1,
        beds: 1,
        kitchens: 1,
        bathrooms: 1,
        livingRooms: 1,
        price: 0,
        status: "review",
        imageUrls: [],
        description: "",
        amenities: [],
        lat: undefined,
        lng: undefined,
      });
      setSelectedImageFiles([]);
    } catch (error) {
      console.error("Error adding apartment:", error);
      alert(
        `${t("apartment.addFailed")}: ${error instanceof Error ? error.message : t("common.tryAgain")}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setSubmissionSuccess(false);
      }}
    >
      <DialogTrigger asChild>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 8,
            background: "#E8192C",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Plus size={18} /> {t("apartment.addApartment")}
        </button>
      </DialogTrigger>
      <DialogContent
        style={{
          background: tk.dialogBg,
          color: tk.dialogText,
          maxWidth: 640,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {submissionSuccess ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: isDark ? "rgba(234,179,8,0.15)" : "#fef9c3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <Clock size={32} style={{ color: "#ca8a04" }} />
            </div>
            <DialogHeader>
              <DialogTitle
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: tk.dialogText,
                  marginBottom: 8,
                }}
              >
                {t("apartment.successTitle")}
              </DialogTitle>
              <DialogDescription
                style={{ color: tk.mutedText, maxWidth: 380, margin: "0 auto" }}
              >
                {t("apartment.successMessage")}
              </DialogDescription>
            </DialogHeader>
            <div
              style={{
                marginTop: 32,
                padding: 16,
                background: tk.successPendingBg,
                border: `1px solid ${tk.successPendingBorder}`,
                borderRadius: 8,
                maxWidth: 380,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: tk.successPendingText,
                  fontWeight: 500,
                }}
              >
                <Clock size={18} /> {t("apartment.statusPending")}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: isDark ? "rgba(234,179,8,0.70)" : "#713f12",
                  marginTop: 8,
                }}
              >
                {t("apartment.statusDescription")}
              </p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setSubmissionSuccess(false);
              }}
              style={{
                marginTop: 32,
                padding: "10px 24px",
                borderRadius: 8,
                background: "#E8192C",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {t("apartment.close")}
            </button>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle
                style={{ fontSize: 22, fontWeight: 700, color: "#E8192C" }}
              >
                {t("apartment.addNewApartment")}
              </DialogTitle>
              <DialogDescription style={{ color: tk.mutedText }}>
                {t("apartment.addDescription")}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Name */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.apartmentName")}{" "}
                    <span style={{ color: "#E8192C" }}>*</span>
                  </p>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Luxury Downtown Apartment"
                    required
                    style={inputStyle}
                  />
                </div>
                {/* Address */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.address")}
                  </p>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Tirana"
                    style={inputStyle}
                  />
                </div>
                {/* Location */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.cityLocation")}
                  </p>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="" disabled>
                      Select city in Albania
                    </option>
                    {ALBANIAN_CITIES.map((city) => (
                      <option
                        key={city}
                        value={city}
                        style={{
                          background: tk.optionBg,
                          color: tk.inputText,
                        }}
                      >
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Rating */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.rating")}
                  </p>
                  <input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                    style={inputStyle}
                  />
                </div>
                {/* Price */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.pricePerDay")}{" "}
                    <span style={{ color: "#E8192C" }}>*</span>
                  </p>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="150"
                    required
                    style={inputStyle}
                  />
                </div>
                {/* Rooms */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.rooms")}
                  </p>
                  <input
                    id="rooms"
                    name="rooms"
                    type="number"
                    min="0"
                    value={formData.rooms}
                    onChange={handleChange}
                    placeholder="3"
                    style={inputStyle}
                  />
                </div>
                {/* Beds */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.beds")}
                  </p>
                  <input
                    id="beds"
                    name="beds"
                    type="number"
                    min="0"
                    value={formData.beds}
                    onChange={handleChange}
                    placeholder="2"
                    style={inputStyle}
                  />
                </div>
                {/* Kitchens */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.kitchens")}
                  </p>
                  <input
                    id="kitchens"
                    name="kitchens"
                    type="number"
                    min="0"
                    value={formData.kitchens}
                    onChange={handleChange}
                    placeholder="1"
                    style={inputStyle}
                  />
                </div>
                {/* Bathrooms */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.bathrooms")}
                  </p>
                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="1"
                    style={inputStyle}
                  />
                </div>
                {/* Living Rooms */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: tk.labelText,
                      marginBottom: 6,
                    }}
                  >
                    {t("apartment.livingRooms")}
                  </p>
                  <input
                    id="livingRooms"
                    name="livingRooms"
                    type="number"
                    min="0"
                    value={formData.livingRooms}
                    onChange={handleChange}
                    placeholder="1"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: tk.labelText,
                    marginBottom: 8,
                  }}
                >
                  {t("apartment.amenities")}
                </p>
                {formData.amenities && formData.amenities.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    {formData.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 10px",
                          borderRadius: 20,
                          background: tk.chipSelectedBg,
                          color: tk.chipSelectedText,
                          border: `1px solid ${tk.chipSelectedBorder}`,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        {amenity} <X size={11} />
                      </span>
                    ))}
                  </div>
                )}
                <p
                  style={{ fontSize: 12, color: tk.mutedText, marginBottom: 8 }}
                >
                  Click to select amenities:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PREDEFINED_AMENITIES.map((amenity) => {
                    const isSelected =
                      formData.amenities?.includes(amenity) || false;
                    return (
                      <span
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: isSelected
                            ? tk.chipSelectedBg
                            : tk.chipUnselBg,
                          color: isSelected
                            ? tk.chipSelectedText
                            : tk.chipUnselText,
                          border: `1px solid ${isSelected ? tk.chipSelectedBorder : tk.chipUnselBorder}`,
                        }}
                      >
                        {amenity}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Image Upload */}
              <ImageUpload
                propertyType="Apartment"
                onImagesSelected={(files) => setSelectedImageFiles(files)}
                selectedFiles={selectedImageFiles}
                onRemoveFile={(index) =>
                  setSelectedImageFiles((prev) =>
                    prev.filter((_, i) => i !== index),
                  )
                }
                maxImages={10}
                isLoading={loading}
              />

              {/* Map */}
              <MapPicker
                lat={formData.lat}
                lng={formData.lng}
                onLocationSelect={handleLocationSelect}
                onAddressSelect={handleAddressSelect}
                label={t("apartment.selectLocation")}
                defaultCenter={[41.327953, 19.819025]}
                defaultZoom={8}
                showCoordinates={true}
              />

              {/* Description */}
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: tk.labelText,
                    marginBottom: 6,
                  }}
                >
                  {t("apartment.description")}
                </p>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the apartment features, amenities, and location..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: "transparent",
                    border: `1px solid ${tk.ghostBtnBorder}`,
                    color: tk.ghostBtnText,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {t("apartment.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 20px",
                    borderRadius: 8,
                    background: "#E8192C",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={15} />{" "}
                      {t("apartment.adding")}
                    </>
                  ) : (
                    <>
                      <Plus size={15} /> {t("apartment.addApartment")}
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
