import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api/authService";
import { userService } from "@/services/api/userService";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

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
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showManualAuth, setShowManualAuth] = useState(false);
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

  const cardBg = isDark ? '#111115' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0';
  const inputText = isDark ? '#ffffff' : '#1e293b';
  const inputPlaceholder = isDark ? 'rgba(255,255,255,0.30)' : undefined;
  const labelText = isDark ? 'rgba(255,255,255,0.80)' : '#1e293b';
  const mutedText = isDark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const dividerBg = isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0';
  const fadeBottomGradient = isDark
    ? 'linear-gradient(to top, #0a0a0c, transparent)'
    : 'linear-gradient(to top, #ffffff, transparent)';
  const googleBtnBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const googleBtnBorder = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0';
  const googleBtnText = isDark ? '#ffffff' : '#1e293b';
  const createAccountBtnBg = isDark ? 'transparent' : '#ffffff';
  const createAccountBtnBorder = isDark ? '#E8192C' : '#b91c1c';
  const createAccountBtnText = isDark ? '#fca5a5' : '#991b1b';

  if (showManualAuth) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: isDark ? '#0a0a0c' : '#ffffff' }}>
        {/* Albania flag gradient — red to black */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-950 to-black" />

        {/* Decorative cross-hatched overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "14px 14px",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.72)_100%)]" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-28" style={{ background: fadeBottomGradient }} />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-5xl">
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* Brand panel */}
              <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-7 md:p-9 shadow-2xl shadow-black/35 animate-fade-in">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
                      BookinAL
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowManualAuth(false)}
                    className="text-white/70 hover:text-white text-xs font-semibold tracking-wide transition-colors"
                  >
                    {t("common.back", { defaultValue: "Back" })}
                  </button>
                </div>

                <h1 className="mt-6 text-4xl md:text-5xl font-black text-white leading-[0.95] tracking-tight">
                  {isSignUp ? t("user.joinBookinAL") : t("user.welcomeBack")}
                </h1>
                <p className="mt-4 text-white/65 text-sm md:text-base leading-relaxed max-w-md">
                  {isSignUp
                    ? t("user.startAlbanianAdventure")
                    : t("user.continueExploringAlbania")}
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  {["🏨", "🏠", "🚗"].map((icon, i) => (
                    <div
                      key={icon}
                      className="rounded-2xl bg-white/6 border border-white/10 px-4 py-4 text-center shadow-sm animate-fade-in-up"
                      style={{ animationDelay: `${120 + i * 90}ms` }}
                    >
                      <div className="text-2xl">{icon}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-red-400/70 to-white/15" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-5">
                  <div className="flex justify-center gap-1.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`block rounded-full bg-red-300 ${
                          i === 2
                            ? "w-7 h-1.5"
                            : "w-1.5 h-1.5 opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/65 text-center leading-relaxed">
                    {t("user.termsAgreement")}
                  </p>
                </div>
              </div>

              {/* Auth card */}
              <div className="lg:col-span-7 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
                <div
                  className="rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <div className="h-2 bg-gradient-to-r from-red-700 via-red-600 to-black" />

                  <div className="p-7 md:p-10">
                    {error && (
                      <div style={{
                        background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2',
                        border: `1px solid ${isDark ? 'rgba(239,68,68,0.30)' : '#fecaca'}`,
                        color: isDark ? '#fca5a5' : '#991b1b',
                        padding: '12px 16px', borderRadius: 16, marginBottom: 16,
                      }} className="animate-fade-in">
                        <p className="text-sm font-semibold">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div style={{
                        background: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',
                        border: `1px solid ${isDark ? 'rgba(16,185,129,0.30)' : '#a7f3d0'}`,
                        color: isDark ? '#6ee7b7' : '#065f46',
                        padding: '12px 16px', borderRadius: 16, marginBottom: 16,
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
                          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: labelText, marginBottom: 8 }}>
                            {t("user.fullNameLabel")}
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                              width: '100%', padding: '12px 16px',
                              border: `1px solid ${inputBorder}`, borderRadius: 16,
                              background: inputBg, color: inputText,
                              outline: 'none', transition: 'border-color 0.2s',
                              boxSizing: 'border-box',
                            }}
                            placeholder={t("user.fullNamePlaceholder")}
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: labelText, marginBottom: 8 }}>
                          {t("user.emailLabel")}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 16px',
                            border: `1px solid ${inputBorder}`, borderRadius: 16,
                            background: inputBg, color: inputText,
                            outline: 'none', transition: 'border-color 0.2s',
                            boxSizing: 'border-box',
                          }}
                          placeholder={t("user.emailPlaceholder")}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: labelText, marginBottom: 8 }}>
                          {t("user.passwordLabel")}
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 16px',
                            border: `1px solid ${inputBorder}`, borderRadius: 16,
                            background: inputBg, color: inputText,
                            outline: 'none', transition: 'border-color 0.2s',
                            boxSizing: 'border-box',
                          }}
                          placeholder={t("user.passwordPlaceholder")}
                          required
                        />
                      </div>

                      {isSignUp && (
                        <>
                          <div className="animate-fade-in">
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: labelText, marginBottom: 8 }}>
                              {t("user.confirmPasswordLabel")}
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              style={{
                                width: '100%', padding: '12px 16px',
                                border: `1px solid ${inputBorder}`, borderRadius: 16,
                                background: inputBg, color: inputText,
                                outline: 'none', transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                              }}
                              placeholder={t("user.passwordPlaceholder")}
                              required
                            />
                          </div>
                          <div className="animate-fade-in">
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: labelText, marginBottom: 8 }}>
                              {t("user.locationLabel")}
                            </label>
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              style={{
                                width: '100%', padding: '12px 16px',
                                border: `1px solid ${inputBorder}`, borderRadius: 16,
                                background: inputBg, color: inputText,
                                outline: 'none', transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                              }}
                              placeholder={t("user.locationPlaceholder")}
                              required
                            />
                          </div>
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-red-700 via-red-600 to-black text-white py-3.5 px-4 rounded-2xl hover:from-red-800 hover:via-red-700 hover:to-black transition-all font-bold shadow-lg shadow-red-900/25 hover:shadow-xl hover:shadow-red-900/30 transform hover:scale-[1.01] ${
                          loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {t("user.processing")}
                          </span>
                        ) : isSignUp ? (
                          t("user.createAccount")
                        ) : (
                          t("user.signIn")
                        )}
                      </button>
                    </form>

                    <div className="relative my-7">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" style={{ borderColor: dividerBg }}></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 font-semibold" style={{ background: cardBg, color: mutedText }}>
                          {t("user.or")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowManualAuth(false);
                        handleGoogleSignIn();
                      }}
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: googleBtnBg,
                        border: `1px solid ${googleBtnBorder}`,
                        color: googleBtnText,
                        padding: '14px 16px',
                        borderRadius: 16,
                        fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'opacity 0.2s',
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {t("user.continueWithGoogle")}
                    </button>

                    <div className="text-center mt-7">
                      <p className="text-sm" style={{ color: mutedText }}>
                        {isSignUp
                          ? t("user.alreadyHaveAccountText")
                          : t("user.dontHaveAccountText")}
                        <button
                          type="button"
                          onClick={toggleAuthMode}
                          className="ml-1 font-bold transition-colors"
                          style={{ color: '#E8192C', background: 'transparent', border: 'none', cursor: 'pointer' }}
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

  if (initialLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: isDark ? '#0a0a0c' : '#ffffff' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.72)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/80"></div>
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
            {t("user.processing")}
          </div>
        </div>
        <PageMotionStyles />
      </div>
    );
  }

  // OAuth page view
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: isDark ? '#0a0a0c' : '#ffffff' }}>
      {/* Albania flag gradient — red to black */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-950 to-black" />

      {/* Decorative cross-hatched overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.72)_100%)]" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28" style={{ background: fadeBottomGradient }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Brand panel */}
            <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-7 md:p-10 shadow-2xl shadow-black/35 animate-fade-in">
              <span className="inline-block text-red-200/90 text-[11px] font-bold uppercase tracking-[0.32em] mb-5">
                Albania · Travel · Stays
              </span>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
                  BookinAL
                </span>
              </div>

              <h1 className="mt-6 text-5xl md:text-6xl font-black text-white leading-[0.9] tracking-tight">
                {t("user.welcomeToAlbania")}
                <br />
                <span className="bg-gradient-to-r from-red-200 to-white bg-clip-text text-transparent">
                  {t("user.gatewayToExperiences")}
                </span>
              </h1>

              <p className="mt-5 text-white/65 text-sm md:text-base leading-relaxed max-w-md">
                Secure sign-in, fast booking, and a curated experience—designed in the colors of the Albanian flag.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { icon: "🏨", label: t("user.hotels") },
                  { icon: "🏠", label: t("user.apartments") },
                  { icon: "🚗", label: t("user.carRentals") },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/6 border border-white/10 px-4 py-4 text-center shadow-sm animate-fade-in-up"
                    style={{ animationDelay: `${160 + i * 90}ms` }}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <p className="mt-2 text-[11px] font-bold tracking-wide text-white/75">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-black/25 p-5">
                <div className="flex justify-center gap-1.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`block rounded-full bg-red-300 ${i === 2 ? "w-7 h-1.5" : "w-1.5 h-1.5 opacity-50"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/65 text-center leading-relaxed">
                  {t("user.termsAgreement")}{" "}
                  <span className="text-white/85 font-semibold">{t("user.termsOfService")}</span>{" "}
                  {t("user.and")}{" "}
                  <span className="text-white/85 font-semibold">{t("user.privacyPolicy")}</span>
                </p>
              </div>
            </div>

            {/* Auth card */}
            <div className="lg:col-span-6 animate-fade-in-up" style={{ animationDelay: "90ms" }}>
              <div
                className="rounded-3xl shadow-2xl overflow-hidden"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div className="h-2 bg-gradient-to-r from-red-700 via-red-600 to-black" />

                <div className="p-7 md:p-10">
                  <h2 className="text-2xl font-black mb-6" style={{ color: labelText }}>
                    {t("user.getStarted")}
                  </h2>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: googleBtnBg,
                      border: `1px solid ${googleBtnBorder}`,
                      color: googleBtnText,
                      padding: '14px 16px',
                      borderRadius: 16,
                      fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t("user.continueWithGoogle")}
                  </button>

                  <div className="relative my-7">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: dividerBg }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 font-semibold" style={{ background: cardBg, color: mutedText }}>
                        {t("user.orContinueWithEmail")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => { setShowManualAuth(true); setIsSignUp(false); }}
                      className="w-full bg-gradient-to-r from-red-700 via-red-600 to-black text-white py-3.5 px-4 rounded-2xl hover:from-red-800 hover:via-red-700 hover:to-black transition-all duration-200 font-bold shadow-lg shadow-red-900/25 hover:shadow-xl transform hover:scale-[1.01]"
                    >
                      {t("user.signInWithEmail")}
                    </button>

                    <button
                      onClick={() => { setShowManualAuth(true); setIsSignUp(true); }}
                      style={{
                        width: '100%',
                        background: createAccountBtnBg,
                        border: `1px solid ${createAccountBtnBorder}`,
                        color: createAccountBtnText,
                        padding: '14px 16px',
                        borderRadius: 16,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s, transform 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                    >
                      {t("user.createNewAccount")}
                    </button>
                  </div>

                  <p className="text-center text-xs mt-7 leading-relaxed" style={{ color: mutedText }}>
                    {t("user.termsAgreement")}{" "}
                    <a href="#" className="font-bold" style={{ color: '#E8192C' }}>{t("user.termsOfService")}</a>{" "}
                    {t("user.and")}{" "}
                    <a href="#" className="font-bold" style={{ color: '#E8192C' }}>{t("user.privacyPolicy")}</a>
                  </p>
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
