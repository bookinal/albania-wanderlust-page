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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { CreateHotelDto } from "@/types/hotel.types";
import { createHotel } from "@/services/api/hotelService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

interface AddHotelDialogProps {
  onHotelAdded: (hotel: any) => void;
}

export const AddHotelDialog: React.FC<AddHotelDialogProps> = ({
  onHotelAdded,
}) => {
  const { t } = useTranslation();
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
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
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

      // Reset form
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
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
          <Plus className="mr-2" size={20} />
          {t("hotels.addHotelDialog.buttons.addHotel")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("hotels.addHotelDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("hotels.addHotelDialog.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.hotelName")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.hotelNamePlaceholder",
                )}
                required
                className="w-full"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.location")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.locationPlaceholder",
                )}
                required
                className="w-full"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.rating")}
              </Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                placeholder={t("hotels.addHotelDialog.form.ratingPlaceholder")}
                className="w-full"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.price")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder={t("hotels.addHotelDialog.form.pricePlaceholder")}
                required
                className="w-full"
              />
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <Label htmlFor="rooms" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.rooms")}
              </Label>
              <Input
                id="rooms"
                name="rooms"
                type="number"
                min="0"
                value={formData.rooms}
                onChange={handleChange}
                placeholder={t("hotels.addHotelDialog.form.roomsPlaceholder")}
                className="w-full"
              />
            </div>

            {/* Occupancy */}
            <div className="space-y-2">
              <Label htmlFor="occupancy" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.occupancy")}
              </Label>
              <Input
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
                className="w-full"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.status")}
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="active">
                  {t("hotels.addHotelDialog.form.statusActive")}
                </option>
                <option value="maintenance">
                  {t("hotels.addHotelDialog.form.statusMaintenance")}
                </option>
              </select>
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.contactEmail")}
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.contactEmailPlaceholder",
                )}
                className="w-full"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-sm font-medium">
                {t("hotels.addHotelDialog.form.contactPhone")}
              </Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder={t(
                  "hotels.addHotelDialog.form.contactPhonePlaceholder",
                )}
                className="w-full"
              />
            </div>
          </div>

          {/* Image Upload Component */}
          <ImageUpload
            propertyType="Hotel"
            onImagesSelected={(files) => {
              setSelectedImageFiles(files);
            }}
            selectedFiles={selectedImageFiles}
            onRemoveFile={(index) => {
              setSelectedImageFiles((prev) =>
                prev.filter((_, i) => i !== index),
              );
            }}
            maxImages={10}
            isLoading={loading}
          />

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              {t("hotels.addHotelDialog.form.address")}
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t("hotels.addHotelDialog.form.addressPlaceholder")}
              className="w-full"
            />
          </div>

          {/* Map Picker Component */}
          <MapPicker
            lat={formData.lat}
            lng={formData.lng}
            onLocationSelect={handleLocationSelect}
            label={t("hotels.addHotelDialog.form.mapLabel")}
            defaultCenter={[41.327953, 19.819025]}
            defaultZoom={8}
            showCoordinates={true}
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("hotels.addHotelDialog.form.description")}
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t(
                "hotels.addHotelDialog.form.descriptionPlaceholder",
              )}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t("hotels.addHotelDialog.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  {t("hotels.addHotelDialog.adding")}
                </>
              ) : (
                <>
                  <Plus className="mr-2" size={16} />
                  {t("hotels.addHotelDialog.buttons.addHotel")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
