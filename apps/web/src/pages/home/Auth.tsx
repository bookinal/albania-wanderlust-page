import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api/authService";
import { userService } from "@/services/api/userService";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { Hotel, Home, Car, ArrowLeft, Loader2, KeyRound, MapPin, Mail, User, ShieldCheck } from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";

const PageMotionStyles = () => (
  <style>{`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(22px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 700ms cubic-bezier(.2,.8,.2,1) forwards; }
    .animate-fade-in-up { animation: fade-in-up 650ms cubic-bezier(.2,.8,.2,1) forwards; opacity: 0; }
  `}</style>
);

export default function AuthPage() {
  const { t } = useTranslation();
  const { theme, isDark, isBlue } = useTheme();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Check for OAuth redirect (has access_token in URL hash)
      const hasHash = window.location.hash.includes("access_token");
      
      // Wait a moment for session to be restored after OAuth redirect
      if (hasHash) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      try {
        const user = await userService.getCurrentUser();
        if (user) {
          const redirectUrl = localStorage.getItem("redirectAfterLogin");
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectUrl || "/");
        }
      } catch (err) {
        // User not logged in, show auth form
      } finally {
        setInitialLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  const getRedirectUrl = () => {
    const redirectUrl = localStorage.getItem("redirectAfterLogin");
    localStorage.removeItem("redirectAfterLogin");
    return redirectUrl || "/";
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) throw error;
      // Redirect happens automatically for OAuth
    } catch (err: any) {
      setError(err.message || t("user.googleSignInFailed"));
      setLoading(false);
    }
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password) {
      setError(t("user.fillAllFields"));
      setLoading(false);
      return;
    }

    try {
      const { error } = await authService.signIn({ email, password });
      if (error) throw error;

      setSuccess(t("user.signInSuccessful"));
      // Navigate to dashboard or home after short delay
      setTimeout(() => {
        navigate(getRedirectUrl());
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || t("user.signInFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password || !confirmPassword || !name || !location) {
      setError(t("user.fillAllFields"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("user.passwordsDontMatch"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("user.passwordTooShort"));
      setLoading(false);
      return;
    }

    try {
      const { error } = await authService.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            location: location,
          },
        },
      });

      if (error) throw error;

      setSuccess(t("user.accountCreated"));
      Swal.fire(t("common.success"), t("user.accountCreated"), "success");
      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setLocation("");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || t("user.accountCreationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
  };

  // --- Dynamic Theme Styling Tokens ---
  const primaryBg = isDark
    ? "#0a0a0c"
    : isBlue
    ? "#eff6ff"
    : "#fdf9f7";

  const overlayGradient = isDark
    ? "linear-gradient(to bottom right, rgba(127, 29, 29, 0.15), rgba(15, 23, 42, 0.95), #0a0a0c)"
    : isBlue
    ? "linear-gradient(to bottom right, #dbeafe, #f0f9ff, #ffffff)"
    : "linear-gradient(to bottom right, #fee2e2, #fffafb, #ffffff)";

  const vignetteBg = isDark
    ? "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)"
    : isBlue
    ? "radial-gradient(ellipse at center, transparent 35%, rgba(2,132,199,0.04) 100%)"
    : "radial-gradient(ellipse at center, transparent 35%, rgba(232,25,44,0.02) 100%)";

  const crossHatchOpacity = isDark ? 0.02 : isBlue ? 0.03 : 0.04;
  const crossHatchColor = isDark ? "#ffffff" : isBlue ? "#0284c7" : "#dc2626";

  const fadeBottomGradient = isDark
    ? "linear-gradient(to top, #0a0a0c, transparent)"
    : "linear-gradient(to top, #ffffff, transparent)";

  // Brand Panel (Left Panel) Styling
  const brandPanelBorder = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : isBlue
    ? "rgba(2, 132, 199, 0.12)"
    : "rgba(232, 25, 44, 0.08)";

  const brandPanelBg = isDark
    ? "rgba(255, 255, 255, 0.03)"
    : isBlue
    ? "rgba(255, 255, 255, 0.65)"
    : "rgba(255, 255, 255, 0.7)";

  const brandPanelShadow = isDark
    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    : isBlue
    ? "0 20px 40px -15px rgba(2, 132, 199, 0.08)"
    : "0 20px 40px -15px rgba(232, 25, 44, 0.06)";

  const brandBadgeBg = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : isBlue
    ? "rgba(2, 132, 199, 0.08)"
    : "rgba(232, 25, 44, 0.05)";

  const brandBadgeBorder = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : isBlue
    ? "rgba(2, 132, 199, 0.15)"
    : "rgba(232, 25, 44, 0.1)";

  const brandBadgeTextColor = isDark
    ? "rgba(255, 255, 255, 0.85)"
    : isBlue
    ? "#0369a1"
    : "#b91c1c";

  const brandBadgeCircleColor = isBlue ? "#0284c7" : "#dc2626";

  const brandTitleColor = isDark
    ? "#ffffff"
    : isBlue
    ? "hsl(212 48% 18%)"
    : "#111115";

  const brandTitleGradient = isDark
    ? "linear-gradient(to right, #fee2e2, #ffffff)"
    : isBlue
    ? "linear-gradient(to right, #0369a1, #0284c7)"
    : "linear-gradient(to right, #b91c1c, #111115)";

  const brandDescColor = isDark
    ? "rgba(255, 255, 255, 0.65)"
    : isBlue
    ? "hsl(211 22% 42%)"
    : "#6b6663";

  // Feature cards inside Brand Panel
  const brandIconContainerBg = isDark
    ? "rgba(255, 255, 255, 0.04)"
    : isBlue
    ? "rgba(255, 255, 255, 0.8)"
    : "rgba(255, 255, 255, 0.85)";

  const brandIconContainerBorder = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : isBlue
    ? "rgba(2, 132, 199, 0.12)"
    : "rgba(232, 25, 44, 0.08)";

  const brandIconColor = isBlue ? "#0284c7" : "#dc2626";

  const brandIconTextColor = isDark
    ? "rgba(255, 255, 255, 0.8)"
    : isBlue
    ? "hsl(212 48% 18%)"
    : "#111115";

  const brandBottomBoxBorder = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : isBlue
    ? "rgba(2, 132, 199, 0.1)"
    : "rgba(232, 25, 44, 0.06)";

  const brandBottomBoxBg = isDark
    ? "rgba(0, 0, 0, 0.2)"
    : isBlue
    ? "rgba(255, 255, 255, 0.4)"
    : "rgba(255, 255, 255, 0.45)";

  // Auth Card (Right Panel) Styling
  const cardBg = isDark
    ? "#111115"
    : "#ffffff";

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

  const inputBg = isDark
    ? "rgba(255,255,255,0.03)"
    : isBlue
    ? "#f8fafc"
    : "#fdfcfb";

  const inputBorder = isDark
    ? "rgba(255,255,255,0.1)"
    : isBlue
    ? "rgba(2, 132, 199, 0.15)"
    : "#e2e8f0";

  const inputText = isDark
    ? "#ffffff"
    : isBlue
    ? "hsl(212 48% 18%)"
    : "#111115";

  const labelText = isDark
    ? "rgba(255,255,255,0.9)"
    : isBlue
    ? "hsl(212 48% 18%)"
    : "#111115";

  const mutedText = isDark
    ? "rgba(255,255,255,0.45)"
    : isBlue
    ? "hsl(211 22% 42%)"
    : "#6b6663";

  const dividerBg = isDark
    ? "rgba(255,255,255,0.08)"
    : isBlue
    ? "rgba(2, 132, 199, 0.12)"
    : "#e2e8f0";

  const googleBtnBg = isDark
    ? "rgba(255,255,255,0.03)"
    : "#ffffff";

  const googleBtnBorder = isDark
    ? "rgba(255,255,255,0.1)"
    : isBlue
    ? "rgba(2, 132, 199, 0.15)"
    : "#e2e8f0";

  const googleBtnText = isDark
    ? "#ffffff"
    : isBlue
    ? "hsl(212 48% 18%)"
    : "#111115";

  // Primary buttons and gradient accents
  const primaryGradient = isBlue
    ? "linear-gradient(to right, #0284c7, #0369a1)"
    : "linear-gradient(to right, #dc2626, #991b1b)";

  const primaryBtnShadow = isBlue
    ? "shadow-blue-900/25 hover:shadow-blue-900/35"
    : "shadow-red-900/25 hover:shadow-red-900/35";

  const linkText = isBlue ? "#0284c7" : "#dc2626";
  const linkTextHover = isBlue ? "#0369a1" : "#b91c1c";

  if (initialLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center animate-fade-in" style={{ background: primaryBg }}>
        <PrimarySearchAppBar />
        {/* Background gradient overlay */}
        <div className="absolute inset-0 transition-opacity duration-300" style={{ background: overlayGradient }} />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: vignetteBg }} />
        {/* Decorative cross-hatched pattern */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: crossHatchOpacity,
            backgroundImage: `repeating-linear-gradient(45deg, ${crossHatchColor} 0, ${crossHatchColor} 1px, transparent 0, transparent 50%)`,
            backgroundSize: "14px 14px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10" style={{ color: isBlue ? "#0284c7" : "#dc2626" }} />
          <div className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: isDark ? "rgba(255,255,255,0.6)" : isBlue ? "hsl(212 48% 18%)" : "#111115" }}>
            {t("user.processing")}
          </div>
        </div>
        <PageMotionStyles />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{ background: primaryBg }}>
      <PrimarySearchAppBar />
      {/* Background gradient overlay */}
      <div className="absolute inset-0 transition-all duration-300" style={{ background: overlayGradient }} />

      {/* Decorative cross-hatched overlay for texture */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: crossHatchOpacity,
          backgroundImage: `repeating-linear-gradient(45deg, ${crossHatchColor} 0, ${crossHatchColor} 1px, transparent 0, transparent 50%)`,
          backgroundSize: "14px 14px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: vignetteBg }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28" style={{ background: fadeBottomGradient }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Brand panel */}
            <div
              className="order-2 lg:order-1 lg:col-span-5 rounded-3xl border backdrop-blur-md p-7 md:p-9 shadow-2xl flex flex-col justify-between transition-all duration-300 animate-fade-in"
              style={{
                borderColor: brandPanelBorder,
                background: brandPanelBg,
                boxShadow: brandPanelShadow,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-8">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 border transition-all duration-300"
                    style={{
                      background: brandBadgeBg,
                      borderColor: brandBadgeBorder,
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: brandBadgeCircleColor }} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: brandBadgeTextColor }}>
                      BookinAL
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 hover:opacity-85"
                    style={{ color: brandBadgeTextColor }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t("common.back", { defaultValue: "Back" })}
                  </button>
                </div>

                <h1 className="text-4xl md:text-5xl font-black leading-[1.05] tracking-tight transition-all duration-300" style={{ color: brandTitleColor }}>
                  {isSignUp ? (
                    t("user.joinBookinAL")
                  ) : (
                    <>
                      {t("user.welcomeToAlbania")}
                      <br />
                      <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: brandTitleGradient }}>
                        {t("user.gatewayToExperiences")}
                      </span>
                    </>
                  )}
                </h1>
                <p className="mt-4 text-sm md:text-base leading-relaxed max-w-md transition-all duration-300" style={{ color: brandDescColor }}>
                  {isSignUp
                    ? t("user.startAlbanianAdventure")
                    : t("user.continueExploringAlbania")}
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { Icon: Hotel, label: t("user.hotels") },
                    { Icon: Home, label: t("user.apartments") },
                    { Icon: Car, label: t("user.carRentals") },
                  ].map((item, i) => {
                    const Icon = item.Icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl px-3 py-4 text-center shadow-sm animate-fade-in-up transition-all duration-300"
                        style={{
                          background: brandIconContainerBg,
                          border: `1px solid ${brandIconContainerBorder}`,
                          animationDelay: `${160 + i * 90}ms`,
                        }}
                      >
                        <div className="flex justify-center mb-2">
                          <Icon className="h-6 w-6" style={{ color: brandIconColor }} />
                        </div>
                        <p className="text-[11px] font-bold tracking-wide animate-fade-in" style={{ color: brandIconTextColor }}>
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="mt-8 rounded-2xl border p-5 transition-all duration-300"
                style={{
                  borderColor: brandBottomBoxBorder,
                  background: brandBottomBoxBg,
                }}
              >
                <div className="flex justify-center gap-1.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="block rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: brandIconColor,
                        width: i === 2 ? 28 : 6,
                        height: 6,
                        opacity: i === 2 ? 0.9 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-center leading-relaxed transition-all duration-300" style={{ color: brandDescColor }}>
                  {t("user.termsAgreement")}{" "}
                  <span className="font-semibold text-nowrap" style={{ color: brandIconColor }}>{t("user.termsOfService")}</span>{" "}
                  {t("user.and")}{" "}
                  <span className="font-semibold text-nowrap" style={{ color: brandIconColor }}>{t("user.privacyPolicy")}</span>
                </p>
              </div>
            </div>

            {/* Auth card */}
            <div className="order-1 lg:order-2 lg:col-span-7 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
              <div
                className="rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  boxShadow: cardShadow,
                }}
              >
                <div className="h-2" style={{ background: cardTopAccentGradient }} />

                <div className="p-7 md:p-10">
                  <h2 className="text-2xl font-black mb-6 animate-fade-in" style={{ color: labelText }}>
                    {isSignUp ? t("user.createNewAccount") : t("user.signIn")}
                  </h2>

                  {/* Google sign-in button at the top */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                      width: "100%",
                      background: googleBtnBg,
                      border: `1px solid ${googleBtnBorder}`,
                      color: googleBtnText,
                      padding: "14px 16px",
                      borderRadius: 16,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      transition: "opacity 0.2s, transform 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t("user.continueWithGoogle")}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: dividerBg }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 font-semibold" style={{ background: cardBg, color: mutedText }}>
                        {t("user.or")}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div style={{
                      background: isDark ? "rgba(239,68,68,0.12)" : "#fef2f2",
                      border: `1px solid ${isDark ? "rgba(239,68,68,0.30)" : "#fecaca"}`,
                      color: isDark ? "#fca5a5" : "#991b1b",
                      padding: "12px 16px", borderRadius: 16, marginBottom: 16,
                    }} className="animate-fade-in">
                      <p className="text-sm font-semibold">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div style={{
                      background: isDark ? "rgba(16,185,129,0.12)" : "#ecfdf5",
                      border: `1px solid ${isDark ? "rgba(16,185,129,0.30)" : "#a7f3d0"}`,
                      color: isDark ? "#6ee7b7" : "#065f46",
                      padding: "12px 16px", borderRadius: 16, marginBottom: 16,
                    }} className="animate-fade-in">
                      <p className="text-sm font-semibold">{success}</p>
                    </div>
                  )}

                  <form
                    onSubmit={isSignUp ? handleManualSignUp : handleManualSignIn}
                    className="space-y-4"
                  >
                    {isSignUp && (
                      <div className="animate-fade-in">
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: labelText, marginBottom: 6 }}>
                          {t("user.fullNameLabel")}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-4 w-4" style={{ color: mutedText }} />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 16px 12px 42px",
                              border: `1px solid ${inputBorder}`, borderRadius: 16,
                              background: inputBg, color: inputText,
                              outline: "none", transition: "all 0.2s",
                              boxSizing: "border-box",
                            }}
                            placeholder={t("user.fullNamePlaceholder")}
                            required
                          />
                        </div>
                      </div>
                    )}

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
                            border: `1px solid ${inputBorder}`, borderRadius: 16,
                            background: inputBg, color: inputText,
                            outline: "none", transition: "all 0.2s",
                            boxSizing: "border-box",
                          }}
                          placeholder={t("user.emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: labelText, marginBottom: 6 }}>
                        {t("user.passwordLabel")}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <KeyRound className="h-4 w-4" style={{ color: mutedText }} />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 16px 12px 42px",
                            border: `1px solid ${inputBorder}`, borderRadius: 16,
                            background: inputBg, color: inputText,
                            outline: "none", transition: "all 0.2s",
                            boxSizing: "border-box",
                          }}
                          placeholder={t("user.passwordPlaceholder")}
                          required
                        />
                      </div>
                      {!isSignUp && (
                        <div className="mt-2 text-right">
                          <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-xs font-semibold transition-colors hover:underline"
                            style={{ color: linkText, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = linkTextHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = linkText)}
                          >
                            {t("user.forgotPassword")}
                          </button>
                        </div>
                      )}
                    </div>

                    {isSignUp && (
                      <>
                        <div className="animate-fade-in">
                          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: labelText, marginBottom: 6 }}>
                            {t("user.confirmPasswordLabel")}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <ShieldCheck className="h-4 w-4" style={{ color: mutedText }} />
                            </div>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "12px 16px 12px 42px",
                                border: `1px solid ${inputBorder}`, borderRadius: 16,
                                background: inputBg, color: inputText,
                                outline: "none", transition: "all 0.2s",
                                boxSizing: "border-box",
                              }}
                              placeholder={t("user.passwordPlaceholder")}
                              required
                            />
                          </div>
                        </div>
                        <div className="animate-fade-in">
                          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: labelText, marginBottom: 6 }}>
                            {t("user.locationLabel")}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <MapPin className="h-4 w-4" style={{ color: mutedText }} />
                            </div>
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "12px 16px 12px 42px",
                                border: `1px solid ${inputBorder}`, borderRadius: 16,
                                background: inputBg, color: inputText,
                                outline: "none", transition: "all 0.2s",
                                boxSizing: "border-box",
                              }}
                              placeholder={t("user.locationPlaceholder")}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

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
                      ) : isSignUp ? (
                        t("user.createAccount")
                      ) : (
                        t("user.signIn")
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-6">
                    <p className="text-sm" style={{ color: mutedText }}>
                      {isSignUp
                        ? t("user.alreadyHaveAccountText")
                        : t("user.dontHaveAccountText")}
                      <button
                        type="button"
                        onClick={toggleAuthMode}
                        className="ml-1.5 font-bold transition-colors hover:underline"
                        style={{ color: linkText, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = linkTextHover}
                        onMouseLeave={(e) => e.currentTarget.style.color = linkText}
                      >
                        {isSignUp ? t("user.signIn") : t("user.register")}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PageMotionStyles />
    </div>
  );
}
