import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Hsidebar from "../../../components/dashboard/hsidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  MapPin,
  Star,
  Users,
  Bed,
  DollarSign,
  Mail,
  Home,
  Phone,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Hotel, UpdateHotelDto } from "@/types/hotel.types";
import { getHotelById, updateHotel } from "@/services/api/hotelService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const HotelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateHotelDto>({});
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const { t } = useTranslation();

  // Fetch hotel data
  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getHotelById(parseInt(id));

        // If no data from service, use mock data for demo
        if (!data) {
          // Mock hotel data for demonstration
          const mockHotel: Hotel = {
            id: parseInt(id),
            name: "Grand Plaza Hotel",
            location: "New York, USA",
            rating: 4.8,
            rooms: 150,
            occupancy: 85,
            price: 299,
            status: "active",
            imageUrls: [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            ],
            description:
              "Luxurious hotel in the heart of Manhattan with stunning city views, world-class amenities, and exceptional service. Perfect for business and leisure travelers.",
            amenities: [
              "Free WiFi",
              "Pool",
              "Spa",
              "Gym",
              "Restaurant",
              "Room Service",
              "Parking",
            ],
            contactEmail: "info@grandplaza.com",
            contactPhone: "+1 (212) 555-0100",
            address: "123 Fifth Avenue, New York, NY 10001",
            lat: 40.7831,
            lng: -73.9712,
          };
          setHotel(mockHotel);
          setFormData(mockHotel);
        } else {
          setHotel(data);
          setFormData(data);
        }
      } catch (error) {
        console.error("Error fetching hotel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (hotel) {
      setFormData(hotel);
    }
    setNewImageFiles([]);
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    try {
      const updatedHotel = await updateHotel(
        parseInt(id),
        formData,
        newImageFiles,
      );
      setHotel(updatedHotel);
      setIsEditing(false);
      setNewImageFiles([]);
      Swal.fire({
        icon: "success",
        title: t("hotels.hotelDetails.success.title"),
        text: t("hotels.hotelDetails.success.message"),
      });
    } catch (error) {
      console.error("Error updating hotel:", error);
      Swal.fire({
        icon: "error",
        title: t("hotels.hotelDetails.error.title"),
        text: t("hotels.hotelDetails.error.message"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Hsidebar>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </Hsidebar>
    );
  }

  if (!hotel) {
    return (
      <Hsidebar>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("hotels.hotelDetails.notFound.title")}
            </h3>
            <p className="text-gray-500 mb-8">
              {t("hotels.hotelDetails.notFound.description")}
            </p>
            <Button onClick={() => navigate("/dashboard/HotelsList")}>
              <ArrowLeft className="mr-2" size={16} />
              {t("hotels.hotelDetails.backToHotels")}
            </Button>
          </div>
        </div>
      </Hsidebar>
    );
  }

  return (
    <Hsidebar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/HotelsList")}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="mr-2" size={16} />
              {t("hotels.hotelDetails.backToHotels")}
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing
                ? t("hotels.hotelDetails.edit.title")
                : t("hotels.hotelDetails.view.title")}
            </h1>
            <p className="text-gray-500 text-lg mt-1">
              {isEditing
                ? t("hotels.hotelDetails.edit.subtitle")
                : t("hotels.hotelDetails.view.subtitle")}
            </p>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="mr-2" size={16} />
                  {t("hotels.hotelDetails.buttons.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      {t("hotels.hotelDetails.buttons.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      {t("hotels.hotelDetails.buttons.saveChanges")}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Edit className="mr-2" size={16} />
                {t("hotels.hotelDetails.buttons.editHotel")}
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1">
            {/* Hotel Image */}
            {/* Hotel Image / Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-6">
              {isEditing ? (
                <div className="p-4">
                  <ImageUpload
                    propertyType="Hotel"
                    disableUpload={true}
                    onImagesSelected={(files) => {
                      setNewImageFiles((prev) => [...prev, ...files]);
                    }}
                    selectedFiles={newImageFiles}
                    onRemoveFile={(index) => {
                      setNewImageFiles((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                    existingImages={formData.imageUrls}
                    onRemoveExisting={(url) => {
                      setFormData((prev) => ({
                        ...prev,
                        imageUrls: prev.imageUrls?.filter((img) => img !== url),
                      }));
                    }}
                    maxImages={10}
                    isLoading={saving}
                  />
                </div>
              ) : (
                <div className="relative">
                  {/* Main Image */}
                  {hotel.imageUrls && hotel.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[300px]">
                      {/* First large image */}
                      <div
                        className={`bg-cover bg-center cursor-pointer relative group ${
                          hotel.imageUrls.length === 1
                            ? "col-span-4 row-span-2"
                            : "col-span-2 row-span-2"
                        }`}
                        style={{
                          backgroundImage: `url(${hotel.imageUrls[0]})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      </div>

                      {/* Other images grid */}
                      {hotel.imageUrls.slice(1, 5).map((url, idx) => (
                        <div
                          key={idx}
                          className="bg-cover bg-center col-span-1 row-span-1 relative group"
                          style={{
                            backgroundImage: `url(${url})`,
                          }}
                        >
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        </div>
                      ))}

                      {/* "See all" overlay if more than 5 images */}
                      {hotel.imageUrls.length > 5 && (
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          +{hotel.imageUrls.length - 5}{" "}
                          {t("hotels.hotelDetails.images.photos", {
                            count: hotel.imageUrls.length - 5,
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>
                          {t("hotels.hotelDetails.images.noImagesAvailable")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Label className="text-sm font-medium mb-2 block">
                {t("hotels.hotelDetails.sections.status")}
              </Label>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status || "active"}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="active">
                    {t("hotels.hotelDetails.statusOptions.active")}
                  </option>
                  <option value="maintenance">
                    {t("hotels.hotelDetails.statusOptions.maintenance")}
                  </option>
                </select>
              ) : (
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                    hotel.status === "active"
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {hotel.status}
                </span>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {t("hotels.hotelDetails.sections.basicInformation")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Home size={16} className="text-blue-500" />
                    {t("hotels.hotelDetails.fields.hotelName")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="text-lg font-semibold"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {hotel.name}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    {t("hotels.hotelDetails.fields.location")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="location"
                      value={formData.location || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-gray-700">{hotel.location}</p>
                  )}
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    {t("hotels.hotelDetails.fields.rating")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {hotel.rating} / 5.0
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" />
                    {t("hotels.hotelDetails.fields.pricePerNight")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      ${hotel.price}
                    </p>
                  )}
                </div>

                {/* Rooms */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Bed size={16} className="text-gray-500" />
                    {t("hotels.hotelDetails.fields.totalRooms")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="rooms"
                      type="number"
                      min="0"
                      value={formData.rooms || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-gray-700">
                      {hotel.rooms} {t("hotels.hotelDetails.display.rooms")}
                    </p>
                  )}
                </div>

                {/* Occupancy */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    {t("hotels.hotelDetails.fields.occupancyRate")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="occupancy"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.occupancy || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-gray-700">{hotel.occupancy}%</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {t("hotels.hotelDetails.sections.contactInformation")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mail size={16} className="text-blue-500" />
                    {t("hotels.hotelDetails.fields.email")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-gray-700">
                      {hotel.contactEmail || "N/A"}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Phone size={16} className="text-blue-500" />
                    {t("hotels.hotelDetails.fields.phone")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="contactPhone"
                      value={formData.contactPhone || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-gray-700">
                      {hotel.contactPhone || "N/A"}
                    </p>
                  )}
                </div>

                {/* Address - Full Width */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    {t("hotels.hotelDetails.fields.fullAddress")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-gray-700">{hotel.address || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Map Location */}
            {isEditing ? (
              <MapPicker
                lat={formData.lat}
                lng={formData.lng}
                onLocationSelect={handleLocationSelect}
                label={t("hotels.hotelDetails.fields.hotelLocationOnMap")}
                defaultCenter={[hotel.lat || 40.7831, hotel.lng || -73.9712]}
                defaultZoom={13}
                showCoordinates={true}
              />
            ) : (
              hotel.lat !== undefined &&
              hotel.lng !== undefined && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t("hotels.hotelDetails.sections.location")}
                  </h2>
                  <MapPicker
                    lat={hotel.lat}
                    lng={hotel.lng}
                    onLocationSelect={() => {}}
                    label=""
                    defaultCenter={[hotel.lat, hotel.lng]}
                    defaultZoom={15}
                    showCoordinates={true}
                  />
                </div>
              )
            )}

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t("hotels.hotelDetails.sections.description")}
              </h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {hotel.description ||
                    t("hotels.hotelDetails.display.noDescription")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Hsidebar>
  );
};

export default HotelDetails;
