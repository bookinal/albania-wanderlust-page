import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api/authService";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function AuthPage() {
  const { t } = useTranslation();
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

  type propsHedear = {
    preventDefault: () => void;
  };

  const handleManualSignIn = async (e: propsHedear) => {
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
        navigate("/");
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || t("user.signInFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: propsHedear) => {
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

  if (showManualAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Albania-themed gradient */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-center text-white">
              {isSignUp ? t("user.joinBookinAL") : t("user.welcomeBack")}
            </h1>
            <p className="text-center text-red-100 text-sm mt-2">
              {isSignUp
                ? t("user.startAlbanianAdventure")
                : t("user.continueExploringAlbania")}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            <form
              onSubmit={isSignUp ? handleManualSignUp : handleManualSignIn}
              className="space-y-4"
            >
              {isSignUp && (
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    {t("user.fullNameLabel")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder={t("user.fullNamePlaceholder")}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">
                  {t("user.emailLabel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder={t("user.emailPlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">
                  {t("user.passwordLabel")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder={t("user.passwordPlaceholder")}
                  required
                />
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-2">
                      {t("user.confirmPasswordLabel")}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder={t("user.passwordPlaceholder")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-2">
                      {t("user.locationLabel")}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder={t("user.locationPlaceholder")}
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 font-medium">
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
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold flex items-center justify-center shadow-sm hover:shadow-md"
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

            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                {isSignUp
                  ? t("user.alreadyHaveAccountText")
                  : t("user.dontHaveAccountText")}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                >
                  {isSignUp ? t("user.signIn") : t("user.register")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OAuth page view
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-full font-bold text-xl mb-4 shadow-lg">
            BookinAL
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            {t("user.welcomeToAlbania")}
          </h1>
          <p className="text-slate-600 text-lg">
            {t("user.gatewayToExperiences")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Decorative header */}
          <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
              {t("user.getStarted")}
            </h2>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3.5 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center shadow-md group"
            >
              <svg
                className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
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
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">
                  {t("user.orContinueWithEmail")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowManualAuth(true);
                  setIsSignUp(false);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {t("user.signInWithEmail")}
              </button>

              <button
                onClick={() => {
                  setShowManualAuth(true);
                  setIsSignUp(true);
                }}
                className="w-full bg-white border-2 border-red-600 text-red-600 py-3.5 px-4 rounded-xl hover:bg-red-50 hover:border-red-700 transition-all duration-200 font-semibold transform hover:scale-[1.02]"
              >
                {t("user.createNewAccount")}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
              {t("user.termsAgreement")}{" "}
              <a
                href="#"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {t("user.termsOfService")}
              </a>{" "}
              {t("user.and")}{" "}
              <a
                href="#"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {t("user.privacyPolicy")}
              </a>
            </p>
          </div>
        </div>

        {/* Features section */}
        <div
          className="mt-8 grid grid-cols-3 gap-4 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl mb-2">🏨</div>
            <p className="text-xs font-semibold text-slate-700">
              {t("user.hotels")}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl mb-2">🏠</div>
            <p className="text-xs font-semibold text-slate-700">
              {t("user.apartments")}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl mb-2">🚗</div>
            <p className="text-xs font-semibold text-slate-700">
              {t("user.carRentals")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
