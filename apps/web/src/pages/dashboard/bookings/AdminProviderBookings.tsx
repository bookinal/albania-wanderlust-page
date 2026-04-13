import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Booking } from "@/types/booking.type";
import { User } from "@/types/user.types";
import { getBookingsByProviderIdForAdmin } from "@/services/api/bookingService";
import { userService } from "@/services/api/userService";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowLeft,
  Search,
  Car,
  Building2,
  Home,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  User as UserIcon,
  AlertTriangle,
  Filter,
} from "lucide-react";


// ── helpers ────────────────────────────────────────────────────────────────

const getInitials = (name?: string, email?: string) => {
  if (name) {
    const p = name.trim().split(" ");
    return p.length >= 2
      ? `${p[0][0]}${p[1][0]}`.toUpperCase()
      : p[0].slice(0, 2).toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : "??";
};

const AVATAR_COLORS = [
  "from-rose-600 to-red-800",
  "from-amber-500 to-orange-700",
  "from-emerald-500 to-teal-700",
  "from-sky-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-pink-500 to-rose-700",
];
const avatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];

const PropertyIcon = ({ type }: { type: string }) => {
  if (type === "car") return <Car className="h-4 w-4" />;
  if (type === "apartment") return <Home className="h-4 w-4" />;
  return <Building2 className="h-4 w-4" />;
};

const getPropertyName = (booking: Booking): string => {
  const pd = booking.propertyData;
  if (!pd) return booking.propertyId.slice(0, 8) + "…";
  if (booking.propertyType === "car") {
    const c = pd as any;
    return c.name || c.model || "Car";
  }
  if (booking.propertyType === "apartment") {
    const a = pd as any;
    return a.name || a.title || "Apartment";
  }
  const h = pd as any;
  return h.name || h.title || "Hotel";
};

// ── status helpers ─────────────────────────────────────────────────────────

type BookingStatus = "pending" | "confirmed" | "canceled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  canceled: {
    label: "Canceled",
    icon: <XCircle className="h-3 w-3" />,
    cls: "bg-red-500/10 text-red-400 border-red-500/20",
  }
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "text-amber-400" },
  paid: { label: "Paid", cls: "text-emerald-400" },
  failed: { label: "Failed", cls: "text-red-400" },
  refunded: { label: "Refunded", cls: "text-sky-400" },
};

// ── main component ─────────────────────────────────────────────────────────

