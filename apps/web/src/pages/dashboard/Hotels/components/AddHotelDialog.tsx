import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { CreateHotelDto } from "@/types/hotel.types";
import { createHotel } from "@/services/api/hotelService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { useTheme } from "@/context/ThemeContext";
import { ALBANIAN_CITIES } from "@/lib/albanianCities";

interface AddHotelDialogProps {
  onHotelAdded: (hotel: any) => void;
}

export const AddHotelDialog: React.FC<AddHotelDialogProps> = ({
  onHotelAdded,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<CreateHotelDto>({
    name: "",
    location: "",
    rating: 0,
    rooms: 0,
    occupancy: 0,
    price: 0,
    status: "active",
    imageUrls: [],
    description: "",
    amenities: [],
    contactEmail: "",
    contactPhone: "",
    address: "",
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
    ghostBtnBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    ghostBtnText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
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

  const selectStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 12px",
    borderRadius: 6,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    color: tk.inputText,
    fontSize: 14,
    outline: "none",
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
        name === "occupancy" ||
        name === "price"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleAddressSelect = (address: string) => {
    setFormData((prev) => ({ ...prev, address }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || formData.price <= 0) {
      alert(t("hotels.addHotelDialog.validation.requiredFields"));
      return;
    }
    if (selectedImageFiles.length === 0) {
      alert(t("hotels.addHotelDialog.validation.imageRequired"));
      return;
    }
    setLoading(true);
    try {
      const newHotel = await createHotel(formData, selectedImageFiles);
      onHotelAdded(newHotel);
      setOpen(false);
      setFormData({
        name: "",
        location: "",
        rating: 0,
        rooms: 0,
        occupancy: 0,
        price: 0,
        status: "active",
        imageUrls: [],
        description: "",
        amenities: [],
        contactEmail: "",
        contactPhone: "",
        address: "",
        lat: undefined,
        lng: undefined,
      });
      setSelectedImageFiles([]);
    } catch (error) {
      console.error("Error adding hotel:", error);
      alert(
        `${t("hotels.addHotelDialog.error.addFailed")}: ${error instanceof Error ? error.message : t("common.tryAgain")}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Plus size={18} /> {t("hotels.addHotelDialog.buttons.addHotel")}
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
        <DialogHeader>
          <DialogTitle
            style={{ fontSize: 22, fontWeight: 700, color: "#E8192C" }}
          >
            {t("hotels.addHotelDialog.title")}
          </DialogTitle>
          <DialogDescription style={{ color: tk.mutedText }}>
            {t("hotels.addHotelDialog.subtitle")}
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
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
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
                {t("hotels.addHotelDialog.form.hotelName")}{" "}
                <span style={{ color: "#E8192C" }}>*</span>
              </p>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.hotelNamePlaceholder",
                )}
                required
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
                {t("hotels.addHotelDialog.form.location")}{" "}
                <span style={{ color: "#E8192C" }}>*</span>
              </p>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                style={selectStyle}
              >
                <option value="" disabled style={{ background: tk.optionBg }}>
                  Select city in Albania
                </option>
                {ALBANIAN_CITIES.map((city) => (
                  <option
                    key={city}
                    value={city}
                    style={{ background: tk.optionBg }}
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
                {t("hotels.addHotelDialog.form.rating")}
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
                placeholder={t("hotels.addHotelDialog.form.ratingPlaceholder")}
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
                {t("hotels.addHotelDialog.form.price")}{" "}
                <span style={{ color: "#E8192C" }}>*</span>
              </p>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder={t("hotels.addHotelDialog.form.pricePlaceholder")}
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
                {t("hotels.addHotelDialog.form.rooms")}
              </p>
              <input
                id="rooms"
                name="rooms"
                type="number"
                min="0"
                value={formData.rooms}
                onChange={handleChange}
                placeholder={t("hotels.addHotelDialog.form.roomsPlaceholder")}
                style={inputStyle}
              />
            </div>
            {/* Occupancy */}
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: tk.labelText,
                  marginBottom: 6,
                }}
              >
                {t("hotels.addHotelDialog.form.occupancy")}
              </p>
              <input
                id="occupancy"
                name="occupancy"
                type="number"
                min="0"
                max="100"
                value={formData.occupancy}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.occupancyPlaceholder",
                )}
                style={inputStyle}
              />
            </div>
            {/* Status */}
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: tk.labelText,
                  marginBottom: 6,
                }}
              >
                {t("hotels.addHotelDialog.form.status")}
              </p>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="active" style={{ background: tk.optionBg }}>
                  {t("hotels.addHotelDialog.form.statusActive")}
                </option>
                <option value="maintenance" style={{ background: tk.optionBg }}>
                  {t("hotels.addHotelDialog.form.statusMaintenance")}
                </option>
              </select>
            </div>
            {/* Contact Email */}
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: tk.labelText,
                  marginBottom: 6,
                }}
              >
                {t("hotels.addHotelDialog.form.contactEmail")}
              </p>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.contactEmailPlaceholder",
                )}
                style={inputStyle}
              />
            </div>
            {/* Contact Phone */}
            <div style={{ gridColumn: "1 / span 2" }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: tk.labelText,
                  marginBottom: 6,
                }}
              >
                {t("hotels.addHotelDialog.form.contactPhone")}
              </p>
              <input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.contactPhonePlaceholder",
                )}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload
            propertyType="Hotel"
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
              {t("hotels.addHotelDialog.form.address")}
            </p>
            <input
              id="address"
              name="address"
              value={formData.address}
              placeholder={t("hotels.addHotelDialog.form.addressPlaceholder")}
              readOnly
              style={inputStyle}
            />
          </div>

          {/* Map */}
          <MapPicker
            lat={formData.lat}
            lng={formData.lng}
            onLocationSelect={handleLocationSelect}
            onAddressSelect={handleAddressSelect}
            label={t("hotels.addHotelDialog.form.mapLabel")}
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
              {t("hotels.addHotelDialog.form.description")}
            </p>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t(
                "hotels.addHotelDialog.form.descriptionPlaceholder",
              )}
              rows={3}
              style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
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
              {t("hotels.addHotelDialog.buttons.cancel")}
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
                  {t("hotels.addHotelDialog.adding")}
                </>
              ) : (
                <>
                  <Plus size={15} />{" "}
                  {t("hotels.addHotelDialog.buttons.addHotel")}
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
