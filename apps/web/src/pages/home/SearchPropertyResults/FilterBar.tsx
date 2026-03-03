import { useState } from "react";
import { ChevronDown, RotateCcw, Filter, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import {
  HotelFiltersInput,
  ApartmentFiltersInput,
  SearchFiltersState,
} from "@/types/search.types";

interface FilterBarProps {
  filters: SearchFiltersState;
  onPropertyTypeChange: (type: "hotel" | "apartment" | "both") => void;
  onHotelFiltersChange: (filters: Partial<HotelFiltersInput>) => void;
  onApartmentFiltersChange: (filters: Partial<ApartmentFiltersInput>) => void;
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
}

/**
 * FilterBar component for search results page
 * Supports dynamic filtering by property type with type-specific filter options
 */
export const FilterBar = ({
  filters,
  onPropertyTypeChange,
  onHotelFiltersChange,
  onApartmentFiltersChange,
  onDateChange,
  onGuestsChange,
  onResetFilters,
  onApplyFilters,
  loading,
}: FilterBarProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  const countActiveFilters = (): number => {
    let count = 0;
    const hf = filters.hotelFilters;
    const af = filters.apartmentFilters;

    // Date filters
    if (filters.checkInDate || filters.checkOutDate) count++;

    // Guests filters
    if (filters.adults || filters.children || filters.rooms) count++;

    // Hotel filters
    if (hf.searchTerm) count++;
    if (hf.rating !== "all") count++;
    if (hf.status !== "all") count++;
    if (hf.rooms?.min || hf.rooms?.max) count++;
    if (hf.priceRange?.min !== 0 || hf.priceRange?.max !== 500) count++;
    if (hf.amenities && Object.values(hf.amenities).some((v) => v)) count++;

    // Apartment filters
    if (af.searchTerm) count++;
    if (af.rating !== "all") count++;
    if (af.status !== "all") count++;
    if (af.rooms?.min || af.rooms?.max) count++;
    if (af.beds?.min || af.beds?.max) count++;
    if (af.bathrooms?.min || af.bathrooms?.max) count++;
    if (af.priceRange?.min !== 0 || af.priceRange?.max !== 500) count++;
    if (af.amenities && af.amenities.length > 0) count++;

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
        } lg:block w-full lg:w-64 lg:border-r lg:pr-6 space-y-6`}
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
              className="text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              {t("searchResults.filters.reset")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Property Type Selector */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              {t("searchResults.filters.propertyType")}
            </h3>
            <div className="flex gap-2">
              {(["both", "hotel", "apartment"] as const).map((type) => (
                <Button
                  key={type}
                  variant={
                    filters.propertyType === type ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onPropertyTypeChange(type)}
                  className="flex-1 capitalize"
                >
                  {type === "both"
                    ? t("searchResults.filters.all")
                    : t(`searchResults.filters.${type}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Shared Filters */}
          <Accordion type="single" collapsible defaultValue="search">
            {/* Search */}
            <AccordionItem value="search">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.search")}
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Input
                  placeholder={t(
                    "searchResults.filters.searchPlaceholderProperties",
                  )}
                  value={
                    filters.propertyType === "hotel"
                      ? filters.hotelFilters.searchTerm || ""
                      : filters.propertyType === "apartment"
                        ? filters.apartmentFilters.searchTerm || ""
                        : filters.hotelFilters.searchTerm ||
                          filters.apartmentFilters.searchTerm ||
                          ""
                  }
                  onChange={(e) => {
                    if (filters.propertyType === "hotel") {
                      onHotelFiltersChange({ searchTerm: e.target.value });
                    } else if (filters.propertyType === "apartment") {
                      onApartmentFiltersChange({ searchTerm: e.target.value });
                    } else {
                      // Property type is "both" - update both filters
                      onHotelFiltersChange({ searchTerm: e.target.value });
                      onApartmentFiltersChange({ searchTerm: e.target.value });
                    }
                  }}
                  className="text-sm"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Stay Dates */}
            <AccordionItem value="dates">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("searchResults.filters.stayDates")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    {t("searchResults.filters.checkInDate")}
                  </Label>
                  <Input
                    type="date"
                    value={
                      filters.checkInDate
                        ? new Date(filters.checkInDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null;
                      onDateChange({ checkInDate: date });
                    }}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    {t("searchResults.filters.checkOutDate")}
                  </Label>
                  <Input
                    type="date"
                    value={
                      filters.checkOutDate
                        ? new Date(filters.checkOutDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    min={
                      filters.checkInDate
                        ? new Date(filters.checkInDate)
                            .toISOString()
                            .split("T")[0]
                        : undefined
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null;
                      onDateChange({ checkOutDate: date });
                    }}
                    className="text-sm"
                  />
                </div>
                {(filters.checkInDate || filters.checkOutDate) && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t("searchResults.filters.showingPropertiesForDates")}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Guests */}
            <AccordionItem value="guests">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.guests")}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    {t("searchResults.filters.adults")}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      value={filters.adults || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const adults = val ? parseInt(val) : 0;
                        const children = filters.children || 0;
                        onGuestsChange({
                          adults,
                          children,
                          rooms: filters.rooms,
                        });
                        // Update apartment beds min to adults + children
                        onApartmentFiltersChange({
                          beds: {
                            min: adults + children,
                            max: filters.apartmentFilters.beds?.max,
                          },
                        });
                      }}
                      className="text-sm pr-8"
                    />
                    {filters.adults ? (
                      <button
                        onClick={() => {
                          const children = filters.children || 0;
                          onGuestsChange({
                            adults: 0,
                            children,
                            rooms: filters.rooms,
                          });
                          onApartmentFiltersChange({
                            beds: {
                              min: children,
                              max: filters.apartmentFilters.beds?.max,
                            },
                          });
                        }}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    {t("searchResults.filters.children")}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={filters.children || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const children = val ? parseInt(val) : 0;
                        const adults = filters.adults || 2;
                        onGuestsChange({
                          adults,
                          children,
                          rooms: filters.rooms,
                        });
                        // Update apartment beds min to adults + children
                        onApartmentFiltersChange({
                          beds: {
                            min: adults + children,
                            max: filters.apartmentFilters.beds?.max,
                          },
                        });
                      }}
                      className="text-sm pr-8"
                    />
                    {filters.children ? (
                      <button
                        onClick={() => {
                          const adults = filters.adults || 2;
                          onGuestsChange({
                            adults,
                            children: 0,
                            rooms: filters.rooms,
                          });
                          onApartmentFiltersChange({
                            beds: {
                              min: adults,
                              max: filters.apartmentFilters.beds?.max,
                            },
                          });
                        }}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    {t("searchResults.filters.rooms")}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      value={filters.rooms || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const rooms = val ? parseInt(val) : 0;
                        onGuestsChange({
                          adults: filters.adults,
                          children: filters.children,
                          rooms,
                        });
                        // Update apartment rooms min to rooms
                        onApartmentFiltersChange({
                          rooms: {
                            min: rooms,
                            max: filters.apartmentFilters.rooms?.max,
                          },
                        });
                      }}
                      className="text-sm pr-8"
                    />
                    {filters.rooms ? (
                      <button
                        onClick={() => {
                          onGuestsChange({
                            adults: filters.adults,
                            children: filters.children,
                            rooms: 0,
                          });
                          onApartmentFiltersChange({
                            rooms: {
                              min: 0,
                              max: filters.apartmentFilters.rooms?.max,
                            },
                          });
                        }}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
                {(filters.adults || filters.children || filters.rooms) && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    {t("searchResults.filters.filteringApartments", {
                      beds: (filters.adults || 2) + (filters.children || 0),
                      rooms: filters.rooms || 1,
                    })}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Price Range */}
            <AccordionItem value="price">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.priceRange")}
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>€{filters.hotelFilters.priceRange?.min || 0}</span>
                    <span>€{filters.hotelFilters.priceRange?.max || 500}</span>
                  </div>
                  <Slider
                    min={0}
                    max={500}
                    step={10}
                    value={[
                      filters.hotelFilters.priceRange?.min || 0,
                      filters.hotelFilters.priceRange?.max || 500,
                    ]}
                    onValueChange={(value) => {
                      if (filters.propertyType === "hotel") {
                        onHotelFiltersChange({
                          priceRange: { min: value[0], max: value[1] },
                        });
                      } else if (filters.propertyType === "apartment") {
                        onApartmentFiltersChange({
                          priceRange: { min: value[0], max: value[1] },
                        });
                      } else {
                        // Property type is "both" - update both filters
                        onHotelFiltersChange({
                          priceRange: { min: value[0], max: value[1] },
                        });
                        onApartmentFiltersChange({
                          priceRange: { min: value[0], max: value[1] },
                        });
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {filters.propertyType === "hotel"
                      ? t("searchResults.filters.perNight")
                      : t("searchResults.filters.perDay")}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rating */}
            <AccordionItem value="rating">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.rating")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <Select
                  value={
                    filters.propertyType === "hotel"
                      ? filters.hotelFilters.rating || "all"
                      : filters.apartmentFilters.rating || "all"
                  }
                  onValueChange={(value) => {
                    if (filters.propertyType === "hotel") {
                      onHotelFiltersChange({
                        rating: value as any,
                      });
                    } else if (filters.propertyType === "apartment") {
                      onApartmentFiltersChange({
                        rating: value as any,
                      });
                    } else {
                      // Property type is "both" - update both filters
                      onHotelFiltersChange({
                        rating: value as any,
                      });
                      onApartmentFiltersChange({
                        rating: value as any,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("searchResults.filters.allRatings")}
                    </SelectItem>
                    <SelectItem value="3+">3+</SelectItem>
                    <SelectItem value="3.5+">3.5+</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                    <SelectItem value="4.5+">4.5+</SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* Availability Status */}
            <AccordionItem value="status">
              <AccordionTrigger className="text-sm font-semibold">
                {t("searchResults.filters.availability")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <Select
                  value={
                    filters.propertyType === "hotel"
                      ? filters.hotelFilters.status || "all"
                      : filters.apartmentFilters.status || "all"
                  }
                  onValueChange={(value) => {
                    if (filters.propertyType === "hotel") {
                      onHotelFiltersChange({
                        status: value as any,
                      });
                    } else if (filters.propertyType === "apartment") {
                      onApartmentFiltersChange({
                        status: value as any,
                      });
                    } else {
                      // Property type is "both" - update both filters
                      onHotelFiltersChange({
                        status: value as any,
                      });
                      onApartmentFiltersChange({
                        status: value as any,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("searchResults.filters.allStatus")}
                    </SelectItem>
                    {filters.propertyType === "hotel" ? (
                      <>
                        <SelectItem value="active">
                          {t("searchResults.filters.active")}
                        </SelectItem>
                        <SelectItem value="maintenance">
                          {t("searchResults.filters.maintenance")}
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="available">
                          {t("searchResults.filters.available")}
                        </SelectItem>
                        <SelectItem value="rented">
                          {t("searchResults.filters.rented")}
                        </SelectItem>
                        <SelectItem value="maintenance">
                          {t("searchResults.filters.maintenance")}
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* Rooms (if hotel or both) */}
            {(filters.propertyType === "hotel" ||
              filters.propertyType === "both") && (
              <AccordionItem value="rooms">
                <AccordionTrigger className="text-sm font-semibold">
                  {t("searchResults.filters.rooms")}
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-1 block">
                        {t("searchResults.filters.min")}
                      </Label>
                      <Input
                        type="number"
                        placeholder={t("searchResults.filters.min")}
                        value={filters.hotelFilters.rooms?.min || ""}
                        onChange={(e) =>
                          onHotelFiltersChange({
                            rooms: {
                              min: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                              max: filters.hotelFilters.rooms?.max,
                            },
                          })
                        }
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">
                        {t("searchResults.filters.max")}
                      </Label>
                      <Input
                        type="number"
                        placeholder={t("searchResults.filters.max")}
                        value={filters.hotelFilters.rooms?.max || ""}
                        onChange={(e) =>
                          onHotelFiltersChange({
                            rooms: {
                              min: filters.hotelFilters.rooms?.min,
                              max: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Hotel Amenities (if hotel or both) */}
            {(filters.propertyType === "hotel" ||
              filters.propertyType === "both") && (
              <AccordionItem value="hotel-amenities">
                <AccordionTrigger className="text-sm font-semibold">
                  {t("searchResults.filters.amenities")}
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {[
                    {
                      id: "wifi",
                      label: t("searchResults.filters.amenityWifi"),
                    },
                    {
                      id: "parking",
                      label: t("searchResults.filters.amenityParking"),
                    },
                    {
                      id: "pool",
                      label: t("searchResults.filters.amenityPool"),
                    },
                    { id: "gym", label: t("searchResults.filters.amenityGym") },
                    { id: "spa", label: t("searchResults.filters.amenitySpa") },
                    {
                      id: "restaurant",
                      label: t("searchResults.filters.amenityRestaurant"),
                    },
                    { id: "bar", label: t("searchResults.filters.amenityBar") },
                  ].map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={amenity.id}
                        checked={
                          filters.hotelFilters.amenities?.[
                            amenity.id as keyof typeof filters.hotelFilters.amenities
                          ] || false
                        }
                        onCheckedChange={(checked) =>
                          onHotelFiltersChange({
                            amenities: {
                              ...filters.hotelFilters.amenities,
                              [amenity.id]: checked,
                            },
                          })
                        }
                      />
                      <Label
                        htmlFor={amenity.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Apartment Rooms (if apartment or both) */}
            {(filters.propertyType === "apartment" ||
              filters.propertyType === "both") && (
              <>
                <AccordionItem value="apt-rooms">
                  <AccordionTrigger className="text-sm font-semibold">
                    {t("searchResults.filters.rooms")}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-1 block">
                          {t("searchResults.filters.min")}
                        </Label>
                        <Input
                          type="number"
                          placeholder={t("searchResults.filters.min")}
                          value={
                            filters.apartmentFilters.rooms?.min ||
                            filters.rooms ||
                            ""
                          }
                          onChange={(e) =>
                            onApartmentFiltersChange({
                              rooms: {
                                min: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                                max: filters.apartmentFilters.rooms?.max,
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">
                          {t("searchResults.filters.max")}
                        </Label>
                        <Input
                          type="number"
                          placeholder={t("searchResults.filters.max")}
                          value={filters.apartmentFilters.rooms?.max || ""}
                          onChange={(e) =>
                            onApartmentFiltersChange({
                              rooms: {
                                min: filters.apartmentFilters.rooms?.min,
                                max: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="apt-beds">
                  <AccordionTrigger className="text-sm font-semibold">
                    {t("searchResults.filters.beds")}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-1 block">
                          {t("searchResults.filters.min")}
                        </Label>
                        <Input
                          type="number"
                          placeholder={t("searchResults.filters.min")}
                          value={filters.apartmentFilters.beds?.min || ""}
                          onChange={(e) =>
                            onApartmentFiltersChange({
                              beds: {
                                min: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                                max: filters.apartmentFilters.beds?.max,
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">
                          {t("searchResults.filters.max")}
                        </Label>
                        <Input
                          type="number"
                          placeholder={t("searchResults.filters.max")}
                          value={filters.apartmentFilters.beds?.max || ""}
                          onChange={(e) =>
                            onApartmentFiltersChange({
                              beds: {
                                min: filters.apartmentFilters.beds?.min,
                                max: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="apt-bathrooms">
                  <AccordionTrigger className="text-sm font-semibold">
                    {t("searchResults.filters.bathrooms")}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-1 block">
                          {t("searchResults.filters.min")}
                        </Label>
                        <Input
                          type="number"
                          placeholder={t("searchResults.filters.min")}
                          value={filters.apartmentFilters.bathrooms?.min || ""}
                          onChange={(e) =>
                            onApartmentFiltersChange({
                              bathrooms: {
                                min: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                                max: filters.apartmentFilters.bathrooms?.max,
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">
                          {t("searchResults.filters.max")}
                        </Label>
                        <Input
                          type="number"
                          placeholder={t("searchResults.filters.max")}
                          value={filters.apartmentFilters.bathrooms?.max || ""}
                          onChange={(e) =>
                            onApartmentFiltersChange({
                              bathrooms: {
                                min: filters.apartmentFilters.bathrooms?.min,
                                max: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        </div>

        {/* Apply Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={onApplyFilters}
            disabled={loading}
            className="w-full"
            size="sm"
          >
            {loading
              ? t("searchResults.filters.searching")
              : t("searchResults.filters.applySearch")}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default FilterBar;
