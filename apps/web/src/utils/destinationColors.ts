export interface CategoryColorStyle {
  bg: string;
  border: string;
  text: string;
  hoverBg: string;
  hoverText: string;
  badgeBg: string;
  badgeText: string;
}

const CATEGORY_MAP_LIGHT: Record<string, CategoryColorStyle> = {
  // Main categories
  Beach: { bg: "#e0f2fe", border: "#0284c7", text: "#0369a1", hoverBg: "#0284c7", hoverText: "#ffffff", badgeBg: "bg-sky-100", badgeText: "text-sky-800" },
  Historic: { bg: "#fef3c7", border: "#d97706", text: "#92400e", hoverBg: "#d97706", hoverText: "#ffffff", badgeBg: "bg-amber-100", badgeText: "text-amber-800" },
  Adventure: { bg: "#ffedd5", border: "#ea580c", text: "#9a3412", hoverBg: "#ea580c", hoverText: "#ffffff", badgeBg: "bg-orange-100", badgeText: "text-orange-800" },
  Nature: { bg: "#dcfce7", border: "#16a34a", text: "#166534", hoverBg: "#16a34a", hoverText: "#ffffff", badgeBg: "bg-emerald-100", badgeText: "text-emerald-800" },
  Culture: { bg: "#ede9fe", border: "#7c3aed", text: "#5b21b6", hoverBg: "#7c3aed", hoverText: "#ffffff", badgeBg: "bg-purple-100", badgeText: "text-purple-800" },
  Culinary: { bg: "#ffe4e6", border: "#e11d48", text: "#9f1239", hoverBg: "#e11d48", hoverText: "#ffffff", badgeBg: "bg-rose-100", badgeText: "text-rose-800" },
  Urban: { bg: "#e0e7ff", border: "#4f46e5", text: "#3730a3", hoverBg: "#4f46e5", hoverText: "#ffffff", badgeBg: "bg-indigo-100", badgeText: "text-indigo-800" },
  Relaxation: { bg: "#ccfbf1", border: "#0d9488", text: "#115e59", hoverBg: "#0d9488", hoverText: "#ffffff", badgeBg: "bg-teal-100", badgeText: "text-teal-800" },

  // Specific Subcategories from destinationManagement.ts
  "Top cities & villages": { bg: "#e0e7ff", border: "#4f46e5", text: "#3730a3", hoverBg: "#4f46e5", hoverText: "#ffffff", badgeBg: "bg-indigo-100", badgeText: "text-indigo-800" },
  "Mountains": { bg: "#dcfce7", border: "#16a34a", text: "#166534", hoverBg: "#16a34a", hoverText: "#ffffff", badgeBg: "bg-emerald-100", badgeText: "text-emerald-800" },
  "Lakes & canyons": { bg: "#cff4fc", border: "#0891b2", text: "#164e63", hoverBg: "#0891b2", hoverText: "#ffffff", badgeBg: "bg-cyan-100", badgeText: "text-cyan-800" },
  "Restaurants": { bg: "#ffedd5", border: "#f97316", text: "#9a3412", hoverBg: "#f97316", hoverText: "#ffffff", badgeBg: "bg-orange-100", badgeText: "text-orange-800" },
  "Bars": { bg: "#fef3c7", border: "#d97706", text: "#92400e", hoverBg: "#d97706", hoverText: "#ffffff", badgeBg: "bg-amber-100", badgeText: "text-amber-800" },
  "Pubs": { bg: "#fee2e2", border: "#ef4444", text: "#991b1b", hoverBg: "#ef4444", hoverText: "#ffffff", badgeBg: "bg-red-100", badgeText: "text-red-800" },
  "Clubs": { bg: "#f3e8ff", border: "#9333ea", text: "#6b21a8", hoverBg: "#9333ea", hoverText: "#ffffff", badgeBg: "bg-purple-100", badgeText: "text-purple-800" },
  "Historical & archeological sites": { bg: "#fef3c7", border: "#b45309", text: "#78350f", hoverBg: "#b45309", hoverText: "#ffffff", badgeBg: "bg-amber-100", badgeText: "text-amber-800" },
  "Museums & galleries": { bg: "#fce7f3", border: "#db2777", text: "#9d174d", hoverBg: "#db2777", hoverText: "#ffffff", badgeBg: "bg-pink-100", badgeText: "text-pink-800" },
  "UNESCO sites": { bg: "#fffbe8", border: "#ca8a04", text: "#854d0e", hoverBg: "#ca8a04", hoverText: "#ffffff", badgeBg: "bg-yellow-100", badgeText: "text-yellow-800" },
  "Breathtaking/Adventure": { bg: "#ffedd5", border: "#ea580c", text: "#9a3412", hoverBg: "#ea580c", hoverText: "#ffffff", badgeBg: "bg-orange-100", badgeText: "text-orange-800" },
  "Sea activities": { bg: "#e0f2fe", border: "#0284c7", text: "#0369a1", hoverBg: "#0284c7", hoverText: "#ffffff", badgeBg: "bg-sky-100", badgeText: "text-sky-800" },
  "On high altitude": { bg: "#ccfbf1", border: "#0d9488", text: "#115e59", hoverBg: "#0d9488", hoverText: "#ffffff", badgeBg: "bg-teal-100", badgeText: "text-teal-800" },
  "Religious Sites": { bg: "#ede9fe", border: "#7c3aed", text: "#5b21b6", hoverBg: "#7c3aed", hoverText: "#ffffff", badgeBg: "bg-violet-100", badgeText: "text-violet-800" },
  "Traditional Festivals & Events": { bg: "#fce7f3", border: "#db2777", text: "#9d174d", hoverBg: "#db2777", hoverText: "#ffffff", badgeBg: "bg-pink-100", badgeText: "text-pink-800" },
};

