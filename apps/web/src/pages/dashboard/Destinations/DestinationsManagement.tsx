import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Hsidebar from "../../../components/dashboard/hsidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Destination,
  DestinationDto,
  TranslatedField,
} from "@/types/destination.types";
// Import destination service functions with string ID parameters
import {
  getAllDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from "@/services/api/destinationService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import Swal from "sweetalert2";
import {
  uploadImages,
  type StorageEntityType,
} from "@/services/api/storageService";
import {
  useLocalized,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  type SupportedLocale,
} from "@/hooks/useLocalized";

/* ============================== Types ============================== */

interface DestinationFormData {
  name: TranslatedField;
  description: TranslatedField;
  category: string;
  lat?: number;
  lng?: number;
  imageUrls: string[];
}

/** Creates an empty TranslatedField with all locales set to "" */
function emptyTranslatedField(): TranslatedField {
  return Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, ""]));
}

/* ============================== Constants ============================== */

const CATEGORIES = [
  { id: "Adventure", label: "Adventure" },
  { id: "Historic", label: "Historic" },
  { id: "Beach", label: "Beach" },
  { id: "Cultural", label: "Cultural" },
  { id: "Nature", label: "Nature" },
  { id: "City", label: "City" },
];

const ITEMS_PER_PAGE = 12;

/* ============================== Main Component ============================== */

