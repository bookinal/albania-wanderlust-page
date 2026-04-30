import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import { useTheme } from "@/context/ThemeContext";
import { DESTINATIONS_QUERY_KEY } from "@/hooks/useDestinations";

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

/* ============================== Token Map Type ============================== */

interface TkMap {
  pageBg: string;
  pageText: string;
  cardBg: string;
  cardBorder: string;
  mutedText: string;
  dimText: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  filterBtnBg: string;
  filterBtnText: string;
  iconMuted: string;
  labelText: string;
  dialogBg: string;
  dialogText: string;
  statCardBg: string;
  statCardBorder: string;
  divider: string;
  tabBg: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabInactiveText: string;
  paginationBg: string;
  paginationBorder: string;
  paginationText: string;
}

/* ============================== Main Component ============================== */

export default function DestinationsManagement() {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeLocaleTab, setActiveLocaleTab] = useState<SupportedLocale>("en");

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

  const tk: TkMap = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    inputBg: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
    inputBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    inputText: isDark ? '#ffffff' : '#111115',
    filterBtnBg: isDark ? 'rgba(255,255,255,0.04)' : '#edeae6',
    filterBtnText: isDark ? 'rgba(255,255,255,0.60)' : '#44403c',
    iconMuted: isDark ? 'rgba(255,255,255,0.40)' : '#9e9994',
    labelText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    dialogBg: isDark ? '#1a1a1a' : '#ffffff',
    dialogText: isDark ? '#ffffff' : '#111115',
    statCardBg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    statCardBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    divider: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    tabBg: isDark ? 'rgba(255,255,255,0.06)' : '#f0ece8',
    tabActiveBg: isDark ? '#2a2a2a' : '#ffffff',
    tabActiveText: isDark ? '#E8192C' : '#E8192C',
    tabInactiveText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    paginationBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f2ee',
    paginationBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    paginationText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 10,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    padding: '8px 12px',
    fontSize: 14,
    color: tk.inputText,
    outline: 'none',
  };

  /* ============================== Effects ============================== */

  useEffect(() => { fetchDestinations(); }, []);

  /* ============================== Handlers ============================== */

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await getAllDestinations();
      setDestinations(data);
      queryClient.setQueryData(DESTINATIONS_QUERY_KEY, data);
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
    setFormData({ name: emptyTranslatedField(), description: emptyTranslatedField(), category: "", lat: undefined, lng: undefined, imageUrls: [] });
    setSelectedImageFiles([]);
    setActiveLocaleTab("en");
    setDialogOpen(true);
  };

  const handleEdit = (destination: Destination) => {
    setDialogMode("edit");
    setSelectedDestination(destination);
    setFormData({
      name: { ...emptyTranslatedField(), ...(typeof destination.name === "object" ? destination.name : { en: destination.name }) },
      description: { ...emptyTranslatedField(), ...(typeof destination.description === "object" ? destination.description : { en: destination.description }) },
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
      name: { ...emptyTranslatedField(), ...(typeof destination.name === "object" ? destination.name : { en: destination.name }) },
      description: { ...emptyTranslatedField(), ...(typeof destination.description === "object" ? destination.description : { en: destination.description }) },
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
      text: t("destinationsManagement.delete.confirmMessage", { name: localize(destination.name) }),
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
        await queryClient.invalidateQueries({ queryKey: DESTINATIONS_QUERY_KEY });
        Swal.fire(t("destinationsManagement.delete.successTitle"), t("destinationsManagement.delete.successMessage"), "success");
      } catch (err) {
        console.error("Error deleting destination:", err);
        Swal.fire(t("destinationsManagement.errorMessages.deleteFailed"), t("destinationsManagement.errorMessages.deleteFailedMessage"), "error");
      }
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTranslatedChange = (field: "name" | "description", locale: SupportedLocale, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: value } }));
  };

  const handleSave = async () => {
    if (!formData.name.en || !formData.category) {
      Swal.fire(t("destinationsManagement.errorMessages.createFailed"), t("destinationsManagement.validation.requiredFields"), "error");
      return;
    }
    if (dialogMode === "create" && selectedImageFiles.length === 0) {
      Swal.fire(t("destinationsManagement.errorMessages.createFailed"), t("destinationsManagement.validation.imageRequired"), "error");
      return;
    }
    if (!formData.lat || !formData.lng) {
      Swal.fire(t("destinationsManagement.errorMessages.createFailed"), t("destinationsManagement.validation.locationRequired"), "error");
      return;
    }

    setSaving(true);
    try {
      let { imageUrls } = formData;
      if (selectedImageFiles.length > 0) {
        const uploadResults = await uploadImages(selectedImageFiles, "destination" as StorageEntityType);
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
        await queryClient.invalidateQueries({ queryKey: DESTINATIONS_QUERY_KEY });
        Swal.fire(t("destinationsManagement.success.created"), t("destinationsManagement.success.createdMessage"), "success");
      } else if (dialogMode === "edit" && selectedDestination) {
        const updated = await updateDestination(selectedDestination.id, destinationData);
        setDestinations((prev) => prev.map((d) => (d.id === selectedDestination.id ? updated : d)));
        await queryClient.invalidateQueries({ queryKey: DESTINATIONS_QUERY_KEY });
        Swal.fire(t("destinationsManagement.success.updated"), t("destinationsManagement.success.updatedMessage"), "success");
      }

      setDialogOpen(false);
      setSelectedImageFiles([]);
    } catch (err) {
      console.error("Error saving destination:", err);
      Swal.fire(t("destinationsManagement.errorMessages.createFailed"), t("destinationsManagement.errorMessages.createFailedMessage"), "error");
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
    const matchesCategory = categoryFilter === "all" || destination.category === categoryFilter;
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
      <div className="flex justify-center items-center h-96 -m-8" style={{ background: tk.pageBg }}>
          <Loader2 size={48} className="animate-spin text-[#e41e20]" />
        </div>
    );
  }

  return (
    <div style={{ background: tk.pageBg, color: tk.pageText }} className="-m-8 min-h-screen p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: tk.pageText }}>
              {t("destinationsManagement.title")}
            </h1>
            <p className="mt-1" style={{ color: tk.mutedText }}>
              {t("destinationsManagement.subtitle")}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: '#E8192C', color: '#ffffff' }}
          >
            <Plus size={18} />
            {t("destinationsManagement.addDestination")}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-4 py-3 rounded-xl flex items-start gap-3 border" style={{ background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2', borderColor: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca', color: isDark ? '#f87171' : '#991b1b' }}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("destinationsManagement.stats.total"), value: destinations.length, color: '#E8192C' },
            { label: t("destinationsManagement.stats.adventure"), value: destinations.filter(d => d.category === "Adventure").length, color: '#16a34a' },
            { label: t("destinationsManagement.stats.historic"), value: destinations.filter(d => d.category === "Historic").length, color: '#7c3aed' },
            { label: t("destinationsManagement.stats.beach"), value: destinations.filter(d => d.category === "Beach").length, color: '#ea580c' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl border" style={{ background: tk.statCardBg, borderColor: tk.statCardBorder }}>
              <span className="text-sm" style={{ color: tk.mutedText }}>{label}</span>
              <span className="text-2xl font-bold block" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 rounded-xl border flex flex-wrap gap-4 items-center" style={{ background: tk.cardBg, borderColor: tk.cardBorder }}>
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tk.iconMuted }} />
            <input
              type="text"
              placeholder={t("destinationsManagement.filters.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} style={{ color: tk.iconMuted }} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ ...inputStyle, width: 'auto' }}
            >
              <option value="all">{t("destinationsManagement.filters.allCategories")}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20 rounded-xl border" style={{ background: tk.cardBg, borderColor: tk.cardBorder }}>
            <p style={{ color: tk.mutedText }}>{t("destinationsManagement.empty.message")}</p>
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
                tk={tk}
                isDark={isDark}
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
              className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: tk.paginationBg, borderColor: tk.paginationBorder, color: tk.paginationText }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="px-4 py-2 rounded-lg"
                style={page === currentPage
                  ? { background: '#E8192C', color: '#ffffff' }
                  : { background: tk.paginationBg, border: `1px solid ${tk.paginationBorder}`, color: tk.paginationText }
                }
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: tk.paginationBg, borderColor: tk.paginationBorder, color: tk.paginationText }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Dialog for Create/Edit/View */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ background: tk.dialogBg, color: tk.dialogText, maxWidth: 800, maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle style={{ color: tk.dialogText }}>
              {dialogMode === "create" && t("destinationsManagement.dialog.addTitle")}
              {dialogMode === "edit" && t("destinationsManagement.dialog.editTitle")}
              {dialogMode === "view" && t("destinationsManagement.dialog.viewTitle")}
            </DialogTitle>
            <DialogDescription style={{ color: tk.mutedText }}>
              {dialogMode === "create" && t("destinationsManagement.dialog.addDescription")}
              {dialogMode === "edit" && t("destinationsManagement.dialog.editDescription")}
              {dialogMode === "view" && t("destinationsManagement.dialog.viewDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                {t("destinationsManagement.form.name")} <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.name.en || ""}
                onChange={(e) => handleTranslatedChange("name", "en", e.target.value)}
                placeholder={t("destinationsManagement.form.namePlaceholder")}
                disabled={dialogMode === "view"}
                style={inputStyle}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                {t("destinationsManagement.form.category")} <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={dialogMode === "view"}
                style={inputStyle}
              >
                <option value="">{t("destinationsManagement.form.categoryPlaceholder")}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Language Tabs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={16} className="text-[#E8192C]" />
                <span className="text-sm font-medium" style={{ color: tk.dimText }}>
                  {t("destinationsManagement.form.descriptionLanguage", "Description Language")}
                </span>
              </div>
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: tk.tabBg }}>
                {SUPPORTED_LOCALES.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setActiveLocaleTab(locale)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                    style={activeLocaleTab === locale
                      ? { background: tk.tabActiveBg, color: tk.tabActiveText, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
                      : { color: tk.tabInactiveText }
                    }
                  >
                    {LOCALE_LABELS[locale]}
                    {locale === "en" && <span className="text-red-500 ml-1">*</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                {t("destinationsManagement.form.description")} ({LOCALE_LABELS[activeLocaleTab]})
              </label>
              <textarea
                value={formData.description[activeLocaleTab] || ""}
                onChange={(e) => handleTranslatedChange("description", activeLocaleTab, e.target.value)}
                rows={4}
                placeholder={t("destinationsManagement.form.descriptionPlaceholder")}
                disabled={dialogMode === "view"}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Image Upload */}
            {dialogMode !== "view" && (
              <ImageUpload
                propertyType="Destination"
                onImagesSelected={(files) => setSelectedImageFiles(files)}
                selectedFiles={selectedImageFiles}
                onRemoveFile={(index) => setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index))}
                existingImages={formData.imageUrls}
                onRemoveExisting={(url) => setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((img) => img !== url) }))}
                maxImages={10}
                isLoading={saving}
              />
            )}

            {/* Image Preview for View Mode */}
            {dialogMode === "view" && formData.imageUrls.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                  {t("destinationsManagement.form.images")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.imageUrls.map((url, index) => (
                    <img key={index} src={url} alt={`Destination ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {/* Map Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                {t("destinationsManagement.form.location")} <span className="text-red-500">*</span>
              </label>
              <MapPicker
                lat={formData.lat}
                lng={formData.lng}
                onLocationSelect={handleLocationSelect}
                label={dialogMode === "view" ? t("destinationsManagement.form.location") : t("destinationsManagement.form.locationLabel")}
                defaultCenter={[41.3275, 19.8187]}
                defaultZoom={8}
                showCoordinates={true}
              />
            </div>
          </div>

          <DialogFooter>
            {dialogMode !== "view" && (
              <>
                <button
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50 transition-colors"
                  style={{ background: tk.filterBtnBg, color: tk.filterBtnText, borderColor: tk.cardBorder }}
                >
                  {t("destinationsManagement.dialog.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                  style={{ background: '#E8192C', color: '#ffffff' }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving
                    ? t("destinationsManagement.dialog.saving")
                    : dialogMode === "create"
                      ? t("destinationsManagement.dialog.create")
                      : t("destinationsManagement.dialog.update")}
                </button>
              </>
            )}
            {dialogMode === "view" && (
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: tk.filterBtnBg, color: tk.filterBtnText, border: `1px solid ${tk.cardBorder}` }}
              >
                {t("destinationsManagement.dialog.close")}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================== Card Component ============================== */

interface DestinationCardProps {
  destination: Destination;
  onView: (destination: Destination) => void;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
  tk: TkMap;
  isDark: boolean;
}

function DestinationCard({ destination, onView, onEdit, onDelete, tk, isDark }: DestinationCardProps) {
  const { t } = useTranslation();
  const { localize } = useLocalized();

  const getCategoryStyle = (category: string): { bg: string; text: string } => {
    const styles: Record<string, { dark: { bg: string; text: string }; light: { bg: string; text: string } }> = {
      Adventure: { dark: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' }, light: { bg: '#dcfce7', text: '#166534' } },
      Historic: { dark: { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd' }, light: { bg: '#f5f3ff', text: '#6d28d9' } },
      Beach: { dark: { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd' }, light: { bg: '#eff6ff', text: '#1d4ed8' } },
      Cultural: { dark: { bg: 'rgba(236,72,153,0.15)', text: '#f9a8d4' }, light: { bg: '#fdf2f8', text: '#be185d' } },
      Nature: { dark: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7' }, light: { bg: '#ecfdf5', text: '#065f46' } },
      City: { dark: { bg: 'rgba(249,115,22,0.15)', text: '#fdba74' }, light: { bg: '#fff7ed', text: '#c2410c' } },
    };
    const s = styles[category];
    if (!s) return isDark ? { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.60)' } : { bg: '#f5f2ee', text: '#44403c' };
    return isDark ? s.dark : s.light;
  };

  const catStyle = getCategoryStyle(destination.category);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-shadow hover:shadow-xl"
      style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
    >
      {/* Image */}
      <div className="h-48 relative overflow-hidden" style={{ background: tk.filterBtnBg }}>
        {destination.imageUrls && destination.imageUrls.length > 0 ? (
          <img
            src={destination.imageUrls[0]}
            alt={localize(destination.name)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#e5e2de' }}>
            <MapPin size={48} style={{ color: tk.iconMuted }} />
          </div>
        )}
        <div
          className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: catStyle.bg, color: catStyle.text }}
        >
          {destination.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1" style={{ color: tk.pageText }}>
          {localize(destination.name)}
        </h3>
        <p className="text-sm mb-3 line-clamp-2" style={{ color: tk.mutedText }}>
          {localize(destination.description)}
        </p>

        {destination.lat && destination.lng && (
          <div className="flex items-center text-xs mb-3" style={{ color: tk.iconMuted }}>
            <MapPin size={13} className="mr-1" />
            <span>{destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(destination)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            style={{ background: tk.filterBtnBg, color: tk.filterBtnText, borderColor: tk.cardBorder }}
          >
            <Eye size={15} />
            {t("destinationsManagement.card.view")}
          </button>
          <button
            onClick={() => onEdit(destination)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            style={{ background: tk.filterBtnBg, color: tk.filterBtnText, borderColor: tk.cardBorder }}
          >
            <Edit size={15} />
            {t("destinationsManagement.card.edit")}
          </button>
          <button
            onClick={() => onDelete(destination)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2', color: isDark ? '#f87171' : '#991b1b', border: `1px solid ${isDark ? 'rgba(239,68,68,0.20)' : '#fecaca'}` }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>

  );
}
