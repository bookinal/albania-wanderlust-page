import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DestinationFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  allCategoriesLabel: string;
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
  categories,
  selectedCategory,
  onCategoryChange,
  allCategoriesLabel,
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
  const filterButtonStyle = (active: boolean) => ({
    padding: "0.72rem 1rem",
    borderRadius: "9999px",
    border: `1px solid ${active ? accentColor : borderColor}`,
    background: active ? accentSoft : background,
    color: active ? accentColor : textColor,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.92rem",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        padding: "1rem",
        borderRadius: "1.25rem",
        border: `1px solid ${borderColor}`,
        background,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          <Search
            className="w-4 h-4"
            style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: mutedColor }}
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            style={{ paddingLeft: "2.5rem", height: "3rem", borderColor, color: textColor, background }}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              padding: "0.78rem 1rem",
              borderRadius: "0.9rem",
              border: `1px solid ${borderColor}`,
              background: "transparent",
              color: textColor,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {clearFiltersLabel}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ color: mutedColor, fontSize: "0.92rem", fontWeight: 600 }}>{resultsLabel}</div>
        <div style={{ display: "flex", gap: "0.65rem", overflowX: "auto", paddingBottom: "0.15rem" }}>
          <button
            onClick={() => onCategoryChange("")}
            style={filterButtonStyle(selectedCategory === "")}
          >
            {allCategoriesLabel}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              style={filterButtonStyle(selectedCategory === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