const CATEGORY_MAP_DARK: Record<string, CategoryColorStyle> = {
  // Main categories
  Beach: { bg: "rgba(2, 132, 199, 0.25)", border: "#38bdf8", text: "#7dd3fc", hoverBg: "#0284c7", hoverText: "#ffffff", badgeBg: "bg-sky-950/70", badgeText: "text-sky-300" },
  Historic: { bg: "rgba(217, 119, 6, 0.25)", border: "#fbbf24", text: "#fde68a", hoverBg: "#b45309", hoverText: "#ffffff", badgeBg: "bg-amber-950/70", badgeText: "text-amber-300" },
  Adventure: { bg: "rgba(234, 88, 12, 0.25)", border: "#fb923c", text: "#ffedd5", hoverBg: "#c2410c", hoverText: "#ffffff", badgeBg: "bg-orange-950/70", badgeText: "text-orange-300" },
  Nature: { bg: "rgba(22, 163, 74, 0.25)", border: "#4ade80", text: "#bbf7d0", hoverBg: "#15803d", hoverText: "#ffffff", badgeBg: "bg-emerald-950/70", badgeText: "text-emerald-300" },
  Culture: { bg: "rgba(124, 58, 237, 0.25)", border: "#a78bfa", text: "#ddd6fe", hoverBg: "#6d28d9", hoverText: "#ffffff", badgeBg: "bg-purple-950/70", badgeText: "text-purple-300" },
  Culinary: { bg: "rgba(225, 29, 72, 0.25)", border: "#fb7185", text: "#fecdd3", hoverBg: "#be123c", hoverText: "#ffffff", badgeBg: "bg-rose-950/70", badgeText: "text-rose-300" },
  Urban: { bg: "rgba(79, 70, 229, 0.25)", border: "#818cf8", text: "#c7d2fe", hoverBg: "#4338ca", hoverText: "#ffffff", badgeBg: "bg-indigo-950/70", badgeText: "text-indigo-300" },
  Relaxation: { bg: "rgba(13, 148, 136, 0.25)", border: "#2dd4bf", text: "#99f6e4", hoverBg: "#0f766e", hoverText: "#ffffff", badgeBg: "bg-teal-950/70", badgeText: "text-teal-300" },

  // Specific Subcategories
  "Top cities & villages": { bg: "rgba(79, 70, 229, 0.25)", border: "#818cf8", text: "#c7d2fe", hoverBg: "#4338ca", hoverText: "#ffffff", badgeBg: "bg-indigo-950/70", badgeText: "text-indigo-300" },
  "Mountains": { bg: "rgba(22, 163, 74, 0.25)", border: "#4ade80", text: "#bbf7d0", hoverBg: "#15803d", hoverText: "#ffffff", badgeBg: "bg-emerald-950/70", badgeText: "text-emerald-300" },
  "Lakes & canyons": { bg: "rgba(8, 145, 178, 0.25)", border: "#22d3ee", text: "#a5f3fc", hoverBg: "#0891b2", hoverText: "#ffffff", badgeBg: "bg-cyan-950/70", badgeText: "text-cyan-300" },
  "Restaurants": { bg: "rgba(249, 115, 22, 0.25)", border: "#fb923c", text: "#ffedd5", hoverBg: "#ea580c", hoverText: "#ffffff", badgeBg: "bg-orange-950/70", badgeText: "text-orange-300" },
  "Bars": { bg: "rgba(217, 119, 6, 0.25)", border: "#fbbf24", text: "#fde68a", hoverBg: "#b45309", hoverText: "#ffffff", badgeBg: "bg-amber-950/70", badgeText: "text-amber-300" },
  "Pubs": { bg: "rgba(239, 68, 68, 0.25)", border: "#f87171", text: "#fca5a5", hoverBg: "#dc2626", hoverText: "#ffffff", badgeBg: "bg-red-950/70", badgeText: "text-red-300" },
  "Clubs": { bg: "rgba(147, 51, 234, 0.25)", border: "#c084fc", text: "#e9d5ff", hoverBg: "#7e22ce", hoverText: "#ffffff", badgeBg: "bg-purple-950/70", badgeText: "text-purple-300" },
  "Historical & archeological sites": { bg: "rgba(180, 83, 9, 0.25)", border: "#f59e0b", text: "#fde68a", hoverBg: "#b45309", hoverText: "#ffffff", badgeBg: "bg-amber-950/70", badgeText: "text-amber-300" },
  "Museums & galleries": { bg: "rgba(219, 39, 119, 0.25)", border: "#f472b6", text: "#fbcfe8", hoverBg: "#be185d", hoverText: "#ffffff", badgeBg: "bg-pink-950/70", badgeText: "text-pink-300" },
  "UNESCO sites": { bg: "rgba(202, 138, 4, 0.25)", border: "#facc15", text: "#fef08a", hoverBg: "#a16207", hoverText: "#ffffff", badgeBg: "bg-yellow-950/70", badgeText: "text-yellow-300" },
  "Breathtaking/Adventure": { bg: "rgba(234, 88, 12, 0.25)", border: "#fb923c", text: "#ffedd5", hoverBg: "#c2410c", hoverText: "#ffffff", badgeBg: "bg-orange-950/70", badgeText: "text-orange-300" },
  "Sea activities": { bg: "rgba(2, 132, 199, 0.25)", border: "#38bdf8", text: "#7dd3fc", hoverBg: "#0284c7", hoverText: "#ffffff", badgeBg: "bg-sky-950/70", badgeText: "text-sky-300" },
  "On high altitude": { bg: "rgba(13, 148, 136, 0.25)", border: "#2dd4bf", text: "#99f6e4", hoverBg: "#0f766e", hoverText: "#ffffff", badgeBg: "bg-teal-950/70", badgeText: "text-teal-300" },
  "Religious Sites": { bg: "rgba(124, 58, 237, 0.25)", border: "#a78bfa", text: "#ddd6fe", hoverBg: "#6d28d9", hoverText: "#ffffff", badgeBg: "bg-purple-950/70", badgeText: "text-purple-300" },
  "Traditional Festivals & Events": { bg: "rgba(219, 39, 119, 0.25)", border: "#f472b6", text: "#fbcfe8", hoverBg: "#be185d", hoverText: "#ffffff", badgeBg: "bg-pink-950/70", badgeText: "text-pink-300" },
};

