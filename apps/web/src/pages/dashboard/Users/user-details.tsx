import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Ban,
  Mail,
  Calendar,
  X,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Loader2,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { userService } from "@/services/api/userService";
import { User, UpdateUser } from "@/types/user.types";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

// ----- helpers -----

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

function getInitials(name?: string | null, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (email?.substring(0, 2) || "??").toUpperCase();
}

const STATUS_CFG: Record<
  string,
  { light: string; dark: string; dot: string; icon: React.ReactNode }
> = {
  active: {
    dark: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  suspended: {
    dark: "bg-red-500/10 text-red-400 border-red-500/20",
    light: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-400",
    icon: <XCircle className="h-3 w-3" />,
  },
  pending: {
    dark: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    light: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    icon: <Clock className="h-3 w-3" />,
  },
};

const ROLE_CFG: Record<string, { dark: string; light: string }> = {
  admin: {
    dark: "bg-[#e41e20]/10 text-[#e41e20] border-[#e41e20]/20",
    light: "bg-red-50 text-[#e41e20] border-red-200",
  },
  provider: {
    dark: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    light: "bg-violet-50 text-violet-700 border-violet-200",
  },
  user: {
    dark: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    light: "bg-sky-50 text-sky-700 border-sky-200",
  },
};

const StatusBadge = ({
  status,
  isDark,
}: {
  status: string;
  isDark: boolean;
}) => {
  const { t } = useTranslation();
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const cls = isDark ? cfg.dark : cfg.light;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {t(`userDetails.status.${status}`, status)}
    </span>
  );
};

