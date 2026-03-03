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

export default function MyAccount() {
  const { t } = useTranslation();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div>
      <PrimarySearchAppBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("account.profileSettings")}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {t("account.managePersonalInfo")}
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{success}</span>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-700 hover:text-green-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-red-500 to-red-700"></div>

            {/* Avatar Section */}
            <div className="px-6 sm:px-8 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || "User avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white text-3xl font-bold">
                        {user?.full_name?.[0]?.toUpperCase() ||
                          user?.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.full_name || "Anonymous User"}
                  </h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                </div>

                <div className="mt-4 sm:mt-0">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                      {t("account.editProfile")}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Contact className="w-4 h-4 inline mr-2" />
                    {t("account.fullName")}
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
                    placeholder={t("account.enterFullName")}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Contact className="w-4 h-4 inline mr-2" />
                    {t("account.role")}
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      "--PhoneInput-color--focus": "#3b82f6",
                    }}
                    inputComponent={({ className, ...props }) => (
                      <input
                        {...props}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-colors ${className}`}
                        placeholder={t("account.phonePlaceholder")}
                      />
                    )}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {t("account.location")}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
                    placeholder={t("account.locationPlaceholder")}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("account.bio")}
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editing}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-colors resize-none"
                    placeholder={t("account.bioPlaceholder")}
                  />
                </div>
              </div>

              {/* Account Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("account.accountInformation")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      {t("account.memberSince")}
                    </span>
                    <p className="font-medium text-gray-900 mt-1">
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
                    <span className="text-gray-600">
                      {t("account.lastUpdated")}
                    </span>
                    <p className="font-medium text-gray-900 mt-1">
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