const PALETTES_LIGHT: CategoryColorStyle[] = [
  { bg: "#e0f2fe", border: "#0284c7", text: "#0369a1", hoverBg: "#0284c7", hoverText: "#ffffff", badgeBg: "bg-sky-100", badgeText: "text-sky-800" },
  { bg: "#fef3c7", border: "#d97706", text: "#92400e", hoverBg: "#d97706", hoverText: "#ffffff", badgeBg: "bg-amber-100", badgeText: "text-amber-800" },
  { bg: "#ffedd5", border: "#ea580c", text: "#9a3412", hoverBg: "#ea580c", hoverText: "#ffffff", badgeBg: "bg-orange-100", badgeText: "text-orange-800" },
  { bg: "#dcfce7", border: "#16a34a", text: "#166534", hoverBg: "#16a34a", hoverText: "#ffffff", badgeBg: "bg-emerald-100", badgeText: "text-emerald-800" },
  { bg: "#ede9fe", border: "#7c3aed", text: "#5b21b6", hoverBg: "#7c3aed", hoverText: "#ffffff", badgeBg: "bg-purple-100", badgeText: "text-purple-800" },
  { bg: "#ffe4e6", border: "#e11d48", text: "#9f1239", hoverBg: "#e11d48", hoverText: "#ffffff", badgeBg: "bg-rose-100", badgeText: "text-rose-800" },
  { bg: "#e0e7ff", border: "#4f46e5", text: "#3730a3", hoverBg: "#4f46e5", hoverText: "#ffffff", badgeBg: "bg-indigo-100", badgeText: "text-indigo-800" },
  { bg: "#ccfbf1", border: "#0d9488", text: "#115e59", hoverBg: "#0d9488", hoverText: "#ffffff", badgeBg: "bg-teal-100", badgeText: "text-teal-800" },
  { bg: "#fce7f3", border: "#db2777", text: "#9d174d", hoverBg: "#db2777", hoverText: "#ffffff", badgeBg: "bg-pink-100", badgeText: "text-pink-800" },
  { bg: "#f3f4f6", border: "#4b5563", text: "#1f2937", hoverBg: "#4b5563", hoverText: "#ffffff", badgeBg: "bg-gray-100", badgeText: "text-gray-800" },
];

