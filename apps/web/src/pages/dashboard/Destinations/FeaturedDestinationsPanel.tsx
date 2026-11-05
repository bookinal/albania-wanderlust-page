import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronsUpDown,
  ImageOff,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Destination } from "@/types/destination.types";
import { setFeaturedDestinations } from "@/services/api/destinationService";
import { useLocalized } from "@/hooks/useLocalized";
import {
  FEATURED_DESTINATIONS_QUERY_KEY,
  useFeaturedDestinations,
} from "@/hooks/useDestinations";

/** Same limit as set_featured_destinations in the database */
const FEATURED_SLOTS = 10;

interface FeaturedDestinationsPanelProps {
  destinations: Destination[];
  tk: {
    cardBg: string;
    cardBorder: string;
    pageText: string;
    mutedText: string;
    statCardBg: string;
    statCardBorder: string;
    iconMuted: string;
    dialogBg: string;
    filterBtnBg: string;
  };
  inputStyle: React.CSSProperties;
}

const toSlots = (ids: string[]) =>
  Array.from({ length: FEATURED_SLOTS }, (_, i) => ids[i] ?? "");

/** Lower case without accents, so "vlore" finds "Vlorë" */
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

interface SlotOption {
  id: string;
  name: string;
  location: string;
  image?: string;
  searchText: string;
}

interface SlotPickerProps {
  label: string;
  value: string;
  selectedName: string;
  options: SlotOption[];
  takenElsewhere: Map<string, number>;
  onSelect: (id: string) => void;
  tk: FeaturedDestinationsPanelProps["tk"];
  inputStyle: React.CSSProperties;
}

