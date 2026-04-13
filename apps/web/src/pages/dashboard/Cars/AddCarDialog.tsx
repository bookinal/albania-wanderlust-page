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
import { Plus, Loader2, Clock } from "lucide-react";
import { X } from "lucide-react";
import { CreateCarDto } from "@/types/car.types";
import { MonthlyPriceInput } from "@/types/price.type";
import { addCar } from "@/services/api/carService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { MonthlyPricingEditor } from "@/components/dashboard/MonthlyPricingEditor";
import { propertyRequestService } from "@/services/api/propertyRequest";
import { authService } from "@/services/api/authService";
import { useTheme } from "@/context/ThemeContext";

interface AddCarDialogProps {
  onCarAdded: (car: any) => void;
}

export const AddCarDialog: React.FC<AddCarDialogProps> = ({ onCarAdded }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const featureInputRef = React.useRef<HTMLInputElement>(null);
  const [monthlyPrices, setMonthlyPrices] = useState<MonthlyPriceInput[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "Sedan" as "Sedan" | "SUV" | "Sports",
    year: new Date().getFullYear(),
    transmission: "Manual" as "Manual" | "Automatic",
    fuelType: "Petrol" as "Petrol" | "Diesel" | "Hybrid" | "Electric",
    seats: 5,
    mileage: 0,
    pricePerDay: 10,
    status: "review" as "available" | "rented" | "maintenance" | "review",
    color: "",
    plateNumber: "",
    features: [] as string[],
    imageUrls: [] as string[],
    pickUpLocation: "Tirana International Airport",
    lat: 41.4167 as number | undefined,
    lng: 19.7125 as number | undefined,
  });

  const tk = {
    dialogBg: isDark ? '#111115' : '#ffffff',
    dialogText: isDark ? '#ffffff' : '#111115',
    labelText: isDark ? 'rgba(255,255,255,0.55)' : '#44403c',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#faf8f5',
    inputBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    inputText: isDark ? '#ffffff' : '#111115',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    optionBg: isDark ? '#1a1a1a' : '#ffffff',
    chipBg: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
    chipText: isDark ? 'rgba(255,255,255,0.70)' : '#374151',
    chipBorder: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    chipHoverBg: isDark ? 'rgba(232,25,44,0.12)' : '#dbeafe',
    chipHoverText: isDark ? '#E8192C' : '#1d4ed8',
    selectedChipBg: isDark ? 'rgba(232,25,44,0.12)' : '#dbeafe',
    selectedChipText: isDark ? '#E8192C' : '#1d4ed8',
    divider: isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de',
    ghostBtnBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    ghostBtnText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    successPendingBg: isDark ? 'rgba(234,179,8,0.10)' : '#fefce8',
    successPendingBorder: isDark ? 'rgba(234,179,8,0.25)' : '#fde047',
    successPendingText: isDark ? '#fde047' : '#854d0e',
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "seats" || name === "mileage" || name === "pricePerDay"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.brand || !formData.plateNumber || formData.pricePerDay <= 0) {
      alert(t("cars.addCarDialog.validation.requiredFields"));
      return;
    }
    if (formData.lat === undefined || formData.lng === undefined) {
      alert(t("cars.addCarDialog.validation.locationRequired"));
      return;
    }
    if (selectedImageFiles.length === 0) {
      alert(t("cars.addCarDialog.validation.imageRequired"));
      return;
    }
    setLoading(true);
    try {
      const providerId = await authService.getCurrentUserId();
      if (!providerId) throw new Error("User not authenticated");

      const carData: CreateCarDto = {
        name: formData.name,
        brand: formData.brand,
        type: formData.type,
        year: formData.year,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: formData.seats,
        mileage: formData.mileage,
        pricePerDay: formData.pricePerDay,
        status: "review",
        color: formData.color,
        plateNumber: formData.plateNumber,
        features: formData.features,
        imageUrls: formData.imageUrls,
        pickUpLocation: formData.pickUpLocation,
        lat: formData.lat,
        lng: formData.lng,
        monthlyPrices: monthlyPrices.length > 0 ? monthlyPrices : undefined,
      };

      const newCar = await addCar(carData, selectedImageFiles);
      await propertyRequestService.createRequest(
        providerId, newCar.id.toString(), "car",
        `New car listing: ${formData.brand} ${formData.name} (${formData.year})`,
      );
      onCarAdded(newCar);
      setSubmissionSuccess(true);
      setFormData({ name: "", brand: "", type: "Sedan", year: new Date().getFullYear(), transmission: "Manual", fuelType: "Petrol", seats: 5, mileage: 0, pricePerDay: 10, status: "review", color: "", plateNumber: "", features: [], imageUrls: [], pickUpLocation: "", lat: undefined, lng: undefined });
      setSelectedImageFiles([]);
      setMonthlyPrices([]);
    } catch (error) {
      console.error("Error adding car:", error);
      alert(t("cars.carDetails.error.message"));
    } finally {
      setLoading(false);
    }
  };

  const BRANDS = ["Acura","Alfa Romeo","Aston Martin","Audi","Bentley","BMW","Buick","Cadillac","Chevrolet","Chrysler","Citroën","Dodge","Ferrari","Fiat","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Lamborghini","Land Rover","Lexus","Lincoln","Lotus","Maserati","Mazda","McLaren","Mercedes-Benz","Mini","Mitsubishi","Nissan","Peugeot","Porsche","Ram","Renault","Rolls-Royce","Saab","Seat","Skoda","Smart","Subaru","Suzuki","Tesla","Toyota","Volkswagen","Volvo","Other"];
  const SUGGESTED_FEATURES = ["Air Conditioning","GPS Navigation","Bluetooth","USB Charging","Backup Camera","Cruise Control","Heated Seats","Leather Seats","Sunroof","Apple CarPlay","Android Auto","Parking Sensors","Keyless Entry","Push Start","ABS","Airbags","Child Seat","Roof Rack","4WD/AWD","Automatic Windows"];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setSubmissionSuccess(false); }}>
      <DialogTrigger asChild>
        <button
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: '#E8192C', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          <Plus size={18} /> {t("cars.addCarDialog.buttons.addCar")}
        </button>
      </DialogTrigger>
      <DialogContent style={{ background: tk.dialogBg, color: tk.dialogText, maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
        {submissionSuccess ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(234,179,8,0.15)' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Clock size={32} style={{ color: '#ca8a04' }} />
            </div>
            <DialogHeader>
              <DialogTitle style={{ fontSize: 22, fontWeight: 700, color: tk.dialogText, marginBottom: 8 }}>
                {t("cars.addCarDialog.successTitle")}
              </DialogTitle>
              <DialogDescription style={{ color: tk.mutedText, maxWidth: 380, margin: '0 auto' }}>
                {t("cars.addCarDialog.successMessage")}
              </DialogDescription>
            </DialogHeader>
            <div style={{ marginTop: 32, padding: 16, background: tk.successPendingBg, border: `1px solid ${tk.successPendingBorder}`, borderRadius: 8, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tk.successPendingText, fontWeight: 500 }}>
                <Clock size={18} /> {t("cars.addCarDialog.statusPending")}
              </div>
              <p style={{ fontSize: 13, color: isDark ? 'rgba(234,179,8,0.70)' : '#713f12', marginTop: 8 }}>{t("cars.addCarDialog.statusDescription")}</p>
            </div>
            <button
              onClick={() => { setOpen(false); setSubmissionSuccess(false); }}
              style={{ marginTop: 32, padding: '10px 24px', borderRadius: 8, background: '#E8192C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              {t("cars.addCarDialog.close")}
            </button>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle style={{ fontSize: 22, fontWeight: 700, color: '#E8192C' }}>
                {t("cars.addCarDialog.title")}
              </DialogTitle>
              <DialogDescription style={{ color: tk.mutedText }}>
                {t("cars.addCarDialog.subtitle")}
              </DialogDescription>
            </DialogHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Name */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.carName")} <span style={{ color: '#E8192C' }}>*</span></p>
                  <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Tesla Model 3" style={inputStyle} />
                </div>
                {/* Brand */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.brand")} <span style={{ color: '#E8192C' }}>*</span></p>
                  <select id="brand" name="brand" value={formData.brand} onChange={handleChange} style={selectStyle}>
                    <option value="" disabled style={{ background: tk.optionBg }}>{t("cars.carDetails.fields.selectBrand", "Select Brand")}</option>
                    {BRANDS.map(b => <option key={b} value={b} style={{ background: tk.optionBg }}>{b}</option>)}
                  </select>
                </div>
                {/* Type */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.type")}</p>
                  <select id="type" name="type" value={formData.type} onChange={handleChange} style={selectStyle}>
                    <option value="Sedan" style={{ background: tk.optionBg }}>Sedan</option>
                    <option value="SUV" style={{ background: tk.optionBg }}>SUV</option>
                    <option value="Sports" style={{ background: tk.optionBg }}>Sports</option>
                  </select>
                </div>
                {/* Year */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.year")}</p>
                  <input id="year" name="year" type="number" min="1900" max={new Date().getFullYear() + 1} value={formData.year} onChange={handleChange} placeholder="2024" style={inputStyle} />
                </div>
                {/* Transmission */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.transmission")}</p>
                  <select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} style={selectStyle}>
                    <option value="Manual" style={{ background: tk.optionBg }}>Manual</option>
                    <option value="Automatic" style={{ background: tk.optionBg }}>Automatic</option>
                  </select>
                </div>
                {/* Fuel Type */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.fuelType")}</p>
                  <select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange} style={selectStyle}>
                    {["Petrol","Diesel","Hybrid","Electric"].map(f => <option key={f} value={f} style={{ background: tk.optionBg }}>{f}</option>)}
                  </select>
                </div>
                {/* Seats */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.seats")}</p>
                  <input id="seats" name="seats" type="number" min="1" max="20" value={formData.seats} onChange={handleChange} placeholder="5" style={inputStyle} />
                </div>
                {/* Mileage */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.mileage")}</p>
                  <input id="mileage" name="mileage" type="number" min="0" value={formData.mileage} onChange={handleChange} placeholder="15000" style={inputStyle} />
                </div>
                {/* Price Per Day */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.basePrice")} <span style={{ color: '#E8192C' }}>*</span></p>
                  <input id="pricePerDay" name="pricePerDay" type="number" min="10" value={formData.pricePerDay} onChange={handleChange} placeholder="89" style={inputStyle} />
                  <p style={{ fontSize: 12, color: tk.mutedText, marginTop: 4 }}>{t("cars.addCarDialog.form.priceHelp")}</p>
                </div>
                {/* Status */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.status")}</p>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} style={selectStyle}>
                    <option value="available" style={{ background: tk.optionBg }}>Available</option>
                    <option value="rented" style={{ background: tk.optionBg }}>Rented</option>
                    <option value="maintenance" style={{ background: tk.optionBg }}>Maintenance</option>
                  </select>
                </div>
                {/* Color */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.color")}</p>
                  <input id="color" name="color" value={formData.color} onChange={handleChange} placeholder="Black" style={inputStyle} />
                </div>
                {/* Plate Number */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.plateNumber")} <span style={{ color: '#E8192C' }}>*</span></p>
                  <input id="plateNumber" name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="ABC-1234" style={inputStyle} />
                </div>
              </div>

              {/* Features */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 8 }}>{t("cars.addCarDialog.form.features")}</p>
                <p style={{ fontSize: 12, color: tk.mutedText, marginBottom: 8 }}>{t("cars.addCarDialog.form.suggestedFeatures")}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {SUGGESTED_FEATURES.filter(f => !formData.features.includes(f)).map(feature => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, features: [...prev.features, feature] }))}
                      style={{ padding: '3px 10px', fontSize: 12, background: tk.chipBg, color: tk.chipText, border: `1px solid ${tk.chipBorder}`, borderRadius: 20, cursor: 'pointer' }}
                    >
                      + {feature}
                    </button>
                  ))}
                </div>
                {formData.features.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: tk.mutedText, marginBottom: 6 }}>{t("cars.addCarDialog.form.selectedFeatures")}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {formData.features.map((feature, index) => (
                        <div key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: tk.selectedChipBg, color: tk.selectedChipText, borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                          <span>{feature}</span>
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 1 }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    ref={featureInputRef}
                    placeholder={t("cars.addCarDialog.form.customFeature")}
                    style={{ ...inputStyle, flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const newFeature = e.currentTarget.value.trim();
                        setFormData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = featureInputRef.current?.value.trim();
                      if (v) {
                        setFormData(prev => ({ ...prev, features: [...prev.features, v] }));
                        if (featureInputRef.current) featureInputRef.current.value = "";
                      }
                    }}
                    style={{ padding: '8px 16px', background: '#E8192C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                  >
                    {t("cars.addCarDialog.form.add")}
                  </button>
                </div>
              </div>

              {/* Monthly Pricing */}
              <div style={{ borderTop: `1px solid ${tk.divider}`, paddingTop: 24 }}>
                <MonthlyPricingEditor prices={monthlyPrices} onChange={setMonthlyPrices} basePrice={formData.pricePerDay} disabled={loading} />
              </div>

              {/* Image Upload */}
              <ImageUpload propertyType="Car" onImagesSelected={(files) => setSelectedImageFiles(files)} selectedFiles={selectedImageFiles} onRemoveFile={(index) => setSelectedImageFiles(prev => prev.filter((_, i) => i !== index))} maxImages={10} isLoading={loading} />

              {/* Pick Up Location */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: tk.labelText, marginBottom: 6 }}>{t("cars.addCarDialog.form.pickupLocation")}</p>
                <input id="pickUpLocation" name="pickUpLocation" value={formData.pickUpLocation} onChange={handleChange} placeholder="Tirana Airport, Albania" style={inputStyle} />
              </div>

              {/* Map */}
              <MapPicker lat={formData.lat} lng={formData.lng} onLocationSelect={handleLocationSelect} label={t("cars.addCarDialog.form.mapLabel")} defaultCenter={[41.327953, 19.819025]} defaultZoom={8} showCoordinates={true} />
            </div>

            <DialogFooter style={{ marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                style={{ padding: '10px 18px', borderRadius: 8, background: 'transparent', border: `1px solid ${tk.ghostBtnBorder}`, color: tk.ghostBtnText, cursor: 'pointer', fontWeight: 500 }}
              >
                {t("cars.addCarDialog.buttons.cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, background: '#E8192C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <><Loader2 className="animate-spin" size={15} /> {t("cars.addCarDialog.adding")}</> : <><Plus size={15} /> {t("cars.addCarDialog.submitButton")}</>}
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
