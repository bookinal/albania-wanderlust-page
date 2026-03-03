import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Hsidebar from "@/components/dashboard/hsidebar";
import {
  ArrowLeft,
  Edit,
  Ban,
  Mail,
  Calendar,
  X,
  Contact,
  Badge,
  Phone,
  MapPin,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { userService } from "@/services/api/userService";
import { User, UpdateUserProfileData, UpdateUser } from "@/types/user.types";
import { useTranslation } from "react-i18next";

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  let colorClass = "";
  let dotColor = "";

  switch (status) {
    case "active":
      colorClass = "bg-green-50 text-green-700 ring-green-600/20";
      dotColor = "bg-green-500";
      break;
    case "suspended":
      colorClass = "bg-red-50 text-red-700 ring-red-600/20";
      dotColor = "bg-red-500";
      break;
    case "pending":
      colorClass = "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
      dotColor = "bg-yellow-500";
      break;
    default:
      colorClass = "bg-gray-50 text-gray-700 ring-gray-600/20";
      dotColor = "bg-gray-500";
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
      {t(`userDetails.status.${status}`)}
    </span>
  );
};

const RoleTag = ({ role }: { role: string }) => {
  const { t } = useTranslation();
  return (
    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800 shadow-sm capitalize">
      <Contact className="inline-block w-4 h-4 mr-1" />
      {t(`userDetails.roles.${role}`)}
    </span>
  );
};

/** Generates initials from a name or email */
function getInitials(name?: string | null, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (email?.substring(0, 2) || "??").toUpperCase();
}

const AvatarFallback = ({
  name,
  email,
  size = "lg",
}: {
  name?: string | null;
  email?: string;
  size?: "sm" | "lg";
}) => {
  const initials = getInitials(name, email);
  const sizeClass =
    size === "lg" ? "w-24 h-24 text-2xl" : "w-12 h-12 text-base";
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-4 ring-indigo-500/30 select-none`}
    >
      {initials}
    </div>
  );
};

function UserDetails() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<UpdateUser>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        if (!userId) return;
        const data = await userService.getUserById(userId);
        setUser(data);
      } catch (err: any) {
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
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      role: user.role,
      status: user.status,
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
      setError(t("userDetails.errors.updateProfile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Hsidebar>
        <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">{t("userDetails.loading")}</p>
        </div>
      </Hsidebar>
    );
  }
  if (!user) {
    return (
      <Hsidebar>
        <div className="p-8 bg-gray-50 min-h-screen">
          <p className="text-red-600 text-lg">
            {error || t("userDetails.errors.userNotFound")}
          </p>
          <Link
            to="/dashboard/userManagement"
            className="mt-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={16} /> {t("userDetails.backToUsers")}
          </Link>
        </div>
      </Hsidebar>
    );
  }

  return (
    <Hsidebar>
      {/* Main Container - Responsive Padding and Background */}
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard/userManagement"
            className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} /> {t("userDetails.backToUserList")}
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 hidden sm:block">
            {t("userDetails.userProfile")}
          </h1>
        </div>

        {/* --- Profile Overview Card --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b pb-6 mb-6">
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  className="w-24 h-24 rounded-full object-cover shadow-md ring-4 ring-indigo-500/30"
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                />
              ) : (
                <AvatarFallback
                  name={user.full_name}
                  email={user.email}
                  size="lg"
                />
              )}
              {/* Basic Info */}
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {user.full_name || user.email.split("@")[0]}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RoleTag role={user.role || "user"} />
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </div>

            {/* Contact and Registration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("userDetails.labels.email")}
                  </dt>
                  <dd className="text-sm text-gray-900 break-all mt-0.5">
                    {user.email}
                  </dd>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("userDetails.labels.phone")}
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0.5">
                    {user.phone || "-"}
                  </dd>
                </div>
              </div>

              {/* Registration Date */}
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("userDetails.labels.registrationDate")}
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0.5">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </dd>
                </div>
              </div>

              {/* Last Login */}
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("userDetails.labels.lastLogin")}
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0.5">
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleString()
                      : "-"}
                  </dd>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("userDetails.labels.address")}
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0.5">
                    {user.location || "-"}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* --- Actions Sidebar --- */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                {t("userDetails.managementActions")}
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleEditOpen}
                  disabled={saving}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t("userDetails.buttons.editProfile")}
                </button>
                <button
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handelSuspendUser}
                  disabled={saving || user.status === "suspended"}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {t("userDetails.buttons.suspendUser")}
                </button>
                <button
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handelActivateUser}
                  disabled={saving || user.status === "active"}
                >
                  <Badge className="w-4 h-4 mr-2" />
                  {t("userDetails.buttons.activateUser")}
                </button>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                {t("userDetails.recentActivity")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("userDetails.noActivityData")}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {t("userDetails.modal.editUserProfile")}
              </h2>
              <button
                onClick={() => setEditOpen(false)}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            {error && (
              <p className="text-red-600 mb-4 text-sm bg-red-50 p-3 rounded">
                {error}
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("userDetails.form.fullName")}
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={editData.full_name || ""}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("userDetails.form.avatarUrl")}
                </label>
                <input
                  type="text"
                  name="avatar_url"
                  value={editData.avatar_url || ""}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("userDetails.form.phone")}
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editData.phone || ""}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("userDetails.form.bio")}
                </label>
                <textarea
                  name="bio"
                  value={editData.bio || ""}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("userDetails.form.location")}
                </label>
                <input
                  type="text"
                  name="location"
                  value={editData.location || ""}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("userDetails.form.role")}
                </label>
                <select
                  name="role"
                  value={editData.role || "user"}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">{t("userDetails.form.user")}</option>
                  <option value="provider">
                    {t("userDetails.form.provider", "Provider")}
                  </option>
                  <option value="admin">{t("userDetails.form.admin")}</option>
                </select>
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  disabled={saving}
                >
                  {saving
                    ? t("userDetails.form.saving")
                    : t("userDetails.form.save")}
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:bg-gray-400"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                >
                  {t("userDetails.form.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Hsidebar>
  );
}

export default UserDetails;