/** Searchable destination picker for one slot. */
const SlotPicker = ({
  label,
  value,
  selectedName,
  options,
  takenElsewhere,
  onSelect,
  tk,
  inputStyle,
}: SlotPickerProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(() => {
    const q = normalize(query.trim());
    return q ? options.filter((o) => o.searchText.includes(q)) : options;
  }, [options, query]);

  const selectable = matches.filter((o) => !takenElsewhere.has(o.id));

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const pick = (id: string) => {
    onSelect(id);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, selectable.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectable[activeIndex]) {
      e.preventDefault();
      pick(selectable[activeIndex].id);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex items-center justify-between gap-2 text-left"
          style={inputStyle}
        >
          <span
            className="truncate"
            style={{ color: value ? undefined : tk.mutedText }}
          >
            {value
              ? selectedName
              : t("destinationsManagement.featured.chooseDestination")}
          </span>
          <ChevronsUpDown size={16} style={{ color: tk.iconMuted, flexShrink: 0 }} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0 overflow-hidden"
        style={{
          width: "max(var(--radix-popover-trigger-width), 18rem)",
          background: tk.dialogBg,
          color: tk.pageText,
          borderColor: tk.cardBorder,
        }}
      >
        <div
          className="relative border-b"
          style={{ borderColor: tk.cardBorder }}
        >
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: tk.iconMuted }}
          />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("destinationsManagement.featured.searchPlaceholder")}
            aria-label={t("destinationsManagement.featured.searchPlaceholder")}
            className="w-full bg-transparent py-3 pr-3 text-sm outline-none"
            style={{ paddingLeft: 36, color: tk.pageText }}
          />
        </div>

        <div role="listbox" aria-label={label} className="max-h-72 overflow-y-auto p-1">
          {matches.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm" style={{ color: tk.mutedText }}>
              {t("destinationsManagement.featured.noResults")}
            </p>
          ) : (
            matches.map((option) => {
              const takenSlot = takenElsewhere.get(option.id);
              const isActive = selectable[activeIndex]?.id === option.id;
              const isSelected = option.id === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={takenSlot !== undefined}
                  onClick={() => pick(option.id)}
                  onMouseEnter={() => {
                    const i = selectable.findIndex((o) => o.id === option.id);
                    if (i >= 0) setActiveIndex(i);
                  }}
                  className="w-full flex items-center gap-3 rounded-lg px-2 py-1.5 text-left disabled:cursor-not-allowed disabled:opacity-45"
                  style={{ background: isActive ? tk.filterBtnBg : "transparent" }}
                >
                  <div
                    className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(127,127,127,0.12)" }}
                  >
                    {option.image ? (
                      <img src={option.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff size={14} style={{ color: tk.iconMuted }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: tk.pageText }}>
                      {option.name}
                    </p>
                    {option.location && (
                      <p className="truncate text-xs" style={{ color: tk.mutedText }}>
                        {option.location}
                      </p>
                    )}
                  </div>
                  {takenSlot !== undefined ? (
                    <span className="text-xs flex-shrink-0" style={{ color: tk.mutedText }}>
                      {t("destinationsManagement.featured.inSlot", { number: takenSlot })}
                    </span>
                  ) : (
                    isSelected && <Check size={16} style={{ color: "#E8192C", flexShrink: 0 }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/** Admin picker for the "Picked for you" section of the home page. */
export const FeaturedDestinationsPanel = ({
  destinations,
  tk,
  inputStyle,
}: FeaturedDestinationsPanelProps) => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const queryClient = useQueryClient();
  // No "= []" default here: a new array on each render would reset the slots
  const { data: featured, isLoading, error } = useFeaturedDestinations();

  const savedSlots = useMemo(
    () => toSlots((featured ?? []).map((d) => d.id)),
    [featured],
  );
  const [slots, setSlots] = useState<string[]>(savedSlots);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSlots(savedSlots);
  }, [savedSlots]);

  const options = useMemo<SlotOption[]>(
    () =>
      destinations
        .map((d) => {
          const name = localize(d.name) || d.id;
          return {
            id: d.id,
            name,
            location: d.location ?? "",
            image: d.imageUrls?.[0],
            searchText: normalize(`${name} ${d.location ?? ""}`),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [destinations, localize],
  );

  const byId = useMemo(
    () => new Map(destinations.map((d) => [d.id, d])),
    [destinations],
  );

  const isDirty = slots.some((id, i) => id !== savedSlots[i]);
  const pickedCount = slots.filter(Boolean).length;

  const setSlot = (index: number, id: string) =>
    setSlots((prev) => prev.map((value, i) => (i === index ? id : value)));

  const handleSave = async () => {
    try {
      setSaving(true);
      await setFeaturedDestinations(slots.filter(Boolean));
      await queryClient.invalidateQueries({
        queryKey: FEATURED_DESTINATIONS_QUERY_KEY,
      });
      Swal.fire(
        t("destinationsManagement.featured.savedTitle"),
        t("destinationsManagement.featured.savedMessage"),
        "success",
      );
    } catch (err) {
      console.error("Error saving featured destinations:", err);
      Swal.fire(
        t("destinationsManagement.featured.saveFailedTitle"),
        t("destinationsManagement.featured.saveFailedMessage"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="p-5 rounded-xl border space-y-4"
      style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(232,25,44,0.12)" }}
          >
            <Sparkles size={18} style={{ color: "#E8192C" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: tk.pageText }}>
              {t("destinationsManagement.featured.title")}
            </h2>
            <p className="text-sm" style={{ color: tk.mutedText }}>
              {t("destinationsManagement.featured.subtitle", {
                count: FEATURED_SLOTS,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: tk.mutedText }}>
            {t("destinationsManagement.featured.pickedCount", {
              count: pickedCount,
              max: FEATURED_SLOTS,
            })}
          </span>
          <button
            type="button"
            onClick={() => setSlots(savedSlots)}
            disabled={!isDirty || saving}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border disabled:opacity-40"
            style={{ borderColor: tk.cardBorder, color: tk.pageText }}
          >
            <RotateCcw size={16} />
            {t("destinationsManagement.featured.reset")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{ background: "#E8192C", color: "#ffffff" }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {t("destinationsManagement.featured.save")}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm" style={{ color: "#ef4444" }}>
          {t("destinationsManagement.featured.loadFailed")}
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[#e41e20]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {slots.map((id, index) => {
            const destination = id ? byId.get(id) : undefined;
            const image = destination?.imageUrls?.[0];
            // A destination can only take one slot: id -> slot number
            const takenElsewhere = new Map(
              slots
                .map((value, i) => [value, i + 1] as const)
                .filter(([value, i]) => value && i !== index + 1),
            );

            return (
              <div
                key={index}
                className="rounded-xl border overflow-hidden"
                style={{
                  background: tk.statCardBg,
                  borderColor: tk.statCardBorder,
                }}
              >
                <div
                  className="relative h-28 flex items-center justify-center"
                  style={{ background: "rgba(127,127,127,0.10)" }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={localize(destination!.name)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff size={22} style={{ color: tk.iconMuted }} />
                  )}
                  <span
                    className="absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: "rgba(2,6,23,0.6)", color: "#ffffff" }}
                  >
                    #{index + 1}
                  </span>
                  {id && (
                    <button
                      type="button"
                      onClick={() => setSlot(index, "")}
                      aria-label={t("destinationsManagement.featured.clearSlot")}
                      title={t("destinationsManagement.featured.clearSlot")}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(2,6,23,0.6)", color: "#ffffff" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="p-3">
                  <SlotPicker
                    label={t("destinationsManagement.featured.slotLabel", {
                      number: index + 1,
                    })}
                    value={id}
                    selectedName={destination ? localize(destination.name) : ""}
                    options={options}
                    takenElsewhere={takenElsewhere}
                    onSelect={(value) => setSlot(index, value)}
                    tk={tk}
                    inputStyle={inputStyle}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
