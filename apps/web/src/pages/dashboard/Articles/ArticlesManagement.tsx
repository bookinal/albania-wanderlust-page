import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Globe,
  Calendar,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Article, ArticleDto, TranslatedField } from "@albania/shared-types";
import {
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "@/services/api/articleService";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import Swal from "sweetalert2";
import { uploadImages, type StorageEntityType } from "@/services/api/storageService";
import {
  useLocalized,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  type SupportedLocale,
} from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";
import { ARTICLES_QUERY_KEY } from "@/hooks/useArticles";

interface ArticleFormData {
  title: TranslatedField;
  excerpt: TranslatedField;
  content: TranslatedField;
  category: string;
  author: string;
  publishedAt: string;
  imageUrls: string[];
}

const CATEGORIES = [
  "Travel Tips",
  "Local Culture",
  "Food & Drink",
  "Events",
  "Guides",
  "Hidden Gems",
];

const ITEMS_PER_PAGE = 12;

function emptyTranslatedField(): TranslatedField {
  return Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, ""]));
}

function createEmptyFormData(): ArticleFormData {
  return {
    title: emptyTranslatedField(),
    excerpt: emptyTranslatedField(),
    content: emptyTranslatedField(),
    category: "",
    author: "",
    publishedAt: "",
    imageUrls: [],
  };
}

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

