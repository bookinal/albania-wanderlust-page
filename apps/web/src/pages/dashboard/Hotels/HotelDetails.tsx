import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { useTheme } from "@/context/ThemeContext";

const HotelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#faf8f5',
    inputBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    inputText: isDark ? '#ffffff' : '#111115',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    labelText: isDark ? 'rgba(255,255,255,0.55)' : '#6b6663',
    optionBg: isDark ? '#1a1a1a' : '#ffffff',
    ghostBtnText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    ghostBtnBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    primaryBtnBg: '#E8192C',
    primaryBtnText: '#ffffff',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 6,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    color: tk.inputText,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    padding: '0 12px',
    borderRadius: 6,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    color: tk.inputText,
    fontSize: 14,
    outline: 'none',
  };

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateHotelDto>({});
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getHotelById(parseInt(id));
        if (!data) {
          const mockHotel: Hotel = {
            id: parseInt(id),
            name: "Grand Plaza Hotel",
            location: "New York, USA",
            rating: 4.8,
            rooms: 150,
            occupancy: 85,
            price: 299,
            status: "active",
            imageUrls: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
            description: "Luxurious hotel in the heart of Manhattan with stunning city views, world-class amenities, and exceptional service. Perfect for business and leisure travelers.",
            amenities: ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant", "Room Service", "Parking"],
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" || name === "rooms" || name === "occupancy" || name === "price"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    if (hotel) setFormData(hotel);
    setNewImageFiles([]);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updatedHotel = await updateHotel(parseInt(id), formData, newImageFiles);
      setHotel(updatedHotel);
      setIsEditing(false);
      setNewImageFiles([]);
      Swal.fire({ icon: "success", title: t("hotels.hotelDetails.success.title"), text: t("hotels.hotelDetails.success.message") });
    } catch (error) {
      console.error("Error updating hotel:", error);
      Swal.fire({ icon: "error", title: t("hotels.hotelDetails.error.title"), text: t("hotels.hotelDetails.error.message") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: tk.pageBg }}>
          <Loader2 className="animate-spin" size={48} style={{ color: '#E8192C' }} />
        </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ background: tk.pageBg, minHeight: '100vh', color: tk.pageText }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{t("hotels.hotelDetails.notFound.title")}</h3>
            <p style={{ color: tk.mutedText, marginBottom: 32 }}>{t("hotels.hotelDetails.notFound.description")}</p>
            <button
              onClick={() => navigate("/dashboard/HotelsList")}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: '#E8192C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              <ArrowLeft size={16} /> {t("hotels.hotelDetails.backToHotels")}
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
              onClick={() => navigate("/dashboard/HotelsList")}
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
              <ArrowLeft size={16} /> {t("hotels.hotelDetails.backToHotels")}
            </button>
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>
              {isEditing
                ? t("hotels.hotelDetails.edit.title")
                : t("hotels.hotelDetails.view.title")}
            </h1>
            <p style={{ color: tk.mutedText, fontSize: 16, marginTop: 4 }}>
              {isEditing
                ? t("hotels.hotelDetails.edit.subtitle")
                : t("hotels.hotelDetails.view.subtitle")}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
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
                  <X size={16} /> {t("hotels.hotelDetails.buttons.cancel")}
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
                      {t("hotels.hotelDetails.buttons.saving")}
                    </>
                  ) : (
                    <>
                      <Save size={16} />{" "}
                      {t("hotels.hotelDetails.buttons.saveChanges")}
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
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
                <Edit size={16} /> {t("hotels.hotelDetails.buttons.editHotel")}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}
        >
          {/* Left Column */}
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
                    propertyType="Hotel"
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
                  {hotel.imageUrls && hotel.imageUrls.length > 0 ? (
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
                          backgroundImage: `url(${hotel.imageUrls[0]})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          gridColumn:
                            hotel.imageUrls.length === 1
                              ? "1 / span 4"
                              : "1 / span 2",
                          gridRow: "1 / span 2",
                        }}
                      />
                      {hotel.imageUrls.slice(1, 5).map((url, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundImage: `url(${url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ))}
                      {hotel.imageUrls.length > 5 && (
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
                          +{hotel.imageUrls.length - 5}{" "}
                          {t("hotels.hotelDetails.images.photos", {
                            count: hotel.imageUrls.length - 5,
                          })}
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
                        <p>
                          {t("hotels.hotelDetails.images.noImagesAvailable")}
                        </p>
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
                {t("hotels.hotelDetails.sections.status")}
              </p>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status || "active"}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="active" style={{ background: tk.optionBg }}>
                    {t("hotels.hotelDetails.statusOptions.active")}
                  </option>
                  <option
                    value="maintenance"
                    style={{ background: tk.optionBg }}
                  >
                    {t("hotels.hotelDetails.statusOptions.maintenance")}
                  </option>
                </select>
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background:
                      hotel.status === "active" ? "#10b981" : "#f59e0b",
                    color: "#ffffff",
                  }}
                >
                  {hotel.status}
                </span>
              )}
            </div>
          </div>

          {/* Right Column */}
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
                {t("hotels.hotelDetails.sections.basicInformation")}
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
                    {t("hotels.hotelDetails.fields.hotelName")}
                  </p>
                  {isEditing ? (
                    <input
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      style={{ ...inputStyle, fontSize: 16, fontWeight: 600 }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: tk.pageText,
                      }}
                    >
                      {hotel.name}
                    </p>
                  )}
                </div>
                {/* Location */}
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
                    {t("hotels.hotelDetails.fields.location")}
                  </p>
                  {isEditing ? (
                    <input
                      name="location"
                      value={formData.location || ""}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{ color: tk.dimText }}>{hotel.location}</p>
                  )}
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
                    {t("hotels.hotelDetails.fields.rating")}
                  </p>
                  {isEditing ? (
                    <input
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating || 0}
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
                      {hotel.rating} / 5.0
                    </p>
                  )}
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
                    {t("hotels.hotelDetails.fields.pricePerNight")}
                  </p>
                  {isEditing ? (
                    <input
                      name="price"
                      type="number"
                      min="0"
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
                      ${hotel.price}
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
                    <Bed size={14} style={{ color: tk.mutedText }} />{" "}
                    {t("hotels.hotelDetails.fields.totalRooms")}
                  </p>
                  {isEditing ? (
                    <input
                      name="rooms"
                      type="number"
                      min="0"
                      value={formData.rooms || 0}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{ color: tk.dimText }}>
                      {hotel.rooms} {t("hotels.hotelDetails.display.rooms")}
                    </p>
                  )}
                </div>
                {/* Occupancy */}
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
                    <Users size={14} style={{ color: tk.mutedText }} />{" "}
                    {t("hotels.hotelDetails.fields.occupancyRate")}
                  </p>
                  {isEditing ? (
                    <input
                      name="occupancy"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.occupancy || 0}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{ color: tk.dimText }}>{hotel.occupancy}%</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
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
                {t("hotels.hotelDetails.sections.contactInformation")}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {/* Email */}
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
                    <Mail size={14} style={{ color: "#E8192C" }} />{" "}
                    {t("hotels.hotelDetails.fields.email")}
                  </p>
                  {isEditing ? (
                    <input
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail || ""}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{ color: tk.dimText }}>
                      {hotel.contactEmail || "N/A"}
                    </p>
                  )}
                </div>
                {/* Phone */}
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
                    <Phone size={14} style={{ color: "#E8192C" }} />{" "}
                    {t("hotels.hotelDetails.fields.phone")}
                  </p>
                  {isEditing ? (
                    <input
                      name="contactPhone"
                      value={formData.contactPhone || ""}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{ color: tk.dimText }}>
                      {hotel.contactPhone || "N/A"}
                    </p>
                  )}
                </div>
                {/* Address */}
                <div style={{ gridColumn: "1 / span 2" }}>
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
                    {t("hotels.hotelDetails.fields.fullAddress")}
                  </p>
                  {isEditing ? (
                    <input
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{ color: tk.dimText }}>
                      {hotel.address || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            {isEditing ? (
              <MapPicker
                lat={formData.lat}
                lng={formData.lng}
                canEdit={false}
                onLocationSelect={handleLocationSelect}
                label={t("hotels.hotelDetails.fields.hotelLocationOnMap")}
                defaultCenter={[hotel.lat || 40.7831, hotel.lng || -73.9712]}
                defaultZoom={13}
                showCoordinates={true}
              />
            ) : (
              hotel.lat !== undefined &&
              hotel.lng !== undefined && (
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
                    {t("hotels.hotelDetails.sections.location")}
                  </h2>
                  <MapPicker
                    lat={hotel.lat}
                    lng={hotel.lng}
                    canEdit={false}
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
                {t("hotels.hotelDetails.sections.description")}
              </h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />
              ) : (
                <p style={{ color: tk.dimText, lineHeight: 1.6 }}>
                  {hotel.description ||
                    t("hotels.hotelDetails.display.noDescription")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
