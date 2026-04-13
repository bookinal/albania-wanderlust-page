import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  MapPin,
  Star,
  Users,
  DollarSign,
  Car as CarIcon,
  Loader2,
  Gauge,
  Fuel,
  Settings,
  Calendar,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { Car, UpdateCarDto } from "@/types/car.types";
import { MonthlyPriceInput, MONTHS, MONTH_NAMES } from "@/types/price.type";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";
import { MonthlyPricingEditor } from "@/components/dashboard/MonthlyPricingEditor";
import Swal from "sweetalert2";
import { getCarById, updateCar } from "@/services/api/carService";
import { useTheme } from "@/context/ThemeContext";

const CarDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
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
    seasonCellBg: isDark ? 'rgba(232,25,44,0.10)' : '#eff6ff',
    seasonCellBorder: isDark ? 'rgba(232,25,44,0.30)' : '#bfdbfe',
    seasonCellText: isDark ? '#E8192C' : '#1d4ed8',
    baseCellBg: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
    baseCellBorder: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    baseCellText: isDark ? 'rgba(255,255,255,0.70)' : '#374151',
    featureChipBg: isDark ? 'rgba(232,25,44,0.12)' : '#eff6ff',
    featureChipText: isDark ? '#E8192C' : '#1d4ed8',
    addBtnBg: isDark ? '#E8192C' : '#1d4ed8',
    addBtnText: '#ffffff',
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

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateCarDto>({});
  const [monthlyPrices, setMonthlyPrices] = useState<MonthlyPriceInput[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const featureInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getCarById(parseInt(id));
        setCar(data);
        setFormData(data || {});
        if (data?.monthlyPrices) setMonthlyPrices(data.monthlyPrices);
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" || name === "seats" || name === "pricePerDay" || name === "lat" || name === "lng"
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
    if (car) {
      setFormData(car);
      setMonthlyPrices(car.monthlyPrices || []);
    }
    setNewImageFiles([]);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updatePayload: UpdateCarDto = {
        ...formData,
        monthlyPrices: monthlyPrices.length > 0 ? monthlyPrices : undefined,
      };
      const updatedCar = await updateCar(parseInt(id), updatePayload, newImageFiles);
      setCar(updatedCar);
      setFormData(updatedCar);
      setMonthlyPrices(updatedCar.monthlyPrices || []);
      setIsEditing(false);
      setNewImageFiles([]);
      Swal.fire({ icon: "success", title: t("cars.carDetails.success.title"), text: t("cars.carDetails.success.message") });
    } catch (error) {
      console.error("Error updating car:", error);
      Swal.fire({ icon: "error", title: t("cars.carDetails.error.title"), text: t("cars.carDetails.error.message") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: tk.pageBg, color: tk.pageText }}>
          <Loader2 className="animate-spin" size={48} style={{ color: '#E8192C' }} />
          <span style={{ marginLeft: 8, fontSize: 18 }}>{t("cars.carDetails.loading")}</span>
        </div>
    );
  }

  if (!car) {
    return (
      <div style={{ background: tk.pageBg, minHeight: '100vh', color: tk.pageText }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{t("cars.carDetails.notFound.title")}</h3>
            <p style={{ color: tk.mutedText, marginBottom: 32 }}>{t("cars.carDetails.notFound.message")}</p>
            <button
              onClick={() => navigate("/dashboard/carsList")}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: '#E8192C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              <ArrowLeft size={16} /> {t("cars.carDetails.notFound.backButton")}
            </button>
          </div>
        </div>
    );
  }

  return (
    <div style={{ background: tk.pageBg, minHeight: '100vh', color: tk.pageText, padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <button
                onClick={() => navigate("/dashboard/carsList")}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: tk.dimText, fontSize: 14 }}
              >
                <ArrowLeft size={16} /> Back to Cars
              </button>
              <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>
                {isEditing ? t("cars.carDetails.headers.edit") : t("cars.carDetails.headers.details")}
              </h1>
              <p style={{ color: tk.mutedText, fontSize: 16, marginTop: 4 }}>
                {isEditing ? t("cars.carDetails.headers.editSubtitle") : t("cars.carDetails.headers.detailsSubtitle")}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: 'transparent', border: `1px solid ${tk.ghostBtnBorder}`, color: tk.ghostBtnText, cursor: 'pointer', fontWeight: 500 }}
                  >
                    <X size={16} /> {t("cars.carDetails.buttons.cancel")}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: tk.primaryBtnBg, color: tk.primaryBtnText, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? <><Loader2 className="animate-spin" size={16} /> {t("cars.carDetails.buttons.saving")}</> : <><Save size={16} /> {t("cars.carDetails.buttons.saveChanges")}</>}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: tk.primaryBtnBg, color: tk.primaryBtnText, border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Edit size={16} /> {t("cars.carDetails.buttons.editCar")}
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
            {/* Left Column */}
            <div>
              {/* Image / Gallery */}
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
                {isEditing ? (
                  <div style={{ padding: 16 }}>
                    <ImageUpload
                      propertyType="Car"
                      disableUpload={true}
                      onImagesSelected={(files) => setNewImageFiles(files)}
                      selectedFiles={newImageFiles}
                      onRemoveFile={(index) => setNewImageFiles((prev) => prev.filter((_, i) => i !== index))}
                      existingImages={formData.imageUrls}
                      onRemoveExisting={(url) => setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls?.filter((img) => img !== url) }))}
                      maxImages={10}
                      isLoading={saving}
                    />
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {car.imageUrls && car.imageUrls.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4, height: 300 }}>
                        <div
                          style={{
                            backgroundImage: `url(${car.imageUrls[0]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            gridColumn: car.imageUrls.length === 1 ? '1 / span 4' : '1 / span 2',
                            gridRow: '1 / span 2',
                          }}
                        />
                        {car.imageUrls.slice(1, 5).map((url, idx) => (
                          <div key={idx} style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        ))}
                        {car.imageUrls.length > 5 && (
                          <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                            +{car.imageUrls.length - 5} photos
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ height: 256, background: tk.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.mutedText }}>
                        <div style={{ textAlign: 'center' }}>
                          <ImageIcon style={{ width: 48, height: 48, margin: '0 auto 8px', opacity: 0.5 }} />
                          <p>No images available</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 8 }}>{t("cars.carDetails.sections.status")}</p>
                {isEditing ? (
                  <select name="status" value={formData.status || "available"} onChange={handleChange} style={selectStyle}>
                    <option value="available" style={{ background: tk.optionBg }}>Available</option>
                    <option value="rented" style={{ background: tk.optionBg }}>Rented</option>
                    <option value="maintenance" style={{ background: tk.optionBg }}>Maintenance</option>
                  </select>
                ) : (
                  <span style={{
                    display: 'inline-block', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    background: car.status === 'available' ? '#10b981' : car.status === 'rented' ? '#3b82f6' : '#f59e0b',
                    color: '#ffffff',
                  }}>
                    {car.status}
                  </span>
                )}
              </div>

              {/* Availability Calendar */}
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 24 }}>
                <AvailabilityCalendar propertyId={parseInt(id!)} propertyType="car" />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Basic Information */}
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: tk.pageText }}>{t("cars.carDetails.sections.basicInfo")}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Name */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CarIcon size={14} style={{ color: '#E8192C' }} /> {t("cars.carDetails.fields.carName")}
                    </p>
                    {isEditing ? <input id="name" name="name" value={formData.name || ""} onChange={handleChange} style={{ ...inputStyle, fontSize: 16, fontWeight: 600 }} /> : <p style={{ fontSize: 16, fontWeight: 600, color: tk.pageText }}>{car.name}</p>}
                  </div>
                  {/* Brand */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14} style={{ color: '#f59e0b' }} /> {t("cars.carDetails.fields.brand")}
                    </p>
                    {isEditing ? (
                      <select name="brand" value={formData.brand || ""} onChange={handleChange} style={selectStyle}>
                        <option value="" disabled style={{ background: tk.optionBg }}>{t("cars.carDetails.fields.selectBrand")}</option>
                        {["Acura","Alfa Romeo","Aston Martin","Audi","Bentley","BMW","Buick","Cadillac","Chevrolet","Chrysler","Citroën","Dodge","Ferrari","Fiat","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Lamborghini","Land Rover","Lexus","Lincoln","Lotus","Maserati","Mazda","McLaren","Mercedes-Benz","Mini","Mitsubishi","Nissan","Peugeot","Porsche","Ram","Renault","Rolls-Royce","Saab","Seat","Skoda","Smart","Subaru","Suzuki","Tesla","Toyota","Volkswagen","Volvo","Other"].map(b => (
                          <option key={b} value={b} style={{ background: tk.optionBg }}>{b}</option>
                        ))}
                      </select>
                    ) : <p style={{ color: tk.dimText }}>{car.brand}</p>}
                  </div>
                  {/* Type */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Settings size={14} style={{ color: tk.mutedText }} /> {t("cars.carDetails.fields.type")}
                    </p>
                    {isEditing ? (
                      <select name="type" value={formData.type || ""} onChange={handleChange} style={selectStyle}>
                        {["Sedan","SUV","Sports"].map(t => <option key={t} value={t} style={{ background: tk.optionBg }}>{t}</option>)}
                      </select>
                    ) : <p style={{ color: tk.dimText }}>{car.type}</p>}
                  </div>
                  {/* Year */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} style={{ color: tk.mutedText }} /> {t("cars.carDetails.fields.year")}
                    </p>
                    {isEditing ? <input name="year" type="number" min="1900" max="2100" value={formData.year || 0} onChange={handleChange} style={inputStyle} /> : <p style={{ color: tk.dimText }}>{car.year}</p>}
                  </div>
                  {/* Transmission */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Settings size={14} style={{ color: tk.mutedText }} /> {t("cars.carDetails.fields.transmission")}
                    </p>
                    {isEditing ? (
                      <select name="transmission" value={formData.transmission || ""} onChange={handleChange} style={selectStyle}>
                        <option value="Manual" style={{ background: tk.optionBg }}>Manual</option>
                        <option value="Automatic" style={{ background: tk.optionBg }}>Automatic</option>
                      </select>
                    ) : <p style={{ color: tk.dimText }}>{car.transmission}</p>}
                  </div>
                  {/* Fuel Type */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Fuel size={14} style={{ color: tk.mutedText }} /> {t("cars.carDetails.fields.fuelType")}
                    </p>
                    {isEditing ? (
                      <select name="fuelType" value={formData.fuelType || ""} onChange={handleChange} style={selectStyle}>
                        {["Petrol","Diesel","Hybrid","Electric"].map(f => <option key={f} value={f} style={{ background: tk.optionBg }}>{f}</option>)}
                      </select>
                    ) : <p style={{ color: tk.dimText }}>{car.fuelType}</p>}
                  </div>
                  {/* Seats */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} style={{ color: tk.mutedText }} /> {t("cars.carDetails.fields.seats")}
                    </p>
                    {isEditing ? <input name="seats" type="number" min="1" max="20" value={formData.seats || 0} onChange={handleChange} style={inputStyle} /> : <p style={{ color: tk.dimText }}>{t("cars.carDetails.card.seats", { count: car.seats })}</p>}
                  </div>
                  {/* Base Price */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <DollarSign size={14} style={{ color: '#10b981' }} /> {t("cars.carDetails.fields.basePrice")}
                    </p>
                    {isEditing ? (
                      <>
                        <input name="pricePerDay" type="number" min="0" value={formData.pricePerDay || 0} onChange={handleChange} style={inputStyle} />
                        <p style={{ fontSize: 12, color: tk.mutedText, marginTop: 4 }}>{t("cars.carDetails.fields.priceHelp")}</p>
                      </>
                    ) : <p style={{ fontSize: 18, fontWeight: 700, color: tk.pageText }}>${car.pricePerDay}</p>}
                  </div>
                </div>
              </div>

              {/* Monthly Pricing */}
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: tk.pageText }}>{t("cars.carDetails.sections.monthlyPricing")}</h2>
                {isEditing ? (
                  <MonthlyPricingEditor prices={monthlyPrices} onChange={setMonthlyPrices} basePrice={formData.pricePerDay || 0} disabled={saving} />
                ) : (
                  <div>
                    {monthlyPrices && monthlyPrices.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                        {MONTHS.map((month) => {
                          const monthPrice = monthlyPrices.find((p) => p.month === month);
                          const price = monthPrice?.pricePerDay ?? car.pricePerDay;
                          const isDifferent = monthPrice && monthPrice.pricePerDay !== car.pricePerDay;
                          return (
                            <div key={month} style={{ padding: 12, borderRadius: 8, border: `1px solid ${isDifferent ? tk.seasonCellBorder : tk.baseCellBorder}`, background: isDifferent ? tk.seasonCellBg : tk.baseCellBg, textAlign: 'center' }}>
                              <div style={{ fontSize: 11, fontWeight: 500, color: tk.mutedText, marginBottom: 4 }}>{MONTH_NAMES[month]}</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: isDifferent ? tk.seasonCellText : tk.baseCellText }}>${price}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ color: tk.mutedText }}>{t("cars.carDetails.pricing.noSeasonal", { price: car.pricePerDay })}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Vehicle Details */}
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: tk.pageText }}>{t("cars.carDetails.sections.vehicleDetails")}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Color */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Palette size={14} style={{ color: '#E8192C' }} /> {t("cars.carDetails.fields.color")}
                    </p>
                    {isEditing ? <input name="color" value={formData.color || ""} onChange={handleChange} style={inputStyle} /> : <p style={{ color: tk.dimText }}>{car.color}</p>}
                  </div>
                  {/* Plate Number */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CarIcon size={14} style={{ color: '#E8192C' }} /> {t("cars.carDetails.fields.plateNumber")}
                    </p>
                    {isEditing ? <input name="plateNumber" value={formData.plateNumber || ""} onChange={handleChange} style={inputStyle} /> : <p style={{ color: tk.dimText }}>{car.plateNumber}</p>}
                  </div>
                  {/* Mileage */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Gauge size={14} style={{ color: '#E8192C' }} /> {t("cars.carDetails.fields.mileage")}
                    </p>
                    {isEditing ? <input name="mileage" type="number" min="0" max="999999" value={formData.mileage || ""} onChange={handleChange} style={inputStyle} /> : <p style={{ color: tk.dimText }}>{car.mileage}</p>}
                  </div>
                  {/* Pick Up Location */}
                  <div>
                    <p style={{ fontSize: 13, color: tk.labelText, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} style={{ color: '#E8192C' }} /> {t("cars.carDetails.fields.pickupLocation")}
                    </p>
                    {isEditing ? <input name="pickUpLocation" value={formData.pickUpLocation || ""} onChange={handleChange} style={inputStyle} /> : <p style={{ color: tk.dimText }}>{car.pickUpLocation}</p>}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: tk.pageText }}>{t("cars.carDetails.sections.features")}</h2>
                {isEditing ? (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {(formData.features || []).map((feature, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: tk.featureChipBg, color: tk.featureChipText, borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                          <span>{feature}</span>
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2, display: 'flex' }}>
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        ref={featureInputRef}
                        placeholder={t("cars.carDetails.fields.addFeature")}
                        style={{ ...inputStyle, flex: 1 }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            e.preventDefault();
                            const newFeature = e.currentTarget.value.trim();
                            setFormData((prev) => ({ ...prev, features: [...(prev.features || []), newFeature] }));
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const inputValue = featureInputRef.current?.value.trim();
                          if (inputValue) {
                            setFormData((prev) => ({ ...prev, features: [...(prev.features || []), inputValue] }));
                            if (featureInputRef.current) featureInputRef.current.value = "";
                          }
                        }}
                        style={{ padding: '8px 16px', background: tk.addBtnBg, color: tk.addBtnText, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {car.features && car.features.length > 0 ? (
                      car.features.map((feature, index) => (
                        <span key={index} style={{ padding: '4px 12px', background: tk.featureChipBg, color: tk.featureChipText, borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                          {feature}
                        </span>
                      ))
                    ) : (
                      <p style={{ color: tk.mutedText }}>{t("cars.carDetails.fields.noFeatures")}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Map */}
              {isEditing ? (
                <MapPicker lat={formData.lat} lng={formData.lng} onLocationSelect={handleLocationSelect} label={t("cars.carDetails.fields.mapLabel")} defaultCenter={[car.lat || 41.3275, car.lng || 19.8187]} defaultZoom={13} showCoordinates={true} />
              ) : (
                car.lat !== undefined && car.lng !== undefined && (
                  <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: tk.pageText }}>{t("cars.carDetails.sections.location")}</h2>
                    <MapPicker lat={car.lat} lng={car.lng} onLocationSelect={() => {}} label="" defaultCenter={[car.lat, car.lng]} defaultZoom={15} showCoordinates={true} />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CarDetails;
