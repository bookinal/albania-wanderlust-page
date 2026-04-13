import { useState } from "react";
import { ChevronDown, RotateCcw, Filter, Calendar, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import {
  HotelFiltersInput,
  ApartmentFiltersInput,
  DestinationFiltersInput,
  SearchFiltersState,
} from "@/types/search.types";

interface FilterBarProps {
  filters: SearchFiltersState;
  onPropertyTypeChange: (type: "hotel" | "apartment" | "destination") => void;
  onHotelFiltersChange: (filters: Partial<HotelFiltersInput>) => void;
  onApartmentFiltersChange: (filters: Partial<ApartmentFiltersInput>) => void;
  onDestinationFiltersChange?: (filters: Partial<DestinationFiltersInput>) => void;
  onDateChange: (dates: {
    checkInDate?: string | null;
    checkOutDate?: string | null;
  }) => void;
  onGuestsChange: (guests: {
    adults?: number;
    children?: number;
    rooms?: number;
  }) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  loading: boolean;
  hideMapButton?: boolean;
  availableTypes?: Array<"hotel" | "apartment" | "destination">;
}

const AccSection = ({
  label,
  children,
  defaultOpen = false,
  isDark,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isDark: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      borderBottom: `1px solid ${isDark ? 'rgba(232,25,44,0.1)' : 'rgba(232,25,44,0.12)'}`,
      paddingBottom: 16,
      marginBottom: 16,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: open ? 12 : 0,
        }}
      >
        <span style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: '0.95rem',
          letterSpacing: '0.1em',
          color: isDark ? '#f0ece8' : '#111115',
          transition: 'color 0.3s',
        }}>
          {label}
        </span>
        <ChevronDown style={{
          width: 14,
          height: 14,
          color: 'rgba(232,25,44,0.6)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </button>
      {open && <div style={{ marginTop: 4 }}>{children}</div>}
    </div>
  );
};

