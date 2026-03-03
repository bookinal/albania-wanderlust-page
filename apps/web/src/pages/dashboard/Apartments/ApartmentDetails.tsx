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
  Bed,
  DollarSign,
  Mail,
  Phone,
  Home,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  Apartment,
  UpdateApartmentDto,
  PREDEFINED_AMENITIES,
} from "@/types/apartment.type";
import {
  getApartmentById,
  updateApartment,
} from "@/services/api/apartmentService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

const ApartmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  const { t } = useTranslation();

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateApartmentDto>({});
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  /* -------------------------------------------------------------------------- */
  /*                                   Fetch                                    */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const fetchApartment = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getApartmentById(Number(id));
        setApartment(data);
        setFormData(data ?? {});
        setNewImageFiles([]);
      } catch (error) {
        console.error("Error fetching apartment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  /* -------------------------------------------------------------------------- */
  /*                                  Handlers                                  */
  /* -------------------------------------------------------------------------- */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "rating" || name === "rooms" || name === "price"
          ? Number(value)
          : value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];
      const isSelected = currentAmenities.includes(amenity);

      if (isSelected) {
        return {
          ...prev,
          amenities: currentAmenities.filter((a) => a !== amenity),
        };
      } else {
        return {
          ...prev,
          amenities: [...currentAmenities, amenity],
        };
      }
    });
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    try {
      const updated = await updateApartment(
        Number(id),
        formData,
        newImageFiles.length > 0 ? newImageFiles : undefined,
      );
      setApartment(updated);
      setFormData(updated);
      setNewImageFiles([]);
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: t("apartment.save"),
        text: t("apartment.updateSuccess"),
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("apartment.updateFailed"),
      });
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <Hsidebar>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </Hsidebar>
    );
  }

  if (!apartment) {
    return (
      <Hsidebar>
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold">
            {t("apartment.apartmentNotFound")}
          </h3>
          <Button onClick={() => navigate("/dashboard/ApartmentsList")}>
            <ArrowLeft className="mr-2" size={16} />
            {t("apartment.backToApartments")}
          </Button>
        </div>
      </Hsidebar>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <Hsidebar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/ApartmentsList")}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="mr-2" size={16} />
              {t("apartment.backToApartments")}
            </Button>

            <h1 className="text-3xl font-bold">
              {isEditing
                ? t("apartment.editApartment")
                : t("apartment.apartmentDetails")}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditing
                ? t("apartment.updateInfo")
                : t("apartment.viewDetails")}
            </p>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="mr-2" size={16} />
                  {t("apartment.cancel")}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      {t("apartment.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      {t("apartment.save")}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2" size={16} />
                {t("apartment.editApartment")}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-6">
              {isEditing ? (
                <div className="p-4">
                  <ImageUpload
                    propertyType="Apartment"
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
                  {apartment.imageUrls && apartment.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[300px]">
                      {/* First large image */}
                      <div
                        className={`bg-cover bg-center cursor-pointer relative group ${
                          apartment.imageUrls.length === 1
                            ? "col-span-4 row-span-2"
                            : "col-span-2 row-span-2"
                        }`}
                        style={{
                          backgroundImage: `url(${apartment.imageUrls[0]})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      </div>

                      {/* Other images grid */}
                      {apartment.imageUrls.slice(1, 5).map((url, idx) => (
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
                      {apartment.imageUrls.length > 5 && (
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          +{apartment.imageUrls.length - 5} photos
                        </div>
                      )}
                    </div>
                  ) : apartment.imageUrls[0] ? (
                    <div className="h-64 bg-cover bg-center" />
                  ) : (
                    <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t("apartment.noImages")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl">
              <Label>{t("apartment.status")}</Label>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full mt-2 border rounded-md px-3 py-2"
                >
                  <option value="available">{t("apartment.available")}</option>
                  <option value="rented">{t("apartment.rented")}</option>
                  <option value="maintenance">
                    {t("apartment.maintenance")}
                  </option>
                </select>
              ) : (
                <span className="inline-block mt-2 px-4 py-2 rounded-full bg-blue-600 text-white">
                  {apartment.status}
                </span>
              )}
            </div>

            {/* Availability Calendar */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <AvailabilityCalendar
                propertyId={Number(id)}
                propertyType="apartment"
              />
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-6">
                {t("apartment.basicInformation")}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>
                    <Home size={16} /> {t("apartment.name")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{apartment.name}</p>
                  )}
                </div>

                <div>
                  <Label>
                    <MapPin size={16} /> {t("apartment.address")}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{apartment.address}</p>
                  )}
                </div>

                <div>
                  <Label>
                    <Star size={16} /> {t("apartment.rating")}
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      name="rating"
                      value={formData.rating || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{apartment.rating}</p>
                  )}
                </div>

                <div>
                  <Label>
                    <DollarSign size={16} /> {t("apartment.pricePerDay")}
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      name="price"
                      value={formData.price || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>${apartment.price}</p>
                  )}
                </div>

                <div>
                  <Label>
                    <Bed size={16} /> {t("apartment.rooms")}
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      name="rooms"
                      value={formData.rooms || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{apartment.rooms}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-6">
                {t("apartment.amenities")}
              </h2>

              {isEditing ? (
                <div className="space-y-3">
                  {/* Selected Amenities */}
                  {formData.amenities && formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="default"
                          className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1"
                          onClick={() => handleAmenityToggle(amenity)}
                        >
                          {amenity}
                          <X size={12} />
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Available Amenities */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">
                      Click to select amenities:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_AMENITIES.map((amenity) => {
                        const isSelected =
                          formData.amenities?.includes(amenity) || false;
                        return (
                          <Badge
                            key={amenity}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleAmenityToggle(amenity)}
                          >
                            {amenity}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {apartment.amenities && apartment.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {apartment.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {t("apartment.noAmenities")}
                    </p>
                  )}
                </div>
              )}
            </div>

            <MapPicker
              lat={formData.lat}
              lng={formData.lng}
              onLocationSelect={handleLocationSelect}
              label={t("apartment.apartmentLocation")}
              defaultCenter={[apartment.lat || 40.7, apartment.lng || -73.9]}
              showCoordinates
            />

            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">
                {t("apartment.description")}
              </h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded-md p-3"
                />
              ) : (
                <p>{apartment.description || t("apartment.noDescription")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Hsidebar>
  );
};

export default ApartmentDetails;
