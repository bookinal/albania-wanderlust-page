import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
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
  selectedSubcategories?: string[];
  onSubcategoriesChange?: (subcategories: string[]) => void;
}

const PROPERTY_TYPES = [
  { id: "hotel", label: "Hotels" },
  { id: "apartment", label: "Apartments" },
  { id: "destination", label: "Destinations" },
];

/**
 * Hierarchical category → subcategory mapping for destination filtering.
 * Selecting a category auto-selects / deselects all its subcategories.
 */
const DESTINATION_CATEGORY_TREE = [
  {
    id: "Nature",
    label: "Nature",
    emoji: "🌿",
    subcategories: [
      { id: "Mountains", label: "Mountains" },
      { id: "Lakes & canyons", label: "Lakes & Canyons" },
    ],
  },
  {
    id: "Eat Drink Dance",
    label: "Eat, Drink & Dance",
    emoji: "🍽️",
    subcategories: [
      { id: "Restaurants", label: "Restaurants" },
      { id: "Bars", label: "Bars" },
      { id: "Pubs", label: "Pubs" },
      { id: "Clubs", label: "Clubs" },
    ],
  },
  {
    id: "Historic",
    label: "Historic",
    emoji: "🏛️",
    subcategories: [
      { id: "Historical & archeological sites", label: "Historical & Archeological Sites" },
      { id: "Museums & galleries", label: "Museums & Galleries" },
      { id: "UNESCO sites", label: "UNESCO Sites" },
    ],
  },
  {
    id: "Adventure",
    label: "Adventure",
    emoji: "🧗",
    subcategories: [
      { id: "Breathtaking/Adventure", label: "Breathtaking / Adventure" },
      { id: "Sea activities", label: "Sea Activities" },
      { id: "On high altitude", label: "On High Altitude" },
    ],
  },
  {
    id: "Urban",
    label: "Urban",
    emoji: "🏙️",
    subcategories: [
      { id: "Top cities & villages", label: "Top Cities & Villages" },
    ],
  },
  {
    id: "Beach",
    label: "Beach",
    emoji: "🏖️",
    subcategories: [
      { id: "Sea activities", label: "Sea Activities" },
    ],
  },
];

export function MapFilters({
  selectedTypes,
  onTypesChange,
  priceRange,
  onPriceRangeChange,
  onReset,
  selectedCategories = [],
  onCategoriesChange,
  selectedSubcategories = [],
  onSubcategoriesChange,
}: MapFiltersProps) {
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      onTypesChange([...selectedTypes, typeId]);
    } else {
      onTypesChange(selectedTypes.filter((t) => t !== typeId));
    }
  };

  /** Toggle a top-level category and cascade to its subcategories */
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (!onCategoriesChange) return;

    const tree = DESTINATION_CATEGORY_TREE.find((c) => c.id === categoryId);
    const subIds = tree ? tree.subcategories.map((s) => s.id) : [];

    if (checked) {
      // Add category
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories
        : [...selectedCategories, categoryId];
      onCategoriesChange(newCategories);

      // Auto-select all its subcategories
      if (onSubcategoriesChange && subIds.length > 0) {
        const merged = Array.from(new Set([...selectedSubcategories, ...subIds]));
        onSubcategoriesChange(merged);
      }
    } else {
      // Remove category
      onCategoriesChange(selectedCategories.filter((c) => c !== categoryId));

      // Auto-deselect its subcategories (only those exclusively belonging to this category)
      if (onSubcategoriesChange && subIds.length > 0) {
        // Keep subcategories that are still needed by another selected category
        const remainingCategories = selectedCategories.filter((c) => c !== categoryId);
        const stillNeededSubs = new Set<string>();
        for (const remainCatId of remainingCategories) {
          const remainTree = DESTINATION_CATEGORY_TREE.find((c) => c.id === remainCatId);
          remainTree?.subcategories.forEach((s) => stillNeededSubs.add(s.id));
        }
        onSubcategoriesChange(selectedSubcategories.filter((s) => stillNeededSubs.has(s)));
      }
    }
  };

  /** Toggle a single subcategory independently */
  const handleSubcategoryChange = (subId: string, checked: boolean) => {
    if (!onSubcategoriesChange) return;
    if (checked) {
      onSubcategoriesChange(Array.from(new Set([...selectedSubcategories, subId])));
    } else {
      onSubcategoriesChange(selectedSubcategories.filter((s) => s !== subId));
    }
  };

  /** Expand / collapse subcategory list for a category */
  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
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

      {/* Destination Categories with subcategory cascade */}
      {isDestinationSelected && onCategoriesChange && (
        <div className="pl-4 border-l-2" style={{ borderColor: tk.brandBorder }}>
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="flex items-center gap-1 font-medium mb-3 text-sm"
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
            <div className="space-y-3 ml-1">
              {DESTINATION_CATEGORY_TREE.map((category) => {
                const isCatSelected = selectedCategories.includes(category.id);
                const isExpanded = expandedCategories.includes(category.id);
                const allSubsSelected =
                  category.subcategories.length > 0 &&
                  category.subcategories.every((s) =>
                    selectedSubcategories.includes(s.id)
                  );
                const someSubsSelected =
                  category.subcategories.some((s) =>
                    selectedSubcategories.includes(s.id)
                  );

                return (
                  <div key={category.id}>
                    {/* Category row */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={isCatSelected || allSubsSelected}
                        // Indeterminate visual hint via opacity when some (but not all) subs selected
                        data-state={
                          !isCatSelected && someSubsSelected && !allSubsSelected
                            ? "indeterminate"
                            : undefined
                        }
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                      >
                        <span>{category.emoji}</span>
                        <span>{category.label}</span>
                      </label>
                      {/* Expand/collapse subcategories */}
                      {category.subcategories.length > 0 && (
                        <button
                          onClick={() => toggleCategoryExpand(category.id)}
                          className="ml-auto p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
                          style={{ color: tk.brand }}
                          aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {isExpanded && category.subcategories.length > 0 && (
                      <div
                        className="ml-6 mt-2 space-y-2 pl-3 border-l"
                        style={{ borderColor: tk.dividerColor }}
                      >
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`sub-${category.id}-${sub.id}`}
                              checked={selectedSubcategories.includes(sub.id)}
                              onCheckedChange={(checked) =>
                                handleSubcategoryChange(sub.id, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`sub-${category.id}-${sub.id}`}
                              className="text-xs leading-none cursor-pointer"
                              style={{ color: tk.textMuted }}
                            >
                              {sub.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