const AdminProviderBookings: React.FC = () => {
  const { t } = useTranslation();
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    headerBg: isDark ? '#111111' : '#ffffff',
    headerBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#faf8f5',
    inputBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    inputText: isDark ? '#ffffff' : '#111115',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    statBg: isDark ? 'rgba(255,255,255,0.03)' : '#f5f2ee',
    statBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    labelText: isDark ? 'rgba(255,255,255,0.25)' : '#9e9994',
    divider: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    emptyBg: isDark ? 'rgba(255,255,255,0.03)' : '#f0ece8',
    emptyBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    emptyIcon: isDark ? 'rgba(255,255,255,0.20)' : '#b8b4b0',
    iconMuted: isDark ? 'rgba(255,255,255,0.30)' : '#b8b4b0',
    iconRow: isDark ? 'rgba(255,255,255,0.06)' : '#f0ece8',
    typeTag: isDark ? 'rgba(255,255,255,0.05)' : '#ede9e5',
    backBtn: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
  };

  // Provider can be passed via navigation state for instant render
  const stateProvider = (location.state as { provider?: User })?.provider;

  const [provider, setProvider] = useState<User | null>(stateProvider ?? null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!providerId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [bkgs, prov] = await Promise.all([
          getBookingsByProviderIdForAdmin(providerId),
          stateProvider
            ? Promise.resolve(stateProvider)
            : userService.getUserById(providerId),
        ]);
        setBookings(bkgs);
        setProvider(prov);
      } catch (err) {
        console.error("Failed to load provider bookings:", err);
        setError(t("adminProviderBookings.error"));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  // ── stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const canceled = bookings.filter((b) => b.status === "canceled").length;
    const revenue = bookings
      .filter((b) => b.status === "confirmed" && b.payment_status === "paid")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return { total, pending, confirmed, canceled, revenue };
  }, [bookings]);

  // ── filter ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.requesterName?.toLowerCase().includes(q) ||
        b.contactMail?.toLowerCase().includes(q) ||
        b.contactPhone?.toLowerCase().includes(q) ||
        getPropertyName(b).toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const matchesType = typeFilter === "all" || b.propertyType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchQuery, statusFilter, typeFilter]);

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="-m-8 min-h-[calc(100vh)]" style={{ background: tk.pageBg, color: tk.pageText }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden px-6 py-6 md:px-10" style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBorder}` }}>
          <div className="pointer-events-none absolute -top-20 right-10 h-60 w-60 rounded-full bg-[#e41e20]/8 blur-3xl" />

          {/* Back */}
          <button
            onClick={() => navigate("/dashboard/bookings/providers")}
            className="mb-4 flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
            style={{ color: tk.backBtn }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("adminProviderBookings.backToProviders")}
          </button>

          {/* Provider identity */}
          {provider && (
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white ${avatarColor(provider.id)}`}
              >
                {provider.avatar_url ? (
                  <img
                    src={provider.avatar_url}
                    alt={provider.full_name || provider.email}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  getInitials(provider.full_name, provider.email)
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: tk.pageText }}>
                  {provider.full_name || t("adminProvidersList.unnamed")}
                </h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs" style={{ color: tk.mutedText }}>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {provider.email}
                  </span>
                  {provider.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {provider.phone}
                    </span>
                  )}
                  {provider.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {provider.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-6 md:px-10">
          {/* ── Stats strip ────────────────────────────────────────── */}
          {!loading && !error && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: t("adminProviderBookings.stats.total"), value: stats.total, color: tk.pageText },
                { label: t("adminProviderBookings.stats.pending"), value: stats.pending, color: "#f59e0b" },
                { label: t("adminProviderBookings.stats.confirmed"), value: stats.confirmed, color: "#10b981" },
                { label: t("adminProviderBookings.stats.canceled"), value: stats.canceled, color: "#f87171" },
                { label: t("adminProviderBookings.stats.revenue"), value: `$${stats.revenue.toLocaleString()}`, color: "#e41e20" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: tk.labelText }}>{s.label}</p>
                  <p className="mt-1 text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Filters ─────────────────────────────────────────────── */}
          {!loading && !error && bookings.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: tk.iconMuted }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("adminProviderBookings.filters.searchPlaceholder")}
                  className="h-10 w-full rounded-xl pl-10 text-sm focus:outline-none"
                  style={{ background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.inputText }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-[150px] rounded-xl appearance-none px-3 text-sm focus:outline-none"
                style={{ background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.inputText }}
              >
                <option value="all">{t("adminProviderBookings.filters.allStatuses")}</option>
                <option value="pending">{t("adminProviderBookings.status.pending")}</option>
                <option value="confirmed">{t("adminProviderBookings.status.confirmed")}</option>
                <option value="canceled">{t("adminProviderBookings.status.canceled")}</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 w-[150px] rounded-xl appearance-none px-3 text-sm focus:outline-none"
                style={{ background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.inputText }}
              >
                <option value="all">{t("adminProviderBookings.filters.allTypes")}</option>
                <option value="car">{t("adminProviderBookings.propertyTypes.car")}</option>
                <option value="apartment">{t("adminProviderBookings.propertyTypes.apartment")}</option>
                <option value="hotel">{t("adminProviderBookings.propertyTypes.hotel")}</option>
              </select>
            </div>
          )}

          {/* ── Loading ──────────────────────────────────────────────── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24" style={{ color: tk.mutedText }}>
              <Loader2 className="h-8 w-8 animate-spin text-[#e41e20]" />
              <p className="mt-3 text-sm">{t("adminProviderBookings.loading")}</p>
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* ── Empty ────────────────────────────────────────────────── */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: tk.emptyBg, border: `1px solid ${tk.emptyBorder}` }}>
                <Calendar className="h-7 w-7" style={{ color: tk.emptyIcon }} />
              </div>
              <p className="text-sm font-medium" style={{ color: tk.mutedText }}>
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? t("adminProviderBookings.noBookingsSearch")
                  : t("adminProviderBookings.noBookings")}
              </p>
            </div>
          )}

          {/* ── Booking Cards ─────────────────────────────────────────── */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((booking) => {
                const statusCfg =
                  STATUS_CONFIG[booking.status as BookingStatus] ??
                  STATUS_CONFIG.pending;
                const paymentCfg =
                  PAYMENT_CONFIG[booking.payment_status as PaymentStatus] ??
                  PAYMENT_CONFIG.pending;
                const propertyName = getPropertyName(booking);

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl p-5 transition-colors"
                    style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }}
                  >
                    {/* top row */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Property info */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: tk.iconRow, color: tk.mutedText }}>
                          <PropertyIcon type={booking.propertyType} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: tk.pageText }}>{propertyName}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider" style={{ background: tk.typeTag, color: tk.mutedText }}>
                              {booking.propertyType}
                            </span>
                            <span className="text-[10px]" style={{ color: tk.labelText }}>
                              #{booking.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status badges */}
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusCfg.cls}`}>
                          {statusCfg.icon}
                          {t(`adminProviderBookings.status.${booking.status}`)}
                        </span>
                      </div>
                    </div>

                    {/* middle row: guest + dates + price */}
                    <div className="mt-4 grid gap-4 pt-4 sm:grid-cols-3" style={{ borderTop: `1px solid ${tk.divider}` }}>
                      {/* Guest */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: tk.labelText }}>
                          {t("adminProviderBookings.table.guest")}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: tk.pageText }}>
                            <UserIcon className="h-3.5 w-3.5" style={{ color: tk.iconMuted }} />
                            {booking.requesterName || "—"}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs" style={{ color: tk.mutedText }}>
                            <Mail className="h-3 w-3" />
                            {booking.contactMail || "—"}
                          </p>
                          {booking.contactPhone && (
                            <p className="flex items-center gap-1.5 text-xs" style={{ color: tk.mutedText }}>
                              <Phone className="h-3 w-3" />
                              {booking.contactPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: tk.labelText }}>
                          {t("adminProviderBookings.table.dates")}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          <p className="flex items-center gap-1.5 text-sm" style={{ color: tk.dimText }}>
                            <Calendar className="h-3.5 w-3.5" style={{ color: tk.iconMuted }} />
                            {new Date(booking.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="ml-5 text-xs" style={{ color: tk.labelText }}>
                            → {new Date(booking.endDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {(booking.pickUpLocation || booking.dropOffLocation) && (
                            <p className="flex items-center gap-1.5 text-xs" style={{ color: tk.labelText }}>
                              <MapPin className="h-3 w-3" />
                              {booking.pickUpLocation}
                              {booking.dropOffLocation && booking.dropOffLocation !== booking.pickUpLocation && ` → ${booking.dropOffLocation}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price & payment */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: tk.labelText }}>
                          {t("adminProviderBookings.table.total")}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xl font-bold" style={{ color: tk.pageText }}>
                          <DollarSign className="h-4 w-4 text-[#e41e20]" />
                          {(booking.totalPrice || 0).toLocaleString()}
                        </p>
                        <p className={`mt-0.5 flex items-center gap-1 text-xs ${paymentCfg.cls}`}>
                          <CreditCard className="h-3 w-3" />
                          {t(`adminProviderBookings.paymentStatus.${booking.payment_status}`)}
                        </p>
                        {booking.paid_at && (
                          <p className="mt-0.5 text-[10px]" style={{ color: tk.labelText }}>
                            {new Date(booking.paid_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cancellation reason (only when canceled) */}
                    {booking.status === "canceled" && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.07] px-4 py-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400/70">
                            {t("adminProviderBookings.table.cancellationReason")}
                          </p>
                          <p className="mt-0.5 text-sm text-red-300/80">
                            {booking.cancellation_reason || t("adminProviderBookings.noCancellationReason")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Created at */}
                    <p className="mt-3 text-[10px]" style={{ color: tk.labelText }}>
                      {t("adminProviderBookings.booked")}{" "}
                      {new Date(booking.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminProviderBookings;
