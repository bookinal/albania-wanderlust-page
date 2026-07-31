import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

interface DestinationFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;

  location?: string[];
  selectedLocation?: string;
  onLocationChange?: (value: string) => void;

  searchPlaceholder: string;
  clearFiltersLabel: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;

  resultsLabel: string;

  background: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  accentSoft: string;
}

export function DestinationFilterBar({
  search,
  onSearchChange,
  location = [],
  selectedLocation = "",
  onLocationChange,
  searchPlaceholder,
  clearFiltersLabel,
  hasActiveFilters,
  onClearFilters,
  resultsLabel,
  background,
  borderColor,
  textColor,
  mutedColor,
  accentColor,
  accentSoft,
}: DestinationFilterBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setIsMobile(entry.contentRect.width < 640);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const selectStyle: React.CSSProperties = {
    height: "3rem",
    paddingLeft: "0.9rem",
    paddingRight: "2.25rem",
    borderRadius: "0.75rem",
    border: `1px solid ${borderColor}`,
    background,
    color: textColor,
    fontSize: "0.92rem",
    fontWeight: 500,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
    whiteSpace: "nowrap" as const,
    flex: "1 1 0",
    minWidth: 0,
  };

  const chevronSvg = (color: string) => (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        right: "0.7rem",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        width: "1rem",
        height: "1rem",
      }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const SelectWrapper = ({
    value,
    onChange,
    options,
    allLabel,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    allLabel: string;
  }) => {
    const isActive = value !== "";
    return (
      <div style={{ position: "relative", flex: "1 1 0", minWidth: 0 }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...selectStyle,
            width: "100%",
            borderColor: isActive ? accentColor : borderColor,
            background: isActive ? accentSoft : background,
            color: isActive ? accentColor : textColor,
          }}
        >
          <option value="">{allLabel}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {chevronSvg(isActive ? accentColor : mutedColor)}
      </div>
    );
  };

  const hasLocationSelect = location.length > 0 && !!onLocationChange;

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.65rem",
        padding: "0.65rem 0.85rem",
        borderRadius: "1.25rem",
        border: `1px solid ${borderColor}`,
        background,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          flexWrap: "nowrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 0 }}>
          <Search
            style={{
              position: "absolute",
              left: "0.9rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: mutedColor,
              width: "1rem",
              height: "1rem",
              pointerEvents: "none",
            }}
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              paddingLeft: "2.5rem",
              height: "3rem",
              borderColor,
              color: textColor,
              background,
              borderRadius: "0.75rem",
              width: "100%",
            }}
          />
        </div>

        {!isMobile && hasLocationSelect && (
          <SelectWrapper
            value={selectedLocation}
            onChange={onLocationChange}
            options={location}
            allLabel="All locations"
          />
        )}

        <span
          style={{
            color: mutedColor,
            fontSize: "0.85rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {resultsLabel}
        </span>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              flexShrink: 0,
              height: "3rem",
              padding: "0 1rem",
              borderRadius: "0.75rem",
              border: `1px solid ${borderColor}`,
              background: "transparent",
              color: textColor,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
              whiteSpace: "nowrap",
            }}
          >
            {clearFiltersLabel}
          </button>
        )}
      </div>

      {isMobile && hasLocationSelect && (
        <div
          style={{
            display: "flex",
            gap: "0.65rem",
            alignItems: "center",
          }}
        >
          <SelectWrapper
            value={selectedLocation}
            onChange={onLocationChange}
            options={location}
            allLabel="All locations"
          />
        </div>
      )}
    </div>
  );
}
