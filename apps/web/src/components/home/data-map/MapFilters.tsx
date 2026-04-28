import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "../homeTheme";

interface MapFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onReset: () => void;
  selectedCategories?: string[];
  onCategoriesChange?: (categories: string[]) => void;
}

const PROPERTY_TYPES = [
  { id: "hotel", label: "Hotels" },
  { id: "apartment", label: "Apartments" },
  { id: "destination", label: "Destinations" },
];

const DESTINATION_CATEGORIES = [
  { id: "Adventure", label: "Adventure" },
  { id: "Historic", label: "Historic" },
  { id: "Beach", label: "Beach" },
];

export function MapFilters({
  selectedTypes,
  onTypesChange,
  priceRange,
  onPriceRangeChange,
  onReset,
  selectedCategories = [],
  onCategoriesChange,
}: MapFiltersProps) {
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      onTypesChange([...selectedTypes, typeId]);
    } else {
      onTypesChange(selectedTypes.filter((t) => t !== typeId));
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (!onCategoriesChange) return;
    if (checked) {
      onCategoriesChange([...selectedCategories, categoryId]);
    } else {
      onCategoriesChange(selectedCategories.filter((c) => c !== categoryId));
    }
  };

  const isDestinationSelected = selectedTypes.includes("destination");

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="border-b pb-4" style={{ borderColor: tk.dividerColor }}>
         <h2 className="text-xl font-semibold" style={{ color: tk.textMain }}>
           Filter Properties
         </h2>
         <p className="text-sm mt-1" style={{ color: tk.textMuted }}>Customize your map view</p>
      </div>

      {/* Property Types */}
      <div>
        <h4 className="font-medium mb-2">Property Types</h4>
        <div className="flex flex-wrap gap-4">
          {PROPERTY_TYPES.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={(checked) =>
                  handleTypeChange(type.id, checked as boolean)
                }
              />
              <label
                htmlFor={type.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Destination Categories Sub-filter */}
      {isDestinationSelected && onCategoriesChange && (
        <div className="pl-4 border-l-2" style={{ borderColor: tk.brandBorder }}>
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="flex items-center gap-1 font-medium mb-2 text-sm"
            style={{ color: tk.brand }}
          >
            {showCategoryFilter ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Destination Categories
          </button>
          {showCategoryFilter && (
            <div className="flex flex-wrap gap-3 ml-1">
              {DESTINATION_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-2">
          Price Range: €{priceRange[0]} - €{priceRange[1]}
        </h4>
        <Slider
          value={priceRange}
          onValueChange={(value) =>
            onPriceRangeChange(value as [number, number])
          }
          max={500}
          min={0}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: tk.textMuted }}>
          <span>€0</span>
          <span>€500+</span>
        </div>
      </div>

      {/* Reset Button */}
      <div>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