const RoleTag = ({ role, isDark }: { role: string; isDark: boolean }) => {
  const { t } = useTranslation();
  const cfg = ROLE_CFG[role] ?? ROLE_CFG.user;
  const cls = isDark ? cfg.dark : cfg.light;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${cls}`}
    >
      {t(`userDetails.roles.${role}`, role)}
    </span>
  );
};

// ----- field row -----
const Field = ({
  icon,
  label,
  value,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  isDark: boolean;
}) => (
  <div className="flex items-start gap-3">
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <dt
        className="text-[10px] font-medium uppercase tracking-widest"
        style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9e9994" }}
      >
        {label}
      </dt>
      <dd
        className="mt-0.5 break-all text-sm"
        style={{ color: isDark ? "rgba(255,255,255,0.80)" : "#111115" }}
      >
        {value || "-"}
      </dd>
    </div>
  </div>
);

// ===== Main component =====

function UserDetails() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const { isDark } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<UpdateUser>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tk = {
    pageBg: isDark ? "#0d0d0d" : "#f5f4f1",
    pageText: isDark ? "#ffffff" : "#111115",
    headerBg: isDark ? "#111111" : "#ffffff",
    headerBorder: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    cardBg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#ede9e5",
    inputBg: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    inputBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    inputText: isDark ? "#ffffff" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : "#6b6663",
    dimText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    labelText: isDark ? "rgba(255,255,255,0.50)" : "#6b6663",
    divider: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    modalBg: isDark ? "#1a1a1a" : "#ffffff",
    modalBorder: isDark ? "rgba(255,255,255,0.10)" : "#ede9e5",
    btnBg: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
    btnBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    btnText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    selectBg: isDark ? "#1a1a1a" : "#ffffff",
    iconColor: isDark ? "rgba(255,255,255,0.40)" : "#9e9994",
  };

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        if (!userId) return;
        const data = await userService.getUserById(userId);
        setUser(data);
      } catch {
        setError(t("userDetails.errors.fetchUser"));
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  const handleEditOpen = () => {
    if (!user) return;
    setEditData({
      full_name: user.full_name || "",
      avatar_url: user.avatar_url || "",
      phone: user.phone || "",
      bio: user.bio || "",
      location: user.location || "",
      role: user.role || "user",
      status: user.status || "active",
    });
    setEditOpen(true);
  };

  const handelSuspendUser = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await userService.updateProfile(user.id, {
        status: "suspended",
      });
      setUser(updated);
    } catch {
      setError(t("userDetails.errors.suspendUser"));
    } finally {
      setSaving(false);
    }
  };

  const handelActivateUser = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await userService.updateProfile(user.id, {
        status: "active",
      });
      setUser(updated);
    } catch {
      setError(t("userDetails.errors.activateUser"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await userService.updateProfile(user.id, editData);
      setUser(updated);
      setEditOpen(false);
    } catch {
      setError(t("userDetails.errors.updateProfile"));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    padding: "8px 12px",
    fontSize: 14,
    color: tk.inputText,
    outline: "none",
  };

  // --- Loading ---
  if (loading) {
    return (
      <div
        style={{ background: tk.pageBg }}
        className="-m-8 flex min-h-[calc(100vh)] items-center justify-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#e41e20]" />
      </div>
    );
  }

  // --- Not found ---
  if (!user) {
    return (
      <div
        style={{ background: tk.pageBg, color: tk.pageText }}
        className="-m-8 flex min-h-[calc(100vh)] flex-col items-center justify-center gap-4"
      >
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm" style={{ color: tk.mutedText }}>
          {error || t("userDetails.errors.userNotFound")}
        </p>
        <Link
          to="/dashboard/userManagement"
          className="flex items-center gap-1 text-sm text-[#e41e20]/80 hover:text-[#e41e20]"
        >
          <ArrowLeft size={16} /> {t("userDetails.backToUsers")}
        </Link>
      </div>
    );
  }

  const initials = getInitials(user.full_name, user.email);
  const gradCls = avatarColor(user.id);

  return (
    <>
      <div
        style={{ background: tk.pageBg, color: tk.pageText }}
        className="-m-8 min-h-[calc(100vh)]"
      >
        {/* ── Header ── */}
        <div
          style={{
            background: tk.headerBg,
            borderBottom: `1px solid ${tk.headerBorder}`,
          }}
          className="relative overflow-hidden px-6 py-6 md:px-10"
        >
          <div className="pointer-events-none absolute -top-20 left-10 h-56 w-56 rounded-full bg-[#e41e20]/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/dashboard/userManagement"
              style={{ color: tk.mutedText }}
              className="flex items-center gap-2 text-sm transition hover:opacity-80"
            >
              <ArrowLeft size={16} />
              {t("userDetails.backToUserList")}
            </Link>
            <span
              className="hidden text-sm font-medium sm:block"
              style={{ color: tk.labelText }}
            >
              {t("userDetails.userProfile")}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10">
          {/* global error banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ── Profile card ── */}
            <div
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.cardBorder}`,
              }}
              className="lg:col-span-2 rounded-2xl p-6 sm:p-8"
            >
              {/* Avatar + name */}
              <div
                style={{ borderBottom: `1px solid ${tk.divider}` }}
                className="flex flex-col gap-5 pb-6 sm:flex-row sm:items-center"
              >
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white shadow-lg ${gradCls}`}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || user.email}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <h2
                    className="truncate text-2xl font-bold"
                    style={{ color: tk.pageText }}
                  >
                    {user.full_name || user.email.split("@")[0]}
                  </h2>
                  <p
                    className="mt-0.5 truncate text-sm"
                    style={{ color: tk.mutedText }}
                  >
                    {user.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RoleTag role={user.role || "user"} isDark={isDark} />
                    <StatusBadge status={user.status} isDark={isDark} />
                  </div>
                </div>
              </div>

              {/* Fields grid */}
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  isDark={isDark}
                  icon={
                    <Mail className="h-4 w-4" style={{ color: tk.iconColor }} />
                  }
                  label={t("userDetails.labels.email")}
                  value={user.email}
                />
                <Field
                  isDark={isDark}
                  icon={
                    <Phone
                      className="h-4 w-4"
                      style={{ color: tk.iconColor }}
                    />
                  }
                  label={t("userDetails.labels.phone")}
                  value={user.phone}
                />
                <Field
                  isDark={isDark}
                  icon={
                    <Calendar
                      className="h-4 w-4"
                      style={{ color: tk.iconColor }}
                    />
                  }
                  label={t("userDetails.labels.registrationDate")}
                  value={
                    user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : undefined
                  }
                />
                <Field
                  isDark={isDark}
                  icon={
                    <Clock
                      className="h-4 w-4"
                      style={{ color: tk.iconColor }}
                    />
                  }
                  label={t("userDetails.labels.lastLogin")}
                  value={
                    user.updated_at
                      ? new Date(user.updated_at).toLocaleString()
                      : undefined
                  }
                />
              </div>

              {user.location && (
                <div
                  style={{ borderTop: `1px solid ${tk.divider}` }}
                  className="mt-5 pt-5"
                >
                  <Field
                    isDark={isDark}
                    icon={
                      <MapPin
                        className="h-4 w-4"
                        style={{ color: tk.iconColor }}
                      />
                    }
                    label={t("userDetails.labels.address")}
                    value={user.location}
                  />
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5">
              {/* Actions */}
              <div
                style={{
                  background: tk.cardBg,
                  border: `1px solid ${tk.cardBorder}`,
                }}
                className="rounded-2xl p-6"
              >
                <h3
                  style={{
                    borderBottom: `1px solid ${tk.divider}`,
                    color: tk.mutedText,
                  }}
                  className="mb-4 pb-3 text-sm font-semibold uppercase tracking-wider"
                >
                  {t("userDetails.managementActions")}
                </h3>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleEditOpen}
                    disabled={saving}
                    style={{
                      background: tk.btnBg,
                      border: `1px solid ${tk.btnBorder}`,
                      color: tk.btnText,
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-80 disabled:opacity-40"
                  >
                    <Edit className="h-4 w-4" />
                    {t("userDetails.buttons.editProfile")}
                  </button>
                  <button
                    onClick={handelSuspendUser}
                    disabled={saving || user.status === "suspended"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                  >
                    <Ban className="h-4 w-4" />
                    {t("userDetails.buttons.suspendUser")}
                  </button>
                  <button
                    onClick={handelActivateUser}
                    disabled={saving || user.status === "active"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t("userDetails.buttons.activateUser")}
                  </button>
                </div>
              </div>

              {/* Activity placeholder */}
              <div
                style={{
                  background: tk.cardBg,
                  border: `1px solid ${tk.cardBorder}`,
                }}
                className="rounded-2xl p-6"
              >
                <h3
                  style={{
                    borderBottom: `1px solid ${tk.divider}`,
                    color: tk.mutedText,
                  }}
                  className="mb-3 pb-3 text-sm font-semibold uppercase tracking-wider"
                >
                  {t("userDetails.recentActivity")}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.30)" : "#b8b4b0",
                  }}
                >
                  {t("userDetails.noActivityData")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            style={{
              background: tk.modalBg,
              border: `1px solid ${tk.modalBorder}`,
            }}
            className="w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: tk.pageText }}>
                {t("userDetails.modal.editUserProfile")}
              </h2>
              <button
                onClick={() => setEditOpen(false)}
                disabled={saving}
                style={{ color: tk.mutedText }}
                className="transition hover:opacity-80 disabled:opacity-40"
              >
                <X size={22} />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSave();
              }}
              className="space-y-4"
            >
              {[
                {
                  name: "full_name",
                  label: t("userDetails.form.fullName"),
                  type: "text",
                },
                {
                  name: "avatar_url",
                  label: t("userDetails.form.avatarUrl"),
                  type: "text",
                },
                {
                  name: "phone",
                  label: t("userDetails.form.phone"),
                  type: "text",
                },
                {
                  name: "location",
                  label: t("userDetails.form.location"),
                  type: "text",
                },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label
                    className="mb-1 block text-xs font-medium"
                    style={{ color: tk.labelText }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={(editData as any)[name] || ""}
                    onChange={handleEditChange}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: tk.labelText }}
                >
                  {t("userDetails.form.bio")}
                </label>
                <textarea
                  name="bio"
                  value={editData.bio || ""}
                  onChange={handleEditChange}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: tk.labelText }}
                >
                  {t("userDetails.form.role")}
                </label>
                <select
                  name="role"
                  value={editData.role || "user"}
                  onChange={handleEditChange}
                  style={{ ...inputStyle, background: tk.selectBg }}
                >
                  <option value="user">{t("userDetails.form.user")}</option>
                  <option value="provider">
                    {t("userDetails.form.provider", "Provider")}
                  </option>
                  <option value="admin">{t("userDetails.form.admin")}</option>
                </select>
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: tk.labelText }}
                >
                  {t("userManagement.filters.allStatus")}
                </label>
                <select
                  name="status"
                  value={editData.status || "active"}
                  onChange={handleEditChange}
                  style={{ ...inputStyle, background: tk.selectBg }}
                >
                  <option value="active">
                    {t("userManagement.filters.active")}
                  </option>
                  <option value="suspended">
                    {t("userManagement.filters.suspended")}
                  </option>
                  <option value="pending">
                    {t("userManagement.filters.pending")}
                  </option>
                </select>
              </div>

              <div
                className="flex gap-2 pt-4"
                style={{ borderTop: `1px solid ${tk.divider}` }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e41e20] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#c91a1c] disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving
                    ? t("userDetails.form.saving")
                    : t("userDetails.form.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                  style={{
                    background: tk.btnBg,
                    border: `1px solid ${tk.btnBorder}`,
                    color: tk.btnText,
                  }}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-80 disabled:opacity-50"
                >
                  {t("userDetails.form.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserDetails;
