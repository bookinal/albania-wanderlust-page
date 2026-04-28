import React, { useState, useEffect } from "react";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Contact,
  Loader2,
  Save,
  X,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { userService } from "@/services/api/userService";
import { User, UpdateUserProfileData } from "@/types/user.types";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";

export default function MyAccount() {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });

  const tk = {
    pageBg: isDark ? "#050508" : isBlue ? "hsl(205 55% 96%)" : "#f7f3ee",
    pageText: isDark ? "#f9f5f0" : isBlue ? "hsl(212 48% 18%)" : "#141014",
    cardBg: isDark ? "#111115" : isBlue ? "rgba(255,255,255,0.82)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : isBlue ? "rgba(2,132,199,0.14)" : "#ede9e5",
    inputBg: isDark ? "rgba(255,255,255,0.04)" : isBlue ? "rgba(255,255,255,0.92)" : "#faf8f5",
    inputBorder: isDark ? "rgba(255,255,255,0.16)" : isBlue ? "rgba(2,132,199,0.18)" : "#ddd9d5",
    inputText: isDark ? "#ffffff" : isBlue ? "hsl(212 48% 18%)" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.4)" : isBlue ? "hsl(211 22% 42%)" : "#6b6663",
    dimText: isDark ? "rgba(255,255,255,0.7)" : isBlue ? "hsl(212 28% 30%)" : "#44403c",
    labelText: isDark ? "rgba(255,255,255,0.55)" : isBlue ? "hsl(211 22% 42%)" : "#6b6663",
    divider: isDark ? "rgba(255,255,255,0.06)" : isBlue ? "rgba(2,132,199,0.12)" : "#e8e4e0",
    disabledBg: isDark ? "rgba(255,255,255,0.02)" : isBlue ? "rgba(240,249,255,0.92)" : "#f0ece8",
    disabledText: isDark ? "rgba(255,255,255,0.3)" : isBlue ? "rgba(15,23,42,0.35)" : "#9e9994",
    alertErrorBg: isDark ? "rgba(248,113,113,0.08)" : isBlue ? "rgba(239,68,68,0.08)" : "#fef2f2",
    alertErrorBorder: isDark ? "rgba(248,113,113,0.35)" : isBlue ? "rgba(239,68,68,0.24)" : "#fecaca",
    alertErrorText: isDark ? "#fecaca" : "#b91c1c",
    alertSuccessBg: isDark ? "rgba(34,197,94,0.08)" : isBlue ? "rgba(14,165,233,0.08)" : "#ecfdf3",
    alertSuccessBorder: isDark ? "rgba(34,197,94,0.4)" : isBlue ? "rgba(14,165,233,0.28)" : "#bbf7d0",
    alertSuccessText: isDark ? "#bbf7d0" : isBlue ? "#0369a1" : "#166534",
    coverGradient: isBlue
      ? "linear-gradient(120deg, #082f49 0%, #0369a1 30%, #0ea5e9 50%, #7dd3fc 70%, #164e63 100%)"
      : "linear-gradient(120deg, #1a0204 0%, #cc1525 30%, #E8192C 50%, #ff6b7a 70%, #2b0b0e 100%)",
    coverOverlay: isBlue
      ? "radial-gradient(circle at 0 0, rgba(255,255,255,0.28) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(3,37,65,0.65) 0, transparent 60%)"
      : "radial-gradient(circle at 0 0, rgba(255,255,255,0.35) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(0,0,0,0.65) 0, transparent 60%)",
    avatarBorder: isDark ? "#050508" : isBlue ? "#dbeafe" : "#f4ede6",
    avatarFallback: isBlue ? "radial-gradient(circle at 30% 0, #38bdf8, #082f49)" : "radial-gradient(circle at 30% 0, #4b5563, #0f172a)",
    primaryBtn: isBlue
      ? "linear-gradient(120deg, #0284c7, #38bdf8, #0284c7)"
      : "linear-gradient(120deg, #E8192C, #ff6b7a, #E8192C)",
    primaryShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.6)"
      : isBlue
        ? "0 10px 30px rgba(2,132,199,0.28)"
        : "0 10px 30px rgba(220,38,38,0.4)",
    successBtn: isBlue
      ? "linear-gradient(120deg, #0369a1, #0ea5e9)"
      : "linear-gradient(120deg, #16a34a, #22c55e)",
    successShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.6)"
      : isBlue
        ? "0 10px 30px rgba(14,165,233,0.24)"
        : "0 10px 30px rgba(22,163,74,0.35)",
    focusRing: isBlue ? "#0ea5e9" : "#3b82f6",
  };

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateUserProfileData>({
    full_name: "",
    phone: "",
    bio: "",
    location: "",
    role: "user",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        location: userData.location || "",
        role: userData.role,
      });
    } catch (err) {
      setError(t("account.failedToLoadProfile"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("account.fileSizeTooLarge"));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(t("account.pleaseUploadImage"));
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);

      // Delete old avatar if exists
      if (user?.avatar_url) {
        await userService.deleteAvatar(user.avatar_url);
      }

      // Upload new avatar
      const avatarUrl = await userService.uploadAvatar(file);
      // Update user profile with new avatar
      const updatedUser = await userService.updateProfile(user.id, {
        avatar_url: avatarUrl,
      });
      setUser(updatedUser);
      setSuccess(t("account.avatarUpdated"));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t("account.failedToUploadAvatar"));
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const updatedUser = await userService.updateProfile(user.id, formData);
      setUser(updatedUser);
      setEditing(false);
      setSuccess(t("account.profileUpdated"));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t("account.failedToUpdateProfile"));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: isDark
            ? "radial-gradient(circle at top, rgba(232,25,44,0.16), transparent 55%), radial-gradient(circle at bottom, rgba(15,23,42,0.9), #050508)"
            : isBlue
              ? "radial-gradient(circle at top, rgba(14,165,233,0.14), transparent 55%), linear-gradient(to bottom right, #eff6ff, #e0f2fe)"
              : "radial-gradient(circle at top, rgba(232,25,44,0.06), transparent 55%), linear-gradient(to bottom right, #fdf9f7, #f4ede6)",
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: homeTk.brand }} />
      </div>
    );
  }

  return (
    <div
        style={{
          background: isDark
            ? "radial-gradient(circle at top left, rgba(232,25,44,0.2), transparent 55%), radial-gradient(circle at bottom right, rgba(15,23,42,0.9), #050508)"
            : isBlue
              ? "radial-gradient(circle at top left, rgba(14,165,233,0.14), transparent 55%), linear-gradient(to bottom right, #eff6ff, #e0f2fe)"
              : "radial-gradient(circle at top left, rgba(232,25,44,0.06), transparent 55%), linear-gradient(to bottom right, #fdf9f7, #f4ede6)",
          color: tk.pageText,
          minHeight: "100vh",
          transition: "background 0.5s ease, color 0.3s ease",
      }}
    >
      <PrimarySearchAppBar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{
                color: tk.pageText,
                letterSpacing: "0.04em",
              }}
            >
              {t("account.profileSettings")}
            </h1>
            <p
              className="mt-2 text-sm sm:text-base"
              style={{
                color: tk.mutedText,
                maxWidth: "32rem",
              }}
            >
              {t("account.managePersonalInfo")}
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl flex items-center justify-between border"
              style={{
                backgroundColor: tk.alertErrorBg,
                borderColor: tk.alertErrorBorder,
                color: tk.alertErrorText,
              }}
            >
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                style={{
                  color: tk.alertErrorText,
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {success && (
            <div
              className="mb-6 px-4 py-3 rounded-xl flex items-center justify-between border"
              style={{
                backgroundColor: tk.alertSuccessBg,
                borderColor: tk.alertSuccessBorder,
                color: tk.alertSuccessText,
              }}
            >
              <span>{success}</span>
              <button
                onClick={() => setSuccess(null)}
                style={{
                  color: tk.alertSuccessText,
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div
            className="rounded-2xl shadow-sm border overflow-hidden backdrop-blur"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(15,15,23,0.98), rgba(10,10,16,0.98))"
                : isBlue
                  ? "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.96))"
                  : "linear-gradient(135deg, #ffffff, #fdf9f7)",
              borderColor: tk.cardBorder,
              boxShadow: isDark
                ? "0 22px 55px rgba(0,0,0,0.65)"
                : isBlue
                  ? "0 22px 55px rgba(2,132,199,0.12)"
                  : "0 22px 55px rgba(15,23,42,0.12)",
            }}
          >
            {/* Cover Image */}
            <div
              className="h-32 sm:h-36 relative"
              style={{
                background: tk.coverGradient,
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: tk.coverOverlay,
                }}
              />
            </div>

            {/* Avatar Section */}
            <div className="px-6 sm:px-8 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                <div className="relative group">
                  <div
                    className="w-32 h-32 rounded-full border-4 overflow-hidden shadow-xl"
                      style={{
                        borderColor: tk.avatarBorder,
                        background: tk.avatarFallback,
                      }}
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || "User avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                        {user?.full_name?.[0]?.toUpperCase() ||
                          user?.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.35))",
                      }}
                    >
                    {uploadingAvatar ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </div>

                <div className="mt-6 sm:mt-0 flex-1">
                  <h2
                    className="text-2xl sm:text-3xl font-semibold"
                    style={{
                      color: tk.pageText,
                    }}
                  >
                    {user.full_name || "Anonymous User"}
                  </h2>
                  <p
                    className="flex items-center mt-1 text-sm sm:text-base"
                    style={{
                      color: tk.dimText,
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                </div>

                <div className="mt-4 sm:mt-0">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-2 rounded-full font-medium shadow-sm transition-all text-sm"
                      style={{
                        background: tk.primaryBtn,
                        color: "#ffffff",
                        boxShadow: tk.primaryShadow,
                      }}
                    >
                      {t("account.editProfile")}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 rounded-full font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        style={{
                          background: tk.successBtn,
                          color: "#ffffff",
                          boxShadow: tk.successShadow,
                        }}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("account.saving")}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {t("account.save")}
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-6 py-2 rounded-full font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        style={{
                          backgroundColor: tk.disabledBg,
                          color: tk.dimText,
                        }}
                      >
                        {t("account.cancel")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="mt-8 grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: tk.labelText }}
                  >
                    <Contact className="w-4 h-4 inline mr-2" />
                    {t("account.fullName")}
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                    style={{
                      backgroundColor: editing ? tk.inputBg : tk.disabledBg,
                      borderColor: tk.inputBorder,
                      color: editing ? tk.inputText : tk.disabledText,
                      ["--tw-ring-color" as any]: tk.focusRing,
                    }}
                    placeholder={t("account.enterFullName")}
                  />
                </div>

                {/* Role */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: tk.labelText }}
                  >
                    <Contact className="w-4 h-4 inline mr-2" />
                    {t("account.role")}
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                    style={{
                      backgroundColor: tk.disabledBg,
                      borderColor: tk.inputBorder,
                      color: tk.disabledText,
                      ["--tw-ring-color" as any]: tk.focusRing,
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: tk.labelText }}
                  >
                    <Phone className="w-4 h-4 inline mr-2" />
                    {t("account.phoneNumber")}
                  </label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="AL"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={!editing}
                    className="w-full"
                    style={{
                      "--PhoneInputCountryFlag-height": "1em",
                        "--PhoneInput-color--focus": tk.focusRing,
                    }}
                    inputComponent={({ className, ...props }) => (
                      <input
                        {...props}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${className}`}
                        style={{
                          backgroundColor: editing ? tk.inputBg : tk.disabledBg,
                          borderColor: tk.inputBorder,
                          color: editing ? tk.inputText : tk.disabledText,
                          ["--tw-ring-color" as any]: tk.focusRing,
                        }}
                        placeholder={t("account.phonePlaceholder")}
                      />
                    )}
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: tk.labelText }}
                  >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {t("account.location")}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                    style={{
                      backgroundColor: editing ? tk.inputBg : tk.disabledBg,
                      borderColor: tk.inputBorder,
                      color: editing ? tk.inputText : tk.disabledText,
                      ["--tw-ring-color" as any]: tk.focusRing,
                    }}
                    placeholder={t("account.locationPlaceholder")}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: tk.labelText }}
                  >
                    {t("account.bio")}
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editing}
                    rows={4}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none"
                    style={{
                      backgroundColor: editing ? tk.inputBg : tk.disabledBg,
                      borderColor: tk.inputBorder,
                      color: editing ? tk.inputText : tk.disabledText,
                      ["--tw-ring-color" as any]: tk.focusRing,
                    }}
                    placeholder={t("account.bioPlaceholder")}
                  />
                </div>
              </div>

              {/* Account Info */}
              <div
                className="mt-8 pt-6 border-t"
                style={{
                  borderColor: tk.divider,
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: tk.pageText }}
                >
                  {t("account.accountInformation")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span
                      className="text-xs uppercase tracking-wide"
                      style={{ color: tk.labelText }}
                    >
                      {t("account.memberSince")}
                    </span>
                    <p
                      className="font-medium mt-1"
                      style={{ color: tk.pageText }}
                    >
                      {new Date(user?.created_at || "").toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-xs uppercase tracking-wide"
                      style={{ color: tk.labelText }}
                    >
                      {t("account.lastUpdated")}
                    </span>
                    <p
                      className="font-medium mt-1"
                      style={{ color: tk.pageText }}
                    >
                      {new Date(user?.updated_at || "").toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
