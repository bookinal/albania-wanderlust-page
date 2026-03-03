import { useState } from "react";
import { Filter, RotateCcw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarFilters } from "@/types/car.types";
import { useTranslation } from "react-i18next";

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

export const CarFilterBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableFeatures,
  featuresLoading = false,
}: CarFilterBarProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  const countActiveFilters = (): number => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.transmission && filters.transmission !== "all") count++;
    if (filters.fuelType && filters.fuelType !== "all") count++;
    if (
      filters.priceRange &&
      (filters.priceRange.min > 0 || filters.priceRange.max < 1000)
    )
      count++;
    if (filters.features && filters.features.length > 0) count++;
    if (filters.seats && filters.seats > 0) count++;
    if (filters.pickupDate || filters.returnDate) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {t("searchResults.filters.filters")}
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Sidebar */}
      <aside
        className={`${
          isOpen ? "block" : "hidden"
        } lg:block w-full lg:w-64 lg:border-r lg:pr-6 space-y-6 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg shadow-sm lg:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t("searchResults.filters.filters")}
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </h2>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs flex items-center gap-1 h-8 px-2"
            >
              <RotateCcw className="w-3 h-3" />
              {t("searchResults.filters.reset")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Accordion type="single" collapsible defaultValue="search">
            {/* Search */}
            <AccordionItem value="search">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.search")}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <Input
                  placeholder={t("searchResults.filters.searchPlaceholderCars")}
                  value={filters.searchTerm || ""}
                  onChange={(e) =>
                    onFilterChange({ searchTerm: e.target.value })
                  }
                  className="text-sm"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Date Range */}
            <AccordionItem value="dates">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("searchResults.filters.rentalDates")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    {t("searchResults.filters.pickupDate")}
                  </Label>
                  <Input
                    type="date"
                    value={
                      filters.pickupDate
                        ? filters.pickupDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      onFilterChange({ pickupDate: date });
                    }}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    {t("searchResults.filters.returnDate")}
                  </Label>
                  <Input
                    type="date"
                    value={
                      filters.returnDate
                        ? filters.returnDate.toISOString().split("T")[0]
                        : ""
                    }
                    min={
                      filters.pickupDate
                        ? filters.pickupDate.toISOString().split("T")[0]
                        : undefined
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      onFilterChange({ returnDate: date });
                    }}
                    className="text-sm"
                  />
                </div>
                {(filters.pickupDate || filters.returnDate) && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t("searchResults.filters.showingCarsForDates")}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Price Range */}
            <AccordionItem value="price">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.dailyPriceRange")}
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>€{filters.priceRange?.min || 0}</span>
                    <span>€{filters.priceRange?.max || 1000}</span>
                  </div>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={[
                      filters.priceRange?.min || 0,
                      filters.priceRange?.max || 1000,
                    ]}
                    onValueChange={(value) => {
                      onFilterChange({
                        priceRange: { min: value[0], max: value[1] },
                      });
                    }}
                    className="py-2"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Car Type */}
            <AccordionItem value="type">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.carType")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    onFilterChange({ type: value as any })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue
                      placeholder={t("searchResults.filters.allTypes")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("searchResults.filters.allTypes")}
                    </SelectItem>
                    <SelectItem value="Sedan">
                      {t("searchResults.filters.sedan")}
                    </SelectItem>
                    <SelectItem value="SUV">
                      {t("searchResults.filters.suv")}
                    </SelectItem>
                    <SelectItem value="Sports">
                      {t("searchResults.filters.sports")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* Transmission */}
            <AccordionItem value="transmission">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.transmission")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                <Select
                  value={filters.transmission || "all"}
                  onValueChange={(value) =>
                    onFilterChange({ transmission: value as any })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder={t("searchResults.filters.any")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("searchResults.filters.any")}
                    </SelectItem>
                    <SelectItem value="Automatic">
                      {t("searchResults.filters.automatic")}
                    </SelectItem>
                    <SelectItem value="Manual">
                      {t("searchResults.filters.manual")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* Fuel Type */}
            <AccordionItem value="fuel">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.fuelType")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                <Select
                  value={filters.fuelType || "all"}
                  onValueChange={(value) =>
                    onFilterChange({ fuelType: value as any })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue
                      placeholder={t("searchResults.filters.anyFuel")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("searchResults.filters.anyFuel")}
                    </SelectItem>
                    <SelectItem value="Petrol">
                      {t("searchResults.filters.petrol")}
                    </SelectItem>
                    <SelectItem value="Diesel">
                      {t("searchResults.filters.diesel")}
                    </SelectItem>
                    <SelectItem value="Hybrid">
                      {t("searchResults.filters.hybrid")}
                    </SelectItem>
                    <SelectItem value="Electric">
                      {t("searchResults.filters.electric")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* Seats */}
            <AccordionItem value="seats">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.minSeats")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                <Input
                  type="number"
                  min="1"
                  max="9"
                  placeholder={t("searchResults.filters.seatsPlaceholder")}
                  value={filters.seats || ""}
                  onChange={(e) =>
                    onFilterChange({
                      seats: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                />
              </AccordionContent>
            </AccordionItem>

            {/* Features (Dynamic) */}
            <AccordionItem value="features">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.features")}
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {featuresLoading ? (
                  <div className="text-sm text-gray-500 py-2">
                    {t("searchResults.filters.loadingFeatures")}
                  </div>
                ) : availableFeatures.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">
                    {t("searchResults.filters.noFeatures")}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {availableFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={filters.features?.includes(feature) || false}
                          onCheckedChange={(checked) => {
                            const currentFeatures = filters.features || [];
                            const newFeatures = checked
                              ? [...currentFeatures, feature]
                              : currentFeatures.filter((f) => f !== feature);
                            onFilterChange({ features: newFeatures });
                          }}
                        />
                        <Label
                          htmlFor={`feature-${feature}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </aside>
    </>
  );
};
