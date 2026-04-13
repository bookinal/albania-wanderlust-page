import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  MapPin,
  Star,
  Bed,
  DollarSign,
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
import { useTheme } from "@/context/ThemeContext";

const ApartmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? "#0d0d0d" : "#f5f4f1",
    pageText: isDark ? "#ffffff" : "#111115",
    cardBg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#ede9e5",
    inputBg: isDark ? "rgba(255,255,255,0.04)" : "#faf8f5",
    inputBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    inputText: isDark ? "#ffffff" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : "#6b6663",
    dimText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    labelText: isDark ? "rgba(255,255,255,0.55)" : "#6b6663",
    optionBg: isDark ? "#1a1a1a" : "#ffffff",
    chipSelectedBg: isDark ? "rgba(232,25,44,0.12)" : "#dbeafe",
    chipSelectedText: isDark ? "#E8192C" : "#1d4ed8",
    chipSelectedBorder: isDark ? "rgba(232,25,44,0.30)" : "#93c5fd",
    chipUnselBg: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6",
    chipUnselText: isDark ? "rgba(255,255,255,0.60)" : "#374151",
    chipUnselBorder: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
    ghostBtnText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    ghostBtnBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    primaryBtnBg: "#E8192C",
    primaryBtnText: "#ffffff",
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

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateApartmentDto>({});
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

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
      return {
        ...prev,
        amenities: isSelected
          ? currentAmenities.filter((a) => a !== amenity)
          : [...currentAmenities, amenity],
      };
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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: tk.pageBg,
        }}
      >
        <Loader2
          className="animate-spin"
          size={48}
          style={{ color: "#E8192C" }}
        />
      </div>
    );
  }

  if (!apartment) {
    return (
      <div
        style={{
          background: tk.pageBg,
          minHeight: "100vh",
          color: tk.pageText,
        }}
      >
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
            {t("apartment.apartmentNotFound")}
          </h3>
          <button
            onClick={() => navigate("/dashboard/ApartmentsList")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 8,
              background: "#E8192C",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> {t("apartment.backToApartments")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: tk.pageBg,
        minHeight: "100vh",
        color: tk.pageText,
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: 32,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <button
              onClick={() => navigate("/dashboard/ApartmentsList")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 16,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: tk.dimText,
                fontSize: 14,
              }}
            >
              <ArrowLeft size={16} /> {t("apartment.backToApartments")}
            </button>
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>
              {isEditing
                ? t("apartment.editApartment")
                : t("apartment.apartmentDetails")}
            </h1>
            <p style={{ color: tk.mutedText, marginTop: 4 }}>
              {isEditing
                ? t("apartment.updateInfo")
                : t("apartment.viewDetails")}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: "transparent",
                    border: `1px solid ${tk.ghostBtnBorder}`,
                    color: tk.ghostBtnText,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <X size={16} /> {t("apartment.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: tk.primaryBtnBg,
                    color: tk.primaryBtnText,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />{" "}
                      {t("apartment.saving")}
                    </>
                  ) : (
                    <>
                      <Save size={16} /> {t("apartment.save")}
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: tk.primaryBtnBg,
                  color: tk.primaryBtnText,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <Edit size={16} /> {t("apartment.editApartment")}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}
        >
          {/* Left */}
          <div>
            {/* Image */}
            <div
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.cardBorder}`,
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              {isEditing ? (
                <div style={{ padding: 16 }}>
                  <ImageUpload
                    propertyType="Apartment"
                    disableUpload={true}
                    onImagesSelected={(files) =>
                      setNewImageFiles((prev) => [...prev, ...files])
                    }
                    selectedFiles={newImageFiles}
                    onRemoveFile={(index) =>
                      setNewImageFiles((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    existingImages={formData.imageUrls}
                    onRemoveExisting={(url) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrls: prev.imageUrls?.filter((img) => img !== url),
                      }))
                    }
                    maxImages={10}
                    isLoading={saving}
                  />
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  {apartment.imageUrls && apartment.imageUrls.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gridTemplateRows: "repeat(2, 1fr)",
                        gap: 4,
                        height: 300,
                      }}
                    >
                      <div
                        style={{
                          backgroundImage: `url(${apartment.imageUrls[0]})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          gridColumn:
                            apartment.imageUrls.length === 1
                              ? "1 / span 4"
                              : "1 / span 2",
                          gridRow: "1 / span 2",
                        }}
                      />
                      {apartment.imageUrls.slice(1, 5).map((url, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundImage: `url(${url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ))}
                      {apartment.imageUrls.length > 5 && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 16,
                            right: 16,
                            background: "rgba(255,255,255,0.9)",
                            backdropFilter: "blur(4px)",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          +{apartment.imageUrls.length - 5} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: 256,
                        background: tk.cardBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: tk.mutedText,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <ImageIcon
                          style={{
                            width: 48,
                            height: 48,
                            margin: "0 auto 8px",
                            opacity: 0.5,
                          }}
                        />
                        <p>{t("apartment.noImages")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            <div
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.cardBorder}`,
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: tk.labelText,
                  marginBottom: 8,
                }}
              >
                {t("apartment.status")}
              </p>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="available" style={{ background: tk.optionBg }}>
                    {t("apartment.available")}
                  </option>
                  <option value="rented" style={{ background: tk.optionBg }}>
                    {t("apartment.rented")}
                  </option>
                  <option
                    value="maintenance"
                    style={{ background: tk.optionBg }}
                  >
                    {t("apartment.maintenance")}
                  </option>
                </select>
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 16px",
                    borderRadius: 20,
                    background: "#3b82f6",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {apartment.status}
                </span>
              )}
            </div>

            {/* Availability Calendar */}
            <div
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.cardBorder}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <AvailabilityCalendar
                propertyId={Number(id)}
                propertyType="apartment"
              />
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Basic Information */}
            <div
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.cardBorder}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 24,
                  color: tk.pageText,
                }}
              >
                {t("apartment.basicInformation")}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {/* Name */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: tk.labelText,
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Home size={14} style={{ color: "#E8192C" }} />{" "}
                    {t("apartment.name")}
                  </p>
                  <p style={{ color: tk.dimText }}>{apartment.name}</p>
                </div>
                {/* Address */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: tk.labelText,
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MapPin size={14} style={{ color: "#E8192C" }} />{" "}
                    {t("apartment.address")}
                  </p>
                  <p style={{ color: tk.dimText }}>{apartment.address}</p>
                </div>
                {/* Rating */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: tk.labelText,
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Star size={14} style={{ color: "#f59e0b" }} />{" "}
                    {t("apartment.rating")}
                  </p>
                  <p style={{ color: tk.dimText }}>{apartment.rating}</p>
                </div>
                {/* Price */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: tk.labelText,
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <DollarSign size={14} style={{ color: "#10b981" }} />{" "}
                    {t("apartment.pricePerDay")}
                  </p>
                  {isEditing ? (
                    <input
                      type="number"
                      name="price"
                      value={formData.price || 0}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: tk.pageText,
                      }}
                    >
                      ${apartment.price}
                    </p>
                  )}
                </div>
                {/* Rooms */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: tk.labelText,
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Bed size={14} style={{ color: "#E8192C" }} />{" "}
                    {t("apartment.rooms")}
                  </p>
                  <p style={{ color: tk.dimText }}>{apartment.rooms}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.cardBorder}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 24,
                  color: tk.pageText,
                }}
              >
                {t("apartment.amenities")}
              </h2>
              {isEditing ? (
                <div>
                  {formData.amenities && formData.amenities.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 12,
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
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: tk.chipSelectedBg,
                            color: tk.chipSelectedText,
                            border: `1px solid ${tk.chipSelectedBorder}`,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          {amenity} <X size={12} />
                        </span>
                      ))}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: 12,
                      color: tk.mutedText,
                      marginBottom: 8,
                    }}
                  >
                    Click to select amenities:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {PREDEFINED_AMENITIES.map((amenity) => {
                      const isSelected =
                        formData.amenities?.includes(amenity) || false;
                      return (
                        <span
                          key={amenity}
                          onClick={() => handleAmenityToggle(amenity)}
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
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
              ) : (
                <div>
                  {apartment.amenities && apartment.amenities.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {apartment.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: tk.chipUnselBg,
                            color: tk.chipUnselText,
                            border: `1px solid ${tk.chipUnselBorder}`,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: tk.mutedText }}>
                      {t("apartment.noAmenities")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Map */}
            <MapPicker
              lat={formData.lat}
              lng={formData.lng}
              canEdit={false}
              onLocationSelect={handleLocationSelect}
              label={t("apartment.apartmentLocation")}
              defaultCenter={[apartment.lat || 40.7, apartment.lng || -73.9]}
              showCoordinates
            />

            {/* Description */}
            <div
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.cardBorder}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: tk.pageText,
                }}
              >
                {t("apartment.description")}
              </h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              ) : (
                <p style={{ color: tk.dimText }}>
                  {apartment.description || t("apartment.noDescription")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetails;
