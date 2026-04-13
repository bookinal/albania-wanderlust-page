import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "@/services/api/userService";
import type { User } from "@/types/user.types";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Users,
  Loader2,
  AlertCircle,
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  Filter,
} from "lucide-react";

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

const getInitials = (name?: string, email?: string): string => {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : "??";
};

// Status badge Tailwind classes (colors are semantic, kept as-is on both themes)
const STATUS_CFG: Record<
  string,
  { cls: string; icon: React.ReactNode; dot: string }
> = {
  active: {
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle className="h-3 w-3" />,
    dot: "bg-emerald-400",
  },
  suspended: {
    cls: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: <XCircle className="h-3 w-3" />,
    dot: "bg-red-400",
  },
  pending: {
    cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: <Clock className="h-3 w-3" />,
    dot: "bg-amber-400",
  },
};

const ROLE_CFG: Record<string, string> = {
  admin: "bg-[#e41e20]/10 text-[#e41e20] border-[#e41e20]/20",
  provider: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  user: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

function transformUserData(user: User) {
  return {
    id: user.id,
    name: user.full_name || user.email.split("@")[0],
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    location: user.location,
    avatar_url: user.avatar_url,
    registered: user.created_at
      ? new Date(user.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
        })
      : "-",
  };
}

function UserManagement() {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    headerBg: isDark ? '#111111' : '#ffffff',
    headerBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5',
    cardHoverBorder: isDark ? 'rgba(228,30,32,0.30)' : 'rgba(228,30,32,0.25)',
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
    metaText: isDark ? 'rgba(255,255,255,0.35)' : '#8a8480',
    optionBg: isDark ? '#1a1a1a' : '#ffffff',
  };

  const [users, setUsers] = useState<ReturnType<typeof transformUserData>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers.map(transformUserData));
      } catch (err: any) {
        setError(t("userManagement.error"));
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);
      const matchesRole = roleFilter ? u.role === roleFilter : true;
      const matchesStatus = statusFilter ? u.status === statusFilter : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter, users]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      providers: users.filter((u) => u.role === "provider").length,
      admins: users.filter((u) => u.role === "admin").length,
    }),
    [users],
  );

  const selectStyle: React.CSSProperties = {
    height: '40px',
    appearance: 'none' as any,
    borderRadius: '12px',
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    color: tk.inputText,
    padding: '0 12px',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <div className="-m-8 min-h-[calc(100vh)]" style={{ background: tk.pageBg, color: tk.pageText }}>
        {/* Header */}
        <div
          className="relative overflow-hidden px-6 py-8 md:px-10"
          style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBorder}` }}
        >
          <div className="pointer-events-none absolute -top-20 left-10 h-60 w-60 rounded-full bg-[#e41e20]/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e41e20]/15 ring-1 ring-[#e41e20]/40">
                <Users className="h-4 w-4 text-[#e41e20]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: tk.pageText }}>
                {t("userManagement.title")}
              </h1>
            </div>
            <p className="mt-1 ml-12 text-sm" style={{ color: tk.mutedText }}>
              {t("userManagement.subtitle", "Manage all platform users and their roles")}
            </p>
          </div>
        </div>

        <div className="px-6 py-6 md:px-10">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Stats */}
          {!loading && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: t("userManagement.stats.totalUsers"), value: stats.total, color: tk.pageText },
                { label: t("userManagement.stats.active"), value: stats.active, color: "#34d399" },
                { label: t("userManagement.stats.suspended"), value: stats.suspended, color: "#f87171" },
                { label: t("userManagement.roles.provider", "Providers"), value: stats.providers, color: "#a78bfa" },
                { label: t("userManagement.roles.admin", "Admins"), value: stats.admins, color: "#e41e20" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl px-4 py-3"
                  style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }}
                >
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: tk.labelText }}>
                    {s.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: s.color }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          {!loading && (
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
                  style={{ color: tk.iconMuted }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("userManagement.filters.searchPlaceholder")}
                  className="h-10 w-full rounded-xl pl-10 text-sm focus:outline-none"
                  style={{
                    background: tk.inputBg,
                    border: `1px solid ${tk.inputBorder}`,
                    color: tk.inputText,
                  }}
                />
              </div>
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
                  style={{ color: tk.iconMuted }}
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ ...selectStyle, paddingLeft: '32px', paddingRight: '32px' }}
                >
                  <option value="" style={{ background: tk.optionBg }}>
                    {t("userManagement.filters.allRoles")}
                  </option>
                  <option value="user" style={{ background: tk.optionBg }}>
                    {t("userManagement.filters.user")}
                  </option>
                  <option value="provider" style={{ background: tk.optionBg }}>
                    {t("userManagement.roles.provider")}
                  </option>
                  <option value="admin" style={{ background: tk.optionBg }}>
                    {t("userManagement.filters.admin")}
                  </option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={selectStyle}
                >
                  <option value="" style={{ background: tk.optionBg }}>
                    {t("userManagement.filters.allStatus")}
                  </option>
                  <option value="active" style={{ background: tk.optionBg }}>
                    {t("userManagement.filters.active")}
                  </option>
                  <option value="suspended" style={{ background: tk.optionBg }}>
                    {t("userManagement.filters.suspended")}
                  </option>
                  <option value="pending" style={{ background: tk.optionBg }}>
                    {t("userManagement.filters.pending")}
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24" style={{ color: tk.mutedText }}>
              <Loader2 className="h-8 w-8 animate-spin text-[#e41e20]" />
              <p className="mt-3 text-sm">{t("userManagement.loading")}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: tk.emptyBg, border: `1px solid ${tk.emptyBorder}` }}
              >
                <Users className="h-7 w-7" style={{ color: tk.emptyIcon }} />
              </div>
              <p className="text-sm font-medium" style={{ color: tk.mutedText }}>
                {search || roleFilter || statusFilter
                  ? t("userManagement.noUsers", "No users match your filters")
                  : t("userManagement.noUsers", "No users found")}
              </p>
            </div>
          )}

          {/* User Grid */}
          {!loading && !error && filteredData.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredData.map((user) => {
                const statusCfg = STATUS_CFG[user.status] ?? STATUS_CFG.pending;
                const roleCls = ROLE_CFG[user.role] ?? ROLE_CFG.user;
                return (
                  <Link
                    key={user.id}
                    to={`/dashboard/user-details/${user.id}`}
                    className="group relative flex flex-col rounded-2xl p-5 text-left transition-all duration-200 focus:outline-none"
                    style={{
                      background: tk.cardBg,
                      border: `1px solid ${tk.cardBorder}`,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = tk.cardHoverBorder;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = tk.cardBorder;
                    }}
                  >
                    {/* status dot */}
                    <span
                      className={`absolute right-4 top-4 h-2 w-2 rounded-full ${statusCfg.dot}`}
                    />

                    {/* Avatar */}
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white shadow-md ${avatarColor(user.id)}`}
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        getInitials(user.name, user.email)
                      )}
                    </div>

                    {/* Name & email */}
                    <p className="truncate text-sm font-semibold" style={{ color: tk.pageText }}>
                      {user.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs" style={{ color: tk.mutedText }}>
                      {user.email}
                    </p>

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${roleCls}`}
                      >
                        {t(`userManagement.roles.${user.role}`, user.role)}
                      </span>
                      <span
                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusCfg.cls}`}
                      >
                        {statusCfg.icon}
                        {t(`userManagement.status.${user.status}`, user.status)}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 space-y-1">
                      {user.location && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: tk.metaText }}>
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: tk.metaText }}>
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: tk.metaText }}>
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>
                          {t("adminProvidersList.memberSince", "Since")}{" "}
                          {user.registered}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div
                      className="mt-4 flex items-center justify-between pt-3"
                      style={{ borderTop: `1px solid ${tk.divider}` }}
                    >
                      <span className="text-xs font-medium text-[#e41e20]/80">
                        {t("userManagement.viewDetails")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#e41e20]/60 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}

export default UserManagement;