export const FilterBar = ({
  filters,
  onPropertyTypeChange,
  onHotelFiltersChange,
  onApartmentFiltersChange,
  onDestinationFiltersChange,
  onDateChange,
  onGuestsChange,
  onResetFilters,
  onApplyFilters,
  loading,
  hideMapButton,
  availableTypes = ["hotel", "apartment"],
}: FilterBarProps) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Theme tokens
  const tk = {
    sidebarBg: isDark ? '#111115' : '#f8f6f3',
    sidebarBorder: isDark ? 'rgba(232,25,44,0.1)' : 'rgba(232,25,44,0.12)',
    headerText: isDark ? '#f0ece8' : '#111115',
    resetText: isDark ? 'rgba(240,236,232,0.4)' : 'rgba(17,17,21,0.4)',
    inputBg: isDark ? 'rgba(240,236,232,0.04)' : 'rgba(17,17,21,0.04)',
    inputBorder: isDark ? 'rgba(232,25,44,0.15)' : 'rgba(232,25,44,0.18)',
    inputColor: isDark ? '#f0ece8' : '#111115',
    selectOptionBg: isDark ? '#1c1c21' : '#f8f6f3',
    labelColor: '#E8192C',
    typeActiveBg: 'rgba(232,25,44,0.12)',
    typeActiveBorder: 'rgba(232,25,44,0.4)',
    typeActiveText: '#E8192C',
    typeInactiveBg: isDark ? 'rgba(240,236,232,0.04)' : 'rgba(17,17,21,0.04)',
    typeInactiveBorder: isDark ? 'rgba(240,236,232,0.1)' : 'rgba(17,17,21,0.12)',
    typeInactiveText: isDark ? 'rgba(240,236,232,0.5)' : 'rgba(17,17,21,0.5)',
    applyBtnBg: '#E8192C',
    applyBtnText: '#ffffff',
    applyBtnDisabledBg: isDark ? 'rgba(232,25,44,0.3)' : 'rgba(232,25,44,0.25)',
    checkboxBorder: isDark ? 'rgba(240,236,232,0.2)' : 'rgba(17,17,21,0.2)',
    checkboxCheckedText: isDark ? '#f0ece8' : '#111115',
    checkboxUncheckedText: isDark ? 'rgba(240,236,232,0.5)' : 'rgba(17,17,21,0.5)',
    infoText: 'rgba(232,25,44,0.7)',
    mobileBtnBg: isDark ? 'rgba(232,25,44,0.08)' : 'rgba(232,25,44,0.06)',
    mobileBtnBorder: isDark ? 'rgba(232,25,44,0.25)' : 'rgba(232,25,44,0.22)',
    mobileBtnText: isDark ? '#f0ece8' : '#111115',
    colorScheme: isDark ? 'dark' : 'light',
    minMaxLabel: isDark ? 'rgba(240,236,232,0.4)' : 'rgba(17,17,21,0.4)',
    priceText: isDark ? '#f0ece8' : '#111115',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: tk.inputBg,
    border: `1px solid ${tk.inputBorder}`,
    borderRadius: 3,
    padding: '8px 12px',
    color: tk.inputColor,
    fontFamily: 'Crimson Pro, Georgia, serif',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23E8192C' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Crimson Pro, Georgia, serif',
    fontSize: '0.68rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: tk.labelColor,
    display: 'block',
    marginBottom: 6,
  };

  const countActiveFilters = (): number => {
    let count = 0;
    const hf = filters.hotelFilters;
    const af = filters.apartmentFilters;
    const df = filters.destinationFilters;
    
    if (filters.propertyType !== "destination") {
      if (filters.checkInDate || filters.checkOutDate) count++;
      if (filters.adults || filters.children || filters.rooms) count++;
      
      if (filters.propertyType === "hotel") {
        if (hf.searchTerm) count++;
        if (hf.rating !== "all") count++;
        if (hf.status !== "all") count++;
        if (hf.rooms?.min || hf.rooms?.max) count++;
        if (hf.priceRange?.min !== 0 || hf.priceRange?.max !== 500) count++;
        if (hf.amenities && Object.values(hf.amenities).some((v) => v)) count++;
      } else {
        if (af.searchTerm) count++;
        if (af.rating !== "all") count++;
        if (af.status !== "all") count++;
        if (af.rooms?.min || af.rooms?.max) count++;
        if (af.beds?.min || af.beds?.max) count++;
        if (af.bathrooms?.min || af.bathrooms?.max) count++;
        if (af.priceRange?.min !== 0 || af.priceRange?.max !== 500) count++;
        if (af.amenities && af.amenities.length > 0) count++;
      }
    } else {
      if (df?.searchTerm) count++;
      if (df?.categories && df.categories.length > 0) count++;
    }
    
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  // Number input with clear button
  const NumInput = ({
    value,
    onChange,
    onClear,
    min = "0",
    placeholder = "",
  }: {
    value: number | undefined;
    onChange: (v: number) => void;
    onClear: () => void;
    min?: string;
    placeholder?: string;
  }) => (
    <div style={{ position: 'relative' }}>
      <input
        type="number"
        min={min}
        style={inputStyle}
        placeholder={placeholder}
        value={value || ""}
        onChange={e => onChange(e.target.value ? parseInt(e.target.value) : 0)}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
        onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
      />
      {!!value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: isDark ? 'rgba(240,236,232,0.35)' : 'rgba(17,17,21,0.35)',
            display: 'flex', padding: 2,
          }}
        >
          <X style={{ width: 13, height: 13 }} />
        </button>
      )}
    </div>
  );

  // Min/Max pair inputs
  const MinMaxPair = ({
    minVal,
    maxVal,
    onMinChange,
    onMaxChange,
  }: {
    minVal: number | undefined;
    maxVal: number | undefined;
    onMinChange: (v: number | undefined) => void;
    onMaxChange: (v: number | undefined) => void;
  }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <div>
        <label style={labelStyle}>{t("searchResults.filters.min")}</label>
        <input
          type="number"
          style={inputStyle}
          placeholder={t("searchResults.filters.min")}
          value={minVal || ""}
          onChange={e => onMinChange(e.target.value ? parseInt(e.target.value) : undefined)}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
        />
      </div>
      <div>
        <label style={labelStyle}>{t("searchResults.filters.max")}</label>
        <input
          type="number"
          style={inputStyle}
          placeholder={t("searchResults.filters.max")}
          value={maxVal || ""}
          onChange={e => onMaxChange(e.target.value ? parseInt(e.target.value) : undefined)}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
        />
      </div>
    </div>
  );

  // Custom checkbox row
  const CheckRow = ({
    checked,
    label,
    onChange,
  }: {
    checked: boolean;
    label: string;
    onChange: (v: boolean) => void;
  }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 16, height: 16,
          border: `1px solid ${checked ? '#E8192C' : tk.checkboxBorder}`,
          background: checked ? 'rgba(232,25,44,0.15)' : 'transparent',
          borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="#E8192C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{
        fontFamily: 'Crimson Pro, Georgia, serif',
        fontSize: '0.9rem',
        color: checked ? tk.checkboxCheckedText : tk.checkboxUncheckedText,
        transition: 'color 0.15s',
      }}>
        {label}
      </span>
    </label>
  );

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter style={{ width: 15, height: 15, color: '#E8192C' }} />
          <span style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '1.1rem',
            letterSpacing: '0.12em',
            color: tk.headerText,
            transition: 'color 0.3s',
          }}>
            {t("searchResults.filters.filters")}
          </span>
          {activeFiltersCount > 0 && (
            <span style={{
              background: '#E8192C', color: '#fff',
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: '0.7rem', borderRadius: '50%',
              width: 18, height: 18,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600,
            }}>
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              color: tk.resetText,
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: '0.8rem', letterSpacing: '0.07em',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E8192C')}
            onMouseLeave={e => (e.currentTarget.style.color = tk.resetText)}
          >
            <RotateCcw style={{ width: 11, height: 11 }} />
            {t("searchResults.filters.reset")}
          </button>
        )}
      </div>

      <div style={{ height: 1, background: 'linear-gradient(90deg, #E8192C, transparent)', marginBottom: 20 }} />

      {/* Property Type */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>{t("searchResults.filters.propertyType")}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {availableTypes.map((type) => {
            const active = filters.propertyType === type;
            return (
              <button
                key={type}
                onClick={() => onPropertyTypeChange(type)}
                style={{
                  flex: 1,
                  background: active ? tk.typeActiveBg : tk.typeInactiveBg,
                  border: `1px solid ${active ? tk.typeActiveBorder : tk.typeInactiveBorder}`,
                  color: active ? tk.typeActiveText : tk.typeInactiveText,
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  padding: '7px 4px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t(`searchResults.filters.${type}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <AccSection label={t("searchResults.filters.search")} defaultOpen isDark={isDark}>
        <input
          style={inputStyle}
          placeholder={t("searchResults.filters.searchPlaceholderProperties")}
          value={
            filters.propertyType === "hotel"
              ? filters.hotelFilters.searchTerm || ""
              : filters.propertyType === "apartment"
                ? filters.apartmentFilters.searchTerm || ""
                : filters.destinationFilters?.searchTerm || ""
          }
          onChange={e => {
            onHotelFiltersChange({ searchTerm: e.target.value });
            onApartmentFiltersChange({ searchTerm: e.target.value });
            onDestinationFiltersChange?.({ searchTerm: e.target.value });
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
        />
      </AccSection>

      {/* Stay Dates */}
      {filters.propertyType !== "destination" && (
        <AccSection
          label={t("searchResults.filters.stayDates")}
          defaultOpen={!!(filters.checkInDate || filters.checkOutDate)}
          isDark={isDark}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={labelStyle}>{t("searchResults.filters.checkInDate")}</label>
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: tk.colorScheme as any }}
                value={filters.checkInDate ? new Date(filters.checkInDate).toISOString().split("T")[0] : ""}
                onChange={e => onDateChange({ checkInDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
              />
            </div>
            <div>
              <label style={labelStyle}>{t("searchResults.filters.checkOutDate")}</label>
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: tk.colorScheme as any }}
                value={filters.checkOutDate ? new Date(filters.checkOutDate).toISOString().split("T")[0] : ""}
                min={filters.checkInDate ? new Date(filters.checkInDate).toISOString().split("T")[0] : undefined}
                onChange={e => onDateChange({ checkOutDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
              />
            </div>
            {(filters.checkInDate || filters.checkOutDate) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar style={{ width: 11, height: 11, color: tk.infoText }} />
                <span style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.82rem', color: tk.infoText }}>
                  {t("searchResults.filters.showingPropertiesForDates")}
                </span>
              </div>
            )}
          </div>
        </AccSection>
      )}

      {/* Guests */}
      {filters.propertyType !== "destination" && (
        <AccSection
          label={t("searchResults.filters.guests")}
          defaultOpen={!!(filters.adults || filters.children || filters.rooms)}
          isDark={isDark}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={labelStyle}>{t("searchResults.filters.adults")}</label>
              <NumInput
                value={filters.adults}
                min="1"
                onChange={v => {
                  onGuestsChange({ adults: v, children: filters.children, rooms: filters.rooms });
                  onApartmentFiltersChange({ beds: { min: v + (filters.children || 0), max: filters.apartmentFilters.beds?.max } });
                }}
                onClear={() => {
                  onGuestsChange({ adults: 0, children: filters.children, rooms: filters.rooms });
                  onApartmentFiltersChange({ beds: { min: filters.children || 0, max: filters.apartmentFilters.beds?.max } });
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>{t("searchResults.filters.children")}</label>
              <NumInput
                value={filters.children}
                min="0"
                onChange={v => {
                  onGuestsChange({ adults: filters.adults, children: v, rooms: filters.rooms });
                  onApartmentFiltersChange({ beds: { min: (filters.adults || 2) + v, max: filters.apartmentFilters.beds?.max } });
                }}
                onClear={() => {
                  onGuestsChange({ adults: filters.adults, children: 0, rooms: filters.rooms });
                  onApartmentFiltersChange({ beds: { min: filters.adults || 2, max: filters.apartmentFilters.beds?.max } });
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>{t("searchResults.filters.rooms")}</label>
              <NumInput
                value={filters.rooms}
                min="1"
                onChange={v => {
                  onGuestsChange({ adults: filters.adults, children: filters.children, rooms: v });
                  onApartmentFiltersChange({ rooms: { min: v, max: filters.apartmentFilters.rooms?.max } });
                }}
                onClear={() => {
                  onGuestsChange({ adults: filters.adults, children: filters.children, rooms: 0 });
                  onApartmentFiltersChange({ rooms: { min: 0, max: filters.apartmentFilters.rooms?.max } });
                }}
              />
            </div>
            {(filters.adults || filters.children || filters.rooms) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Filter style={{ width: 11, height: 11, color: tk.infoText }} />
                <span style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.82rem', color: tk.infoText }}>
                  {t("searchResults.filters.filteringApartments", {
                    beds: (filters.adults || 2) + (filters.children || 0),
                    rooms: filters.rooms || 1,
                  })}
                </span>
              </div>
            ) : null}
          </div>
        </AccSection>
      )}

      {/* Destination Categories */}
      {filters.propertyType === "destination" && (
        <AccSection label={t("searchResults.filters.categories", "Categories")} defaultOpen isDark={isDark}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { id: "Adventure", label: t("searchResults.filters.catAdventure", "Adventure") },
              { id: "Historic", label: t("searchResults.filters.catHistoric", "Historic") },
              { id: "Beach", label: t("searchResults.filters.catBeach", "Beach") },
            ].map(cat => (
              <CheckRow
                key={cat.id}
                checked={filters.destinationFilters?.categories?.includes(cat.id) || false}
                label={cat.label}
                onChange={checked => {
                  const current = filters.destinationFilters?.categories || [];
                  const next = checked 
                    ? [...current, cat.id] 
                    : current.filter(c => c !== cat.id);
                  onDestinationFiltersChange?.({ categories: next });
                }}
              />
            ))}
          </div>
        </AccSection>
      )}

      {/* Price Range */}
      {filters.propertyType !== "destination" && (
        <AccSection label={t("searchResults.filters.priceRange")} defaultOpen isDark={isDark}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '1rem', color: tk.priceText, letterSpacing: '0.05em' }}>
              €{filters.propertyType === "hotel" ? (filters.hotelFilters.priceRange?.min || 0) : (filters.apartmentFilters.priceRange?.min || 0)}
            </span>
            <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '1rem', color: '#E8192C', letterSpacing: '0.05em' }}>
              €{filters.propertyType === "hotel" ? (filters.hotelFilters.priceRange?.max || 500) : (filters.apartmentFilters.priceRange?.max || 500)}
            </span>
          </div>
          <Slider
            min={0}
            max={500}
            step={10}
            value={filters.propertyType === "hotel" 
              ? [filters.hotelFilters.priceRange?.min || 0, filters.hotelFilters.priceRange?.max || 500] 
              : [filters.apartmentFilters.priceRange?.min || 0, filters.apartmentFilters.priceRange?.max || 500]
            }
            onValueChange={value => {
              onHotelFiltersChange({ priceRange: { min: value[0], max: value[1] } });
              onApartmentFiltersChange({ priceRange: { min: value[0], max: value[1] } });
            }}
            className="py-1"
          />
          <p style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.78rem', color: isDark ? 'rgba(240,236,232,0.3)' : 'rgba(17,17,21,0.35)', marginTop: 8 }}>
            {filters.propertyType === "hotel"
              ? t("searchResults.filters.perNight")
              : t("searchResults.filters.perDay")}
          </p>
        </AccSection>
      )}

      {/* Rating */}
      {filters.propertyType !== "destination" && (
        <AccSection label={t("searchResults.filters.rating")} isDark={isDark}>
          <select
            style={selectStyle}
            value={filters.propertyType === "hotel" ? filters.hotelFilters.rating || "all" : filters.apartmentFilters.rating || "all"}
            onChange={e => {
              const val = e.target.value as any;
              onHotelFiltersChange({ rating: val });
              onApartmentFiltersChange({ rating: val });
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
          >
            <option value="all" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.allRatings")}</option>
            <option value="3+" style={{ background: tk.selectOptionBg }}>3+</option>
            <option value="3.5+" style={{ background: tk.selectOptionBg }}>3.5+</option>
            <option value="4+" style={{ background: tk.selectOptionBg }}>4+</option>
            <option value="4.5+" style={{ background: tk.selectOptionBg }}>4.5+</option>
          </select>
        </AccSection>
      )}

      {/* Availability */}
      {filters.propertyType !== "destination" && (
        <AccSection label={t("searchResults.filters.availability")} isDark={isDark}>
          <select
            style={selectStyle}
            value={filters.propertyType === "hotel" ? filters.hotelFilters.status || "all" : filters.apartmentFilters.status || "all"}
            onChange={e => {
              const val = e.target.value as any;
              if (filters.propertyType === "hotel") onHotelFiltersChange({ status: val });
              else onApartmentFiltersChange({ status: val });
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(232,25,44,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
          >
            <option value="all" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.allStatus")}</option>
            {filters.propertyType === "hotel" ? (
              <>
                <option value="active" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.active")}</option>
                <option value="maintenance" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.maintenance")}</option>
              </>
            ) : (
              <>
                <option value="available" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.available")}</option>
                <option value="rented" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.rented")}</option>
                <option value="maintenance" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.maintenance")}</option>
              </>
            )}
          </select>
        </AccSection>
      )}

      {/* Hotel Rooms */}
      {filters.propertyType === "hotel" && (
        <AccSection label={t("searchResults.filters.rooms")} isDark={isDark}>
          <MinMaxPair
            minVal={filters.hotelFilters.rooms?.min}
            maxVal={filters.hotelFilters.rooms?.max}
            onMinChange={v => onHotelFiltersChange({ rooms: { min: v, max: filters.hotelFilters.rooms?.max } })}
            onMaxChange={v => onHotelFiltersChange({ rooms: { min: filters.hotelFilters.rooms?.min, max: v } })}
          />
        </AccSection>
      )}

      {/* Hotel Amenities */}
      {filters.propertyType === "hotel" && (
        <AccSection label={t("searchResults.filters.amenities")} isDark={isDark}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { id: "wifi", label: t("searchResults.filters.amenityWifi") },
              { id: "parking", label: t("searchResults.filters.amenityParking") },
              { id: "pool", label: t("searchResults.filters.amenityPool") },
              { id: "gym", label: t("searchResults.filters.amenityGym") },
              { id: "spa", label: t("searchResults.filters.amenitySpa") },
              { id: "restaurant", label: t("searchResults.filters.amenityRestaurant") },
              { id: "bar", label: t("searchResults.filters.amenityBar") },
            ].map(amenity => (
              <CheckRow
                key={amenity.id}
                checked={filters.hotelFilters.amenities?.[amenity.id as keyof typeof filters.hotelFilters.amenities] || false}
                label={amenity.label}
                onChange={checked => onHotelFiltersChange({ amenities: { ...filters.hotelFilters.amenities, [amenity.id]: checked } })}
              />
            ))}
          </div>
        </AccSection>
      )}

      {/* Apartment Rooms */}
      {filters.propertyType === "apartment" && (
        <AccSection label={t("searchResults.filters.rooms")} isDark={isDark}>
          <MinMaxPair
            minVal={filters.apartmentFilters.rooms?.min || filters.rooms}
            maxVal={filters.apartmentFilters.rooms?.max}
            onMinChange={v => onApartmentFiltersChange({ rooms: { min: v, max: filters.apartmentFilters.rooms?.max } })}
            onMaxChange={v => onApartmentFiltersChange({ rooms: { min: filters.apartmentFilters.rooms?.min, max: v } })}
          />
        </AccSection>
      )}

      {/* Apartment Beds */}
      {filters.propertyType === "apartment" && (
        <AccSection label={t("searchResults.filters.beds")} isDark={isDark}>
          <MinMaxPair
            minVal={filters.apartmentFilters.beds?.min}
            maxVal={filters.apartmentFilters.beds?.max}
            onMinChange={v => onApartmentFiltersChange({ beds: { min: v, max: filters.apartmentFilters.beds?.max } })}
            onMaxChange={v => onApartmentFiltersChange({ beds: { min: filters.apartmentFilters.beds?.min, max: v } })}
          />
        </AccSection>
      )}

      {/* Apartment Bathrooms */}
      {filters.propertyType === "apartment" && (
        <AccSection label={t("searchResults.filters.bathrooms")} isDark={isDark}>
          <MinMaxPair
            minVal={filters.apartmentFilters.bathrooms?.min}
            maxVal={filters.apartmentFilters.bathrooms?.max}
            onMinChange={v => onApartmentFiltersChange({ bathrooms: { min: v, max: filters.apartmentFilters.bathrooms?.max } })}
            onMaxChange={v => onApartmentFiltersChange({ bathrooms: { min: filters.apartmentFilters.bathrooms?.min, max: v } })}
          />
        </AccSection>
      )}

      {/* Apply Button */}
      <div style={{ paddingTop: 4 }}>
        <button
          onClick={onApplyFilters}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? tk.applyBtnDisabledBg : tk.applyBtnBg,
            border: 'none',
            color: tk.applyBtnText,
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '1rem',
            letterSpacing: '0.12em',
            padding: '11px 0',
            borderRadius: 3,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, opacity 0.2s',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#c01020'; }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = tk.applyBtnBg; }}
        >
          {loading ? t("searchResults.filters.searching") : t("searchResults.filters.applySearch")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: tk.mobileBtnBg,
            border: `1px solid ${tk.mobileBtnBorder}`,
            borderRadius: 3,
            padding: '8px 16px',
            color: tk.mobileBtnText,
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '0.95rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.3s',
          }}
        >
          <Filter style={{ width: 14, height: 14, color: '#E8192C' }} />
          {t("searchResults.filters.filters")}
          {activeFiltersCount > 0 && (
            <span style={{
              background: '#E8192C', color: '#fff',
              fontSize: '0.7rem', borderRadius: '50%',
              width: 18, height: 18,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          width: '100%',
          flexShrink: 0,
          background: tk.sidebarBg,
          border: `1px solid ${tk.sidebarBorder}`,
          borderRadius: 6,
          padding: '20px 18px',
          alignSelf: 'flex-start',
          position: 'sticky',
          top: 24,
          maxHeight: 'calc(100vh - 88px)',
          overflowY: 'auto',
          transition: 'background 0.3s, border-color 0.3s',
        }}
        className={`${isOpen ? 'block' : 'hidden'} lg:block alb-filter-scrollbar`}
      >
        <style>{`
          .alb-filter-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .alb-filter-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .alb-filter-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
            border-radius: 4px;
          }
          .alb-filter-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'};
          }
        `}</style>
        {sidebarContent}
      </aside>
    </>
  );
};

export default FilterBar;