export default function DestinationsManagement() {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [activeLocaleTab, setActiveLocaleTab] = useState<SupportedLocale>("en");

  // Form states
  const [formData, setFormData] = useState<DestinationFormData>({
    name: emptyTranslatedField(),
    description: emptyTranslatedField(),
    category: "",
    lat: undefined,
    lng: undefined,
    imageUrls: [],
  });
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  /* ============================== Effects ============================== */

  useEffect(() => {
    fetchDestinations();
  }, []);

  /* ============================== Handlers ============================== */

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await getAllDestinations();
      setDestinations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError(t("destinationsManagement.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setDialogMode("create");
    setSelectedDestination(null);
    setFormData({
      name: emptyTranslatedField(),
      description: emptyTranslatedField(),
      category: "",
      lat: undefined,
      lng: undefined,
      imageUrls: [],
    });
    setSelectedImageFiles([]);
    setActiveLocaleTab("en");
    setDialogOpen(true);
  };

  const handleEdit = (destination: Destination) => {
    setDialogMode("edit");
    setSelectedDestination(destination);
    setFormData({
      name: {
        ...emptyTranslatedField(),
        ...(typeof destination.name === "object"
          ? destination.name
          : { en: destination.name }),
      },
      description: {
        ...emptyTranslatedField(),
        ...(typeof destination.description === "object"
          ? destination.description
          : { en: destination.description }),
      },
      category: destination.category,
      lat: destination.lat,
      lng: destination.lng,
      imageUrls: destination.imageUrls || [],
    });
    setSelectedImageFiles([]);
    setActiveLocaleTab("en");
    setDialogOpen(true);
  };

  const handleView = (destination: Destination) => {
    setDialogMode("view");
    setSelectedDestination(destination);
    setFormData({
      name: {
        ...emptyTranslatedField(),
        ...(typeof destination.name === "object"
          ? destination.name
          : { en: destination.name }),
      },
      description: {
        ...emptyTranslatedField(),
        ...(typeof destination.description === "object"
          ? destination.description
          : { en: destination.description }),
      },
      category: destination.category,
      lat: destination.lat,
      lng: destination.lng,
      imageUrls: destination.imageUrls || [],
    });
    setActiveLocaleTab("en");
    setDialogOpen(true);
  };

  const handleDelete = async (destination: Destination) => {
    const result = await Swal.fire({
      title: t("destinationsManagement.delete.confirmTitle"),
      text: t("destinationsManagement.delete.confirmMessage", {
        name: localize(destination.name),
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("destinationsManagement.delete.confirmButton"),
    });

    if (result.isConfirmed) {
      try {
        await deleteDestination(destination.id);
        setDestinations((prev) => prev.filter((d) => d.id !== destination.id));
        Swal.fire(
          t("destinationsManagement.delete.successTitle"),
          t("destinationsManagement.delete.successMessage"),
          "success",
        );
      } catch (err) {
        console.error("Error deleting destination:", err);
        Swal.fire(
          t("destinationsManagement.errorMessages.deleteFailed"),
          t("destinationsManagement.errorMessages.deleteFailedMessage"),
          "error",
        );
      }
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Update a translated field for a specific locale */
  const handleTranslatedChange = (
    field: "name" | "description",
    locale: SupportedLocale,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [locale]: value },
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.en || !formData.category) {
      Swal.fire(
        t("destinationsManagement.errorMessages.createFailed"),
        t("destinationsManagement.validation.requiredFields"),
        "error",
      );
      return;
    }

    if (dialogMode === "create" && selectedImageFiles.length === 0) {
      Swal.fire(
        t("destinationsManagement.errorMessages.createFailed"),
        t("destinationsManagement.validation.imageRequired"),
        "error",
      );
      return;
    }

    if (!formData.lat || !formData.lng) {
      Swal.fire(
        t("destinationsManagement.errorMessages.createFailed"),
        t("destinationsManagement.validation.locationRequired"),
        "error",
      );
      return;
    }

    setSaving(true);
    try {
      let { imageUrls } = formData;

      // Upload new images if any
      if (selectedImageFiles.length > 0) {
        const uploadResults = await uploadImages(
          selectedImageFiles,
          "destination" as StorageEntityType,
        );
        const newImageUrls = uploadResults.map((result) => result.publicUrl);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const destinationData: DestinationDto = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        lat: formData.lat,
        lng: formData.lng,
        imageUrls,
      };

      if (dialogMode === "create") {
        const newDestination = await createDestination(destinationData);
        setDestinations((prev) => [newDestination, ...prev]);
        Swal.fire(
          t("destinationsManagement.success.created"),
          t("destinationsManagement.success.createdMessage"),
          "success",
        );
      } else if (dialogMode === "edit" && selectedDestination) {
        const updated = await updateDestination(
          selectedDestination.id,
          destinationData,
        );
        setDestinations((prev) =>
          prev.map((d) => (d.id === selectedDestination.id ? updated : d)),
        );
        Swal.fire(
          t("destinationsManagement.success.updated"),
          t("destinationsManagement.success.updatedMessage"),
          "success",
        );
      }

      setDialogOpen(false);
      setSelectedImageFiles([]);
    } catch (err) {
      console.error("Error saving destination:", err);
      Swal.fire(
        t("destinationsManagement.errorMessages.createFailed"),
        t("destinationsManagement.errorMessages.createFailedMessage"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================== Filtering & Pagination ============================== */

  const filteredDestinations = destinations.filter((destination) => {
    const nameStr = localize(destination.name);
    const descStr = localize(destination.description);
    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || destination.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDestinations.length / ITEMS_PER_PAGE);
  const paginatedDestinations = filteredDestinations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* ============================== Render ============================== */

  if (loading) {
    return (
      <Hsidebar>
        <div className="flex justify-center items-center h-96">
          <Loader2 size={48} className="animate-spin text-blue-600" />
        </div>
      </Hsidebar>
    );
  }

  return (
    <Hsidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("destinationsManagement.title")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("destinationsManagement.subtitle")}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={20} className="mr-2" />
            {t("destinationsManagement.addDestination")}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl shadow">
            <span className="text-sm text-gray-500">
              {t("destinationsManagement.stats.total")}
            </span>
            <span className="text-2xl font-bold text-blue-600 block">
              {destinations.length}
            </span>
          </div>
          <div className="p-4 bg-white rounded-xl shadow">
            <span className="text-sm text-gray-500">
              {t("destinationsManagement.stats.adventure")}
            </span>
            <span className="text-2xl font-bold text-green-600 block">
              {destinations.filter((d) => d.category === "Adventure").length}
            </span>
          </div>
          <div className="p-4 bg-white rounded-xl shadow">
            <span className="text-sm text-gray-500">
              {t("destinationsManagement.stats.historic")}
            </span>
            <span className="text-2xl font-bold text-purple-600 block">
              {destinations.filter((d) => d.category === "Historic").length}
            </span>
          </div>
          <div className="p-4 bg-white rounded-xl shadow">
            <span className="text-sm text-gray-500">
              {t("destinationsManagement.stats.beach")}
            </span>
            <span className="text-2xl font-bold text-orange-600 block">
              {destinations.filter((d) => d.category === "Beach").length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-white rounded-lg shadow flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("destinationsManagement.filters.search")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="px-3 py-2 border rounded-lg"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">
                {t("destinationsManagement.filters.allCategories")}
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <p className="text-gray-500">
              {t("destinationsManagement.empty.message")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Dialog for Create/Edit/View */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" &&
                t("destinationsManagement.dialog.addTitle")}
              {dialogMode === "edit" &&
                t("destinationsManagement.dialog.editTitle")}
              {dialogMode === "view" &&
                t("destinationsManagement.dialog.viewTitle")}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" &&
                t("destinationsManagement.dialog.addDescription")}
              {dialogMode === "edit" &&
                t("destinationsManagement.dialog.editDescription")}
              {dialogMode === "view" &&
                t("destinationsManagement.dialog.viewDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name (single, same for all languages) */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("destinationsManagement.form.name")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name.en || ""}
                onChange={(e) =>
                  handleTranslatedChange("name", "en", e.target.value)
                }
                placeholder={t("destinationsManagement.form.namePlaceholder")}
                disabled={dialogMode === "view"}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                {t("destinationsManagement.form.category")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={dialogMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">
                  {t("destinationsManagement.form.categoryPlaceholder")}
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Tabs (for description only) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={16} className="text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">
                  {t(
                    "destinationsManagement.form.descriptionLanguage",
                    "Description Language",
                  )}
                </span>
              </div>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                {SUPPORTED_LOCALES.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setActiveLocaleTab(locale)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeLocaleTab === locale
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {LOCALE_LABELS[locale]}
                    {locale === "en" && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Description (per locale) */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t("destinationsManagement.form.description")} (
                {LOCALE_LABELS[activeLocaleTab]})
              </Label>
              <textarea
                id="description"
                value={formData.description[activeLocaleTab] || ""}
                onChange={(e) =>
                  handleTranslatedChange(
                    "description",
                    activeLocaleTab,
                    e.target.value,
                  )
                }
                rows={4}
                placeholder={t(
                  "destinationsManagement.form.descriptionPlaceholder",
                )}
                disabled={dialogMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Image Upload */}
            {dialogMode !== "view" && (
              <ImageUpload
                propertyType="Destination"
                onImagesSelected={(files) => {
                  setSelectedImageFiles(files);
                }}
                selectedFiles={selectedImageFiles}
                onRemoveFile={(index) => {
                  setSelectedImageFiles((prev) =>
                    prev.filter((_, i) => i !== index),
                  );
                }}
                existingImages={formData.imageUrls}
                onRemoveExisting={(url) => {
                  setFormData((prev) => ({
                    ...prev,
                    imageUrls: prev.imageUrls.filter((img) => img !== url),
                  }));
                }}
                maxImages={10}
                isLoading={saving}
              />
            )}

            {/* Image Preview for View Mode */}
            {dialogMode === "view" && formData.imageUrls.length > 0 && (
              <div className="space-y-2">
                <Label>{t("destinationsManagement.form.images")}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Destination ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Map Picker */}
            <div className="space-y-2">
              <Label>
                {t("destinationsManagement.form.location")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <MapPicker
                lat={formData.lat}
                lng={formData.lng}
                onLocationSelect={handleLocationSelect}
                label={
                  dialogMode === "view"
                    ? t("destinationsManagement.form.location")
                    : t("destinationsManagement.form.locationLabel")
                }
                defaultCenter={[41.3275, 19.8187]}
                defaultZoom={8}
                showCoordinates={true}
              />
            </div>
          </div>

          <DialogFooter>
            {dialogMode !== "view" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  {t("destinationsManagement.dialog.cancel")}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("destinationsManagement.dialog.saving")}
                    </>
                  ) : (
                    <>
                      {dialogMode === "create"
                        ? t("destinationsManagement.dialog.create")
                        : t("destinationsManagement.dialog.update")}
                    </>
                  )}
                </Button>
              </>
            )}
            {dialogMode === "view" && (
              <Button onClick={() => setDialogOpen(false)}>
                {t("destinationsManagement.dialog.close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Hsidebar>
  );
}

/* ============================== Card Component ============================== */

interface DestinationCardProps {
  destination: Destination;
  onView: (destination: Destination) => void;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
}

function DestinationCard({
  destination,
  onView,
  onEdit,
  onDelete,
}: DestinationCardProps) {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Adventure: "bg-green-100 text-green-800",
      Historic: "bg-purple-100 text-purple-800",
      Beach: "bg-blue-100 text-blue-800",
      Cultural: "bg-pink-100 text-pink-800",
      Nature: "bg-emerald-100 text-emerald-800",
      City: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {destination.imageUrls && destination.imageUrls.length > 0 ? (
          <img
            src={destination.imageUrls[0]}
            alt={localize(destination.name)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <MapPin size={48} className="text-gray-500" />
          </div>
        )}
        <div
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
            destination.category,
          )}`}
        >
          {destination.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {localize(destination.name)}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {localize(destination.description)}
        </p>

        {destination.lat && destination.lng && (
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <MapPin size={14} className="mr-1" />
            <span>
              {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(destination)}
            className="flex-1"
          >
            <Eye size={16} className="mr-1" />
            {t("destinationsManagement.card.view")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(destination)}
            className="flex-1"
          >
            <Edit size={16} className="mr-1" />
            {t("destinationsManagement.card.edit")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(destination)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
