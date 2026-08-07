import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api/authService";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Loader2, Mail, KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const primaryBg = isDark ? "#0a0a0c" : isBlue ? "#eff6ff" : "#fdf9f7";

  const overlayGradient = isDark
    ? "linear-gradient(to bottom right, rgba(127, 29, 29, 0.15), rgba(15, 23, 42, 0.95), #0a0a0c)"
    : isBlue
    ? "linear-gradient(to bottom right, #dbeafe, #f0f9ff, #ffffff)"
    : "linear-gradient(to bottom right, #fee2e2, #fffafb, #ffffff)";

  const cardBg = isDark ? "#111115" : "#ffffff";
  const cardBorder = isDark
    ? "rgba(255,255,255,0.08)"
    : isBlue
    ? "rgba(2, 132, 199, 0.12)"
    : "rgba(232, 25, 44, 0.08)";
  const cardShadow = isDark
    ? "0 25px 50px -12px rgba(0,0,0,0.5)"
    : isBlue
    ? "0 20px 40px -15px rgba(2, 132, 199, 0.12)"
    : "0 20px 40px -15px rgba(0, 0, 0, 0.08)";
  const cardTopAccentGradient = isBlue
    ? "linear-gradient(to right, #2563eb, #0ea5e9, #0f172a)"
    : "linear-gradient(to right, #b91c1c, #dc2626, #000000)";

  const inputBg = isDark ? "rgba(255,255,255,0.03)" : isBlue ? "#f8fafc" : "#fdfcfb";
  const inputBorder = isDark
    ? "rgba(255,255,255,0.1)"
    : isBlue
    ? "rgba(2, 132, 199, 0.15)"
    : "#e2e8f0";
  const inputText = isDark ? "#ffffff" : isBlue ? "hsl(212 48% 18%)" : "#111115";
  const labelText = isDark ? "rgba(255,255,255,0.9)" : isBlue ? "hsl(212 48% 18%)" : "#111115";
  const mutedText = isDark ? "rgba(255,255,255,0.45)" : isBlue ? "hsl(211 22% 42%)" : "#6b6663";

  const primaryGradient = isBlue
    ? "linear-gradient(to right, #0284c7, #0369a1)"
    : "linear-gradient(to right, #dc2626, #991b1b)";
  const primaryBtnShadow = isBlue
    ? "shadow-blue-900/25 hover:shadow-blue-900/35"
    : "shadow-red-900/25 hover:shadow-red-900/35";

  const linkText = isBlue ? "#0284c7" : "#dc2626";
  const linkTextHover = isBlue ? "#0369a1" : "#b91c1c";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t("user.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await authService.resetPasswordForEmail(
        email,
        `${window.location.origin}/reset-password`,
      );
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      console.error("Reset password request error:", err);
      setError(err.message || t("user.resetPasswordRequestFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12"
      style={{ background: primaryBg }}
    >
      <div className="absolute inset-0" style={{ background: overlayGradient }} />

      <div className="relative z-10 w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="mb-4 text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 hover:opacity-85"
          style={{ color: labelText }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("common.back", { defaultValue: "Back" })}
        </button>

        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
        >
          <div className="h-2" style={{ background: cardTopAccentGradient }} />

          <div className="p-7 md:p-10">
            {sent ? (
              <div className="text-center py-4">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: isDark ? "rgba(16,185,129,0.12)" : "#ecfdf5" }}
                >
                  <CheckCircle2 className="h-7 w-7" style={{ color: isDark ? "#6ee7b7" : "#059669" }} />
                </div>
                <h2 className="text-xl font-black mb-2" style={{ color: labelText }}>
                  {t("user.resetPasswordEmailSentTitle")}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: mutedText }}>
                  {t("user.resetPasswordEmailSentDescription", { email })}
                </p>
              </div>
            ) : (
              <>
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: isDark ? "rgba(255,255,255,0.06)" : isBlue ? "rgba(2,132,199,0.08)" : "rgba(232,25,44,0.06)" }}
                >
                  <KeyRound className="h-6 w-6" style={{ color: linkText }} />
                </div>
                <h2 className="text-2xl font-black mb-2 text-center" style={{ color: labelText }}>
                  {t("user.forgotPasswordTitle")}
                </h2>
                <p className="text-sm mb-6 text-center leading-relaxed" style={{ color: mutedText }}>
                  {t("user.forgotPasswordDescription")}
                </p>

                {error && (
                  <div
                    style={{
                      background: isDark ? "rgba(239,68,68,0.12)" : "#fef2f2",
                      border: `1px solid ${isDark ? "rgba(239,68,68,0.30)" : "#fecaca"}`,
                      color: isDark ? "#fca5a5" : "#991b1b",
                      padding: "12px 16px",
                      borderRadius: 16,
                      marginBottom: 16,
                    }}
                  >
                    <p className="text-sm font-semibold">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: labelText, marginBottom: 6 }}>
                      {t("user.emailLabel")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4" style={{ color: mutedText }} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 16px 12px 42px",
                          border: `1px solid ${inputBorder}`,
                          borderRadius: 16,
                          background: inputBg,
                          color: inputText,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        placeholder={t("user.emailPlaceholder")}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-3.5 px-4 rounded-2xl transition-all font-bold shadow-lg transform hover:scale-[1.01] flex items-center justify-center ${primaryBtnShadow} ${
                      loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"
                    }`}
                    style={{ background: primaryGradient }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        {t("user.processing")}
                      </span>
                    ) : (
                      t("user.sendResetLink")
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <p className="text-sm" style={{ color: mutedText }}>
                    {t("user.rememberPasswordText")}
                    <button
                      type="button"
                      onClick={() => navigate("/auth")}
                      className="ml-1.5 font-bold transition-colors hover:underline"
                      style={{ color: linkText, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = linkTextHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = linkText)}
                    >
                      {t("user.signIn")}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