const PALETTES_DARK: CategoryColorStyle[] = [
  { bg: "rgba(2, 132, 199, 0.25)", border: "#38bdf8", text: "#7dd3fc", hoverBg: "#0284c7", hoverText: "#ffffff", badgeBg: "bg-sky-950/70", badgeText: "text-sky-300" },
  { bg: "rgba(217, 119, 6, 0.25)", border: "#fbbf24", text: "#fde68a", hoverBg: "#b45309", hoverText: "#ffffff", badgeBg: "bg-amber-950/70", badgeText: "text-amber-300" },
  { bg: "rgba(234, 88, 12, 0.25)", border: "#fb923c", text: "#ffedd5", hoverBg: "#c2410c", hoverText: "#ffffff", badgeBg: "bg-orange-950/70", badgeText: "text-orange-300" },
  { bg: "rgba(22, 163, 74, 0.25)", border: "#4ade80", text: "#bbf7d0", hoverBg: "#15803d", hoverText: "#ffffff", badgeBg: "bg-emerald-950/70", badgeText: "text-emerald-300" },
  { bg: "rgba(124, 58, 237, 0.25)", border: "#a78bfa", text: "#ddd6fe", hoverBg: "#6d28d9", hoverText: "#ffffff", badgeBg: "bg-purple-950/70", badgeText: "text-purple-300" },
  { bg: "rgba(225, 29, 72, 0.25)", border: "#fb7185", text: "#fecdd3", hoverBg: "#be123c", hoverText: "#ffffff", badgeBg: "bg-rose-950/70", badgeText: "text-rose-300" },
  { bg: "rgba(79, 70, 229, 0.25)", border: "#818cf8", text: "#c7d2fe", hoverBg: "#4338ca", hoverText: "#ffffff", badgeBg: "bg-indigo-950/70", badgeText: "text-indigo-300" },
  { bg: "rgba(13, 148, 136, 0.25)", border: "#2dd4bf", text: "#99f6e4", hoverBg: "#0f766e", hoverText: "#ffffff", badgeBg: "bg-teal-950/70", badgeText: "text-teal-300" },
  { bg: "rgba(219, 39, 119, 0.25)", border: "#f472b6", text: "#fbcfe8", hoverBg: "#be185d", hoverText: "#ffffff", badgeBg: "bg-pink-950/70", badgeText: "text-pink-300" },
  { bg: "rgba(75, 85, 99, 0.25)", border: "#9ca3af", text: "#e5e7eb", hoverBg: "#374151", hoverText: "#ffffff", badgeBg: "bg-gray-800", badgeText: "text-gray-200" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDestinationCategoryColor(category: string, isDark: boolean = false): CategoryColorStyle {
  if (!category) {
    return isDark ? PALETTES_DARK[0] : PALETTES_LIGHT[0];
  }

  const map = isDark ? CATEGORY_MAP_DARK : CATEGORY_MAP_LIGHT;
  const palettes = isDark ? PALETTES_DARK : PALETTES_LIGHT;

  if (map[category]) {
    return map[category];
  }

  const normalized = category.trim().toLowerCase();
  for (const key of Object.keys(map)) {
    if (key.toLowerCase() === normalized) {
      return map[key];
    }
  }

  const index = hashString(category) % palettes.length;
  return palettes[index];
}

/**
 * Returns inline SVG markup for subcategory icons
 */
export function getSubcategoryIconSvg(subcategory?: string, category?: string): string {
  const key = (subcategory || category || "").trim().toLowerCase();

  // Top cities & villages
  if (key.includes("city") || key.includes("village") || key.includes("town") || key.includes("urban")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
  }

  // Mountains & High altitude
  if (key.includes("mountain") || key.includes("altitude") || key.includes("peak") || key.includes("hiking")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
  }

  // Beach
  if (key.includes("beach") || key.includes("coast") || key.includes("sand")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  }

  // Lakes, Canyons & Sea activities
  if (key.includes("lake") || key.includes("canyon") || key.includes("water") || key.includes("sea") || key.includes("river")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
  }

  // Restaurants & Dining
  if (key.includes("restaurant") || key.includes("food") || key.includes("eat") || key.includes("dining")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20"/><path d="M18 8h3v1a4 4 0 0 1-4 4h-2"/><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/></svg>`;
  }

  // Bars & Drinks
  if (key.includes("bar") || key.includes("drink") || key.includes("cocktail")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.8 17.21A2 2 0 0 1 15.2 22z"/><path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/></svg>`;
  }

  // Pubs
  if (key.includes("pub") || key.includes("beer")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12v6"/><path d="M13 12v6"/><path d="M14 7.5c-1 0-1.44.5-2 .5s-1-.5-2-.5-1.44.5-2 .5-1-.5-2-.5"/><path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><path d="M6 8A2 2 0 0 1 8 6h8a2 2 0 0 1 2 2"/></svg>`;
  }

  // Clubs & Music
  if (key.includes("club") || key.includes("dance") || key.includes("night")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
  }

  // Religious Sites
  if (key.includes("religious") || key.includes("church") || key.includes("mosque") || key.includes("temple") || key.includes("shrine")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M10 4h4"/><path d="M6 22V10l6-4 6 4v12"/><path d="M9 22v-6a3 3 0 0 1 6 0v6"/></svg>`;
  }

  // Traditional Festivals & Events
  if (key.includes("festival") || key.includes("event") || key.includes("celebration") || key.includes("tradition")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>`;
  }

  // Historical & archeological sites / History
  if (key.includes("historic") || key.includes("archeolog") || key.includes("history") || key.includes("castle") || key.includes("ruin")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/></svg>`;
  }

  // Museums & galleries
  if (key.includes("museum") || key.includes("gallery") || key.includes("art")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>`;
  }

  // UNESCO sites
  if (key.includes("unesco") || key.includes("heritage")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`;
  }

  // Breathtaking/Adventure
  if (key.includes("adventure") || key.includes("breathtaking") || key.includes("experience")) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
  }

  // Default Compass SVG
  return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
}
