import { useState } from "react";
import { Filter, RotateCcw, Calendar, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CarFilters } from "@/types/car.types";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getSearchResultsThemeTokens } from "./searchResultsTheme";

export interface CarFilterState extends CarFilters {
  priceRange?: { min: number; max: number };
  features?: string[];
  seats?: number;
  pickupDate?: Date | null;
  returnDate?: Date | null;
}

interface CarFilterBarProps {
  filters: CarFilterState;
  onFilterChange: (filters: Partial<CarFilterState>) => void;
  onResetFilters: () => void;
  availableFeatures: string[];
  featuresLoading?: boolean;
}

const AccSection = ({
  label,
  children,
  defaultOpen = false,
  headerColor,
  dividerColor,
  iconColor,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerColor: string;
  dividerColor: string;
  iconColor: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      borderBottom: `1px solid ${dividerColor}`,
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
          color: headerColor,
        }}>
          {label}
        </span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: iconColor,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
};

export const CarFilterBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableFeatures,
  featuresLoading = false,
}: CarFilterBarProps) => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const themeTk = getSearchResultsThemeTokens({ isDark, isBlue });

  // Theme tokens
  const tk = {
    sidebarBg: themeTk.sidebarBg,
    sidebarBorder: themeTk.sidebarBorder,
    headerText: themeTk.headerText,
    resetText: themeTk.resetText,
    labelColor: themeTk.labelColor,
    inputBg: themeTk.inputBg,
    inputBorder: themeTk.inputBorder,
    inputColor: themeTk.inputColor,
    selectOptionBg: themeTk.selectOptionBg,
    priceMinText: themeTk.priceText,
    featureText: themeTk.checkboxUncheckedText,
    featureCheckedText: themeTk.checkboxCheckedText,
    loadingText: themeTk.minMaxLabel,
    mobileBtnBg: themeTk.mobileBtnBg,
    mobileBtnBorder: themeTk.mobileBtnBorder,
    mobileBtnText: themeTk.mobileBtnText,
    colorScheme: themeTk.colorScheme,
    focusBorder: themeTk.brandBorder,
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
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(themeTk.brand)}' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
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
    marginBottom: 8,
  };

  const countActiveFilters = (): number => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.transmission && filters.transmission !== "all") count++;
    if (filters.fuelType && filters.fuelType !== "all") count++;
    if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000)) count++;
    if (filters.features && filters.features.length > 0) count++;
    if (filters.seats && filters.seats > 0) count++;
    if (filters.pickupDate || filters.returnDate) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter style={{ width: 15, height: 15, color: themeTk.brand }} />
          <span style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '1.1rem',
            letterSpacing: '0.12em',
            color: tk.headerText,
          }}>
            {t("searchResults.filters.filters")}
          </span>
          {activeFiltersCount > 0 && (
            <span style={{
              background: themeTk.brand,
              color: '#fff',
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: '0.7rem',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: tk.resetText,
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: '0.8rem',
              letterSpacing: '0.07em',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = themeTk.brand)}
            onMouseLeave={e => (e.currentTarget.style.color = tk.resetText)}
          >
            <RotateCcw style={{ width: 11, height: 11 }} />
            {t("searchResults.filters.reset")}
          </button>
        )}
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, ${themeTk.brand}, transparent)`, marginBottom: 20 }} />

      {/* Search */}
      <AccSection label={t("searchResults.filters.search")} defaultOpen headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        <label style={labelStyle}>{t("searchResults.filters.searchPlaceholderCars")}</label>
        <input
          style={inputStyle}
          placeholder={t("searchResults.filters.searchPlaceholderCars")}
          value={filters.searchTerm || ""}
          onChange={e => onFilterChange({ searchTerm: e.target.value })}
          onFocus={e => (e.currentTarget.style.borderColor = tk.focusBorder)}
          onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
        />
      </AccSection>

      {/* Dates */}
      <AccSection label={t("searchResults.filters.rentalDates")} defaultOpen={!!(filters.pickupDate || filters.returnDate)} headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={labelStyle}>{t("searchResults.filters.pickupDate")}</label>
            <input
              type="date"
              style={{ ...inputStyle, colorScheme: tk.colorScheme as any }}
              value={filters.pickupDate ? filters.pickupDate.toISOString().split("T")[0] : ""}
              onChange={e => onFilterChange({ pickupDate: e.target.value ? new Date(e.target.value) : null })}
              onFocus={e => (e.currentTarget.style.borderColor = tk.focusBorder)}
              onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t("searchResults.filters.returnDate")}</label>
            <input
              type="date"
              style={{ ...inputStyle, colorScheme: tk.colorScheme as any }}
              value={filters.returnDate ? filters.returnDate.toISOString().split("T")[0] : ""}
              min={filters.pickupDate ? filters.pickupDate.toISOString().split("T")[0] : undefined}
              onChange={e => onFilterChange({ returnDate: e.target.value ? new Date(e.target.value) : null })}
              onFocus={e => (e.currentTarget.style.borderColor = tk.focusBorder)}
              onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
            />
          </div>
          {(filters.pickupDate || filters.returnDate) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar style={{ width: 11, height: 11, color: themeTk.infoText }} />
              <span style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.82rem', color: themeTk.infoText }}>
                {t("searchResults.filters.showingCarsForDates")}
              </span>
            </div>
          )}
        </div>
      </AccSection>

      {/* Price Range */}
      <AccSection label={t("searchResults.filters.dailyPriceRange")} defaultOpen headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '1rem', color: tk.priceMinText, letterSpacing: '0.05em' }}>
            €{filters.priceRange?.min || 0}
          </span>
          <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '1rem', color: themeTk.brand, letterSpacing: '0.05em' }}>
            €{filters.priceRange?.max || 1000}
          </span>
        </div>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={[filters.priceRange?.min || 0, filters.priceRange?.max || 1000]}
          onValueChange={value => onFilterChange({ priceRange: { min: value[0], max: value[1] } })}
          className="py-1"
        />
      </AccSection>

      {/* Car Type */}
      <AccSection label={t("searchResults.filters.carType")} headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        <div style={{ position: 'relative' }}>
          <select
            style={selectStyle}
            value={filters.type || "all"}
            onChange={e => onFilterChange({ type: e.target.value as any })}
            onFocus={e => (e.currentTarget.style.borderColor = tk.focusBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
          >
            <option value="all" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.allTypes")}</option>
            <option value="Sedan" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.sedan")}</option>
            <option value="SUV" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.suv")}</option>
            <option value="Sports" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.sports")}</option>
          </select>
        </div>
      </AccSection>

      {/* Transmission */}
      <AccSection label={t("searchResults.filters.transmission")} headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        <select
          style={selectStyle}
          value={filters.transmission || "all"}
          onChange={e => onFilterChange({ transmission: e.target.value as any })}
          onFocus={e => (e.currentTarget.style.borderColor = tk.focusBorder)}
          onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
        >
          <option value="all" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.any")}</option>
          <option value="Automatic" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.automatic")}</option>
          <option value="Manual" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.manual")}</option>
        </select>
      </AccSection>

      {/* Fuel Type */}
      <AccSection label={t("searchResults.filters.fuelType")} headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        <select
          style={selectStyle}
          value={filters.fuelType || "all"}
          onChange={e => onFilterChange({ fuelType: e.target.value as any })}
          onFocus={e => (e.currentTarget.style.borderColor = tk.focusBorder)}
          onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
        >
          <option value="all" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.anyFuel")}</option>
          <option value="Petrol" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.petrol")}</option>
          <option value="Diesel" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.diesel")}</option>
          <option value="Hybrid" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.hybrid")}</option>
          <option value="Electric" style={{ background: tk.selectOptionBg }}>{t("searchResults.filters.electric")}</option>
        </select>
      </AccSection>

      {/* Seats */}
      <AccSection label={t("searchResults.filters.minSeats")} headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        <input
          type="number"
          min="1"
          max="9"
          style={inputStyle}
          placeholder={t("searchResults.filters.seatsPlaceholder")}
          value={filters.seats || ""}
          onChange={e => onFilterChange({ seats: e.target.value ? parseInt(e.target.value) : undefined })}
          onFocus={e => (e.currentTarget.style.borderColor = tk.focusBorder)}
          onBlur={e => (e.currentTarget.style.borderColor = tk.inputBorder)}
        />
      </AccSection>

      {/* Features */}
      <AccSection label={t("searchResults.filters.features")} headerColor={tk.headerText} dividerColor={tk.sidebarBorder} iconColor={themeTk.brand}>
        {featuresLoading ? (
          <span style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.9rem', color: tk.loadingText }}>
            {t("searchResults.filters.loadingFeatures")}
          </span>
        ) : availableFeatures.length === 0 ? (
          <span style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.9rem', color: tk.loadingText }}>
            {t("searchResults.filters.noFeatures")}
          </span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
            {availableFeatures.map(feature => {
              const checked = filters.features?.includes(feature) || false;
              return (
                <label
                  key={feature}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    onClick={() => {
                      const current = filters.features || [];
                      const next = checked
                        ? current.filter(f => f !== feature)
                        : [...current, feature];
                      onFilterChange({ features: next });
                    }}
                    style={{
                      width: 16,
                      height: 16,
                      border: `1px solid ${checked ? themeTk.brand : themeTk.checkboxBorder}`,
                      background: checked ? themeTk.brandSoftStrong : 'transparent',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {checked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke={themeTk.brand} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily: 'Crimson Pro, Georgia, serif',
                    fontSize: '0.9rem',
                    color: checked ? tk.featureCheckedText : tk.featureText,
                    transition: 'color 0.15s',
                  }}>
                    {feature}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </AccSection>
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
          }}
        >
          <Filter style={{ width: 14, height: 14, color: themeTk.brand }} />
          {t("searchResults.filters.filters")}
          {activeFiltersCount > 0 && (
            <span style={{
              background: themeTk.brand,
              color: '#fff',
              fontSize: '0.7rem',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          width: 260,
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
          overflowX: 'hidden',
          transition: 'background 0.3s, border-color 0.3s',
        }}
        className={`${isOpen ? 'block' : 'hidden'} lg:block`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