export default function ArticlesManagement() {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeLocaleTab, setActiveLocaleTab] = useState<SupportedLocale>("en");

  const [formData, setFormData] = useState<ArticleFormData>(createEmptyFormData());
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const tk: TkMap = {
    pageBg: isDark ? "#0d0d0d" : "#f5f4f1",
    pageText: isDark ? "#ffffff" : "#111115",
    cardBg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#e5e2de",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : "#6b6663",
    dimText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    inputBg: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    inputBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    inputText: isDark ? "#ffffff" : "#111115",
    filterBtnBg: isDark ? "rgba(255,255,255,0.04)" : "#edeae6",
    filterBtnText: isDark ? "rgba(255,255,255,0.60)" : "#44403c",
    iconMuted: isDark ? "rgba(255,255,255,0.40)" : "#9e9994",
    labelText: isDark ? "rgba(255,255,255,0.50)" : "#6b6663",
    dialogBg: isDark ? "#1a1a1a" : "#ffffff",
    dialogText: isDark ? "#ffffff" : "#111115",
    statCardBg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    statCardBorder: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    divider: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    tabBg: isDark ? "rgba(255,255,255,0.06)" : "#f0ece8",
    tabActiveBg: isDark ? "#2a2a2a" : "#ffffff",
    tabActiveText: isDark ? "#E8192C" : "#E8192C",
    tabInactiveText: isDark ? "rgba(255,255,255,0.50)" : "#6b6663",
    paginationBg: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
    paginationBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    paginationText: isDark ? "rgba(255,255,255,0.50)" : "#6b6663",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 10,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    padding: "8px 12px",
    fontSize: 14,
    color: tk.inputText,
    outline: "none",
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
      queryClient.setQueryData(ARTICLES_QUERY_KEY, data);
      setError(null);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setDialogMode("create");
    setSelectedArticle(null);
    setFormData(createEmptyFormData());
    setSelectedImageFiles([]);
    setActiveLocaleTab("en");
    setDialogOpen(true);
  };

  const handleEdit = (article: Article) => {
    setDialogMode("edit");
    setSelectedArticle(article);
    setFormData({
      title: {
        ...emptyTranslatedField(),
        ...(typeof article.title === "object" ? article.title : { en: article.title }),
      },
      excerpt: {
        ...emptyTranslatedField(),
        ...(typeof article.excerpt === "object" ? article.excerpt : { en: article.excerpt }),
      },
      content: {
        ...emptyTranslatedField(),
        ...(typeof article.content === "object" ? article.content : { en: article.content }),
      },
      category: article.category,
      author: article.author || "",
      publishedAt: article.publishedAt || "",
      imageUrls: article.imageUrls || [],
    });
    setSelectedImageFiles([]);
    setActiveLocaleTab("en");
    setDialogOpen(true);
  };

  const handleView = (article: Article) => {
    setDialogMode("view");
    setSelectedArticle(article);
    setFormData({
      title: {
        ...emptyTranslatedField(),
        ...(typeof article.title === "object" ? article.title : { en: article.title }),
      },
      excerpt: {
        ...emptyTranslatedField(),
        ...(typeof article.excerpt === "object" ? article.excerpt : { en: article.excerpt }),
      },
      content: {
        ...emptyTranslatedField(),
        ...(typeof article.content === "object" ? article.content : { en: article.content }),
      },
      category: article.category,
      author: article.author || "",
      publishedAt: article.publishedAt || "",
      imageUrls: article.imageUrls || [],
    });
    setActiveLocaleTab("en");
    setDialogOpen(true);
  };

  const handleDelete = async (article: Article) => {
    const result = await Swal.fire({
      title: "Delete Article",
      text: `Are you sure you want to delete "${localize(article.title)}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteArticle(article.id);
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
        await queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEY });
        Swal.fire("Deleted!", "The article has been deleted.", "success");
      } catch (err) {
        console.error("Error deleting article:", err);
        Swal.fire("Error", "Failed to delete article.", "error");
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTranslatedChange = (
    field: "title" | "excerpt" | "content",
    locale: SupportedLocale,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [locale]: value },
    }));
  };

  const handleSave = async () => {
    if (!formData.title.en || !formData.category) {
      Swal.fire("Validation Error", "Title (English) and Category are required.", "error");
      return;
    }

    setSaving(true);
    try {
      let { imageUrls } = formData;
      if (selectedImageFiles.length > 0) {
        const uploadResults = await uploadImages(selectedImageFiles, "article" as StorageEntityType);
        const newImageUrls = uploadResults.map((result) => result.publicUrl);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const articleData: ArticleDto = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        author: formData.author || undefined,
        publishedAt: formData.publishedAt || undefined,
        imageUrls,
      };

      if (dialogMode === "create") {
        const newArticle = await createArticle(articleData);
        setArticles((prev) => [newArticle, ...prev]);
        await queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEY });
        Swal.fire("Created!", "The article has been created.", "success");
      } else if (dialogMode === "edit" && selectedArticle) {
        const updated = await updateArticle(selectedArticle.id, articleData);
        setArticles((prev) =>
          prev.map((a) => (a.id === selectedArticle.id ? updated : a)),
        );
        await queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEY });
        Swal.fire("Updated!", "The article has been updated.", "success");
      }

      setDialogOpen(false);
      setSelectedImageFiles([]);
    } catch (err) {
      console.error("Error saving article:", err);
      Swal.fire("Error", "Failed to save article.", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const titleStr = localize(article.title);
    const excerptStr = localize(article.excerpt);
    const matchesSearch =
      titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      excerptStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-96 -m-8"
        style={{ background: tk.pageBg }}
      >
        <Loader2 size={48} className="animate-spin text-[#e41e20]" />
      </div>
    );
  }

  return (
    <div
      style={{ background: tk.pageBg, color: tk.pageText }}
      className="-m-8 min-h-screen p-8 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: tk.pageText }}>
            Articles
          </h1>
          <p className="mt-1" style={{ color: tk.mutedText }}>
            Manage your "Let Us Inspire You" articles
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: "#E8192C", color: "#ffffff" }}
        >
          <Plus size={18} />
          Add Article
        </button>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-xl flex items-start gap-3 border"
          style={{
            background: isDark ? "rgba(239,68,68,0.10)" : "#fef2f2",
            borderColor: isDark ? "rgba(239,68,68,0.25)" : "#fecaca",
            color: isDark ? "#f87171" : "#991b1b",
          }}
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Articles", value: articles.length, color: "#E8192C" },
          { label: "Categories", value: new Set(articles.map((a) => a.category)).size, color: "#7c3aed" },
          { label: "With Author", value: articles.filter((a) => a.author).length, color: "#16a34a" },
          { label: "Published", value: articles.filter((a) => a.publishedAt).length, color: "#ea580c" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-4 rounded-xl border"
            style={{
              background: tk.statCardBg,
              borderColor: tk.statCardBorder,
            }}
          >
            <span className="text-sm" style={{ color: tk.mutedText }}>
              {label}
            </span>
            <span className="text-2xl font-bold block" style={{ color }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div
        className="p-4 rounded-xl border flex flex-wrap gap-4 items-center"
        style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
      >
        <div className="relative flex-1 min-w-[250px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: tk.iconMuted }}
          />
          <input
            type="text"
            placeholder="Search articles..."
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
            style={{ ...inputStyle, width: "auto" }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl border"
          style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
        >
          <p style={{ color: tk.mutedText }}>No articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              tk={tk}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: tk.paginationBg,
              borderColor: tk.paginationBorder,
              color: tk.paginationText,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className="px-4 py-2 rounded-lg"
              style={
                page === currentPage
                  ? { background: "#E8192C", color: "#ffffff" }
                  : {
                      background: tk.paginationBg,
                      border: `1px solid ${tk.paginationBorder}`,
                      color: tk.paginationText,
                    }
              }
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: tk.paginationBg,
              borderColor: tk.paginationBorder,
              color: tk.paginationText,
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          style={{
            background: tk.dialogBg,
            color: tk.dialogText,
            maxWidth: 800,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: tk.dialogText }}>
              {dialogMode === "create" && "Add Article"}
              {dialogMode === "edit" && "Edit Article"}
              {dialogMode === "view" && "Article Details"}
            </DialogTitle>
            <DialogDescription style={{ color: tk.mutedText }}>
              {dialogMode === "create" && "Create a new inspirational article"}
              {dialogMode === "edit" && "Update the article details"}
              {dialogMode === "view" && "View the full article details"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.title.en || ""}
                onChange={(e) => handleTranslatedChange("title", "en", e.target.value)}
                placeholder="Article title in English"
                disabled={dialogMode === "view"}
                style={inputStyle}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={dialogMode === "view"}
                style={inputStyle}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                  Author
                </label>
                <input
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  disabled={dialogMode === "view"}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                  Published Date
                </label>
                <input
                  name="publishedAt"
                  type="date"
                  value={formData.publishedAt}
                  onChange={handleInputChange}
                  disabled={dialogMode === "view"}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={16} className="text-[#E8192C]" />
                <span className="text-sm font-medium" style={{ color: tk.dimText }}>
                  Translations
                </span>
              </div>
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: tk.tabBg }}>
                {SUPPORTED_LOCALES.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setActiveLocaleTab(locale)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                    style={
                      activeLocaleTab === locale
                        ? {
                            background: tk.tabActiveBg,
                            color: tk.tabActiveText,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                          }
                        : { color: tk.tabInactiveText }
                    }
                  >
                    {LOCALE_LABELS[locale]}
                    {locale === "en" && <span className="text-red-500 ml-1">*</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                Title ({LOCALE_LABELS[activeLocaleTab]})
              </label>
              <input
                value={formData.title[activeLocaleTab] || ""}
                onChange={(e) => handleTranslatedChange("title", activeLocaleTab, e.target.value)}
                placeholder={`Article title in ${LOCALE_LABELS[activeLocaleTab]}`}
                disabled={dialogMode === "view"}
                style={inputStyle}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                Excerpt ({LOCALE_LABELS[activeLocaleTab]})
              </label>
              <textarea
                value={formData.excerpt[activeLocaleTab] || ""}
                onChange={(e) => handleTranslatedChange("excerpt", activeLocaleTab, e.target.value)}
                rows={3}
                placeholder="Short excerpt/summary"
                disabled={dialogMode === "view"}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                Content ({LOCALE_LABELS[activeLocaleTab]})
              </label>
              <textarea
                value={formData.content[activeLocaleTab] || ""}
                onChange={(e) => handleTranslatedChange("content", activeLocaleTab, e.target.value)}
                rows={10}
                placeholder="Full article content..."
                disabled={dialogMode === "view"}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {dialogMode !== "view" && (
              <ImageUpload
                propertyType="Article"
                onImagesSelected={(files) => setSelectedImageFiles(files)}
                selectedFiles={selectedImageFiles}
                onRemoveFile={(index) =>
                  setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index))
                }
                existingImages={formData.imageUrls}
                onRemoveExisting={(url) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageUrls: prev.imageUrls.filter((img) => img !== url),
                  }))
                }
                maxImages={10}
                isLoading={saving}
              />
            )}

            {dialogMode === "view" && formData.imageUrls.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                  Images
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Article ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {dialogMode !== "view" && (
              <>
                <button
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50 transition-colors"
                  style={{
                    background: tk.filterBtnBg,
                    color: tk.filterBtnText,
                    borderColor: tk.cardBorder,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                  style={{ background: "#E8192C", color: "#ffffff" }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : dialogMode === "create" ? "Create" : "Update"}
                </button>
              </>
            )}
            {dialogMode === "view" && (
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: tk.filterBtnBg,
                  color: tk.filterBtnText,
                  border: `1px solid ${tk.cardBorder}`,
                }}
              >
                Close
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ArticleCardProps {
  article: Article;
  onView: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  tk: TkMap;
  isDark: boolean;
}

function ArticleCard({ article, onView, onEdit, onDelete, tk, isDark }: ArticleCardProps) {
  const { localize } = useLocalized();

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-shadow hover:shadow-xl"
      style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
    >
      <div
        className="h-48 relative overflow-hidden"
        style={{ background: tk.filterBtnBg }}
      >
        {article.imageUrls && article.imageUrls.length > 0 ? (
          <img
            src={article.imageUrls[0]}
            alt={localize(article.title)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "#e5e2de",
            }}
          >
            <Globe size={48} style={{ color: tk.iconMuted }} />
          </div>
        )}
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: isDark ? "rgba(232,25,44,0.2)" : "#fef2f2",
            color: "#E8192C",
          }}
        >
          {article.category}
        </div>
      </div>

      <div className="p-4">
        <h3
          className="font-bold text-lg mb-2 line-clamp-1"
          style={{ color: tk.pageText }}
        >
          {localize(article.title)}
        </h3>
        <p
          className="text-sm mb-3 line-clamp-2"
          style={{ color: tk.mutedText }}
        >
          {localize(article.excerpt)}
        </p>

        {(publishedDate || article.author) && (
          <div
            className="flex items-center gap-3 text-xs mb-3"
            style={{ color: tk.iconMuted }}
          >
            {publishedDate && (
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {publishedDate}
              </span>
            )}
            {article.author && (
              <span className="flex items-center gap-1">
                <User size={13} />
                {article.author}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onView(article)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              background: tk.filterBtnBg,
              color: tk.filterBtnText,
              borderColor: tk.cardBorder,
            }}
          >
            <Eye size={15} />
            View
          </button>
          <button
            onClick={() => onEdit(article)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              background: tk.filterBtnBg,
              color: tk.filterBtnText,
              borderColor: tk.cardBorder,
            }}
          >
            <Edit size={15} />
            Edit
          </button>
          <button
            onClick={() => onDelete(article)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: isDark ? "rgba(239,68,68,0.10)" : "#fef2f2",
              color: isDark ? "#f87171" : "#991b1b",
              border: `1px solid ${isDark ? "rgba(239,68,68,0.20)" : "#fecaca"}`,
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
