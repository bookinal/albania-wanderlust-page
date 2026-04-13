import * as React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authService } from "@/services/api/authService";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  CalendarDays,
  LayoutDashboard,
  User2,
  LogOut,
  LogIn,
  Menu,
  X,
  MapPin,
  Car,
  BookOpen,
  Home,
  ChevronDown,
  Building2,
  Sun,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PrimarySearchAppBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, userRole, loading, handleLogout } = useAuth();

  const [avatarError, setAvatarError] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Scroll-aware transparency
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar_url]);

  const isProfileComplete = React.useMemo(() => {
    if (!user) return false;
    return !!(user.full_name && user.phone && user.location);
  }, [user]);

  const getUserInitials = React.useMemo(() => {
    if (!user) return "";
    return (user.full_name || user.email || "")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  const isAdmin = userRole?.role === "admin" || userRole === "admin";
  const isProvider = userRole?.role === "provider" || userRole === "provider";
  const isUser = userRole?.role === "user" || userRole === "user";

  const navLinks = [
    {
      label: t("sidebar.home") || "Home",
      href: "/",
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: t("common.stay") || "Stays",
      href: "/searchResults",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      label: t("common.car") || "Cars",
      href: "/searchCarResults",
      icon: <Car className="w-4 h-4" />,
    },
    {
      label: t("common.culture") || "Culture",
      href: "/CultureDetails",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: t("common.map") || "Map",
      href: "/properties-map",
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const renderAvatar= (size = "md") => {
    const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs";
    if (user?.avatar_url && !avatarError) {
      return (
        <img
          src={user.avatar_url}
          alt={user.full_name || user.email}
          className={`${dim} rounded-full object-cover`}
          onError={() => setAvatarError(true)}
        />
      );
    }
    return (
      <div
        className={`${dim} rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold flex-shrink-0`}
      >
        {getUserInitials}
      </div>
    );
  };

  return (
    <>
      {/* Noise texture + shimmer keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');

        @keyframes appbar-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .appbar-luxury {
          background:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"),
            linear-gradient(105deg,
              #000000 0%,
              #1a0204 12%,
              #cc1525 28%,
              #E8192C 42%,
              #ff6b7a 50%,
              #E8192C 58%,
              #cc1525 72%,
              #1a0204 88%,
              #000000 100%
            );
          background-size: 200px 200px, 300% 100%;
          background-position: 0 0, 100% 0;
          transition: background-position 0.7s ease;
        }
        .appbar-luxury:hover {
          background-position: 0 0, 55% 0;
        }
        .appbar-luxury::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.1) 20%,
            rgba(255,255,255,0.35) 50%,
            rgba(255,255,255,0.1) 80%,
            transparent 100%
          );
        }
        .appbar-scrolled-dark {
          background:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"),
            rgba(10,10,12,0.97);
          background-size: 200px 200px, auto;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(232,25,44,0.15);
        }
        .appbar-scrolled-light {
          background: rgba(253,249,247,0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(232,25,44,0.12);
          box-shadow: 0 1px 20px rgba(0,0,0,0.06);
        }
      `}</style>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? isDark ? 'appbar-scrolled-dark' : 'appbar-scrolled-light'
            : 'appbar-luxury'
        }`}
        style={{ position: 'fixed' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <button
              onClick={() => navigate("/")}
              className={`font-black text-xl tracking-tight transition-colors ${
                scrolled ? (isDark ? 'text-[#f0ece8]' : 'text-gray-900') : 'text-white'
              }`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              BOOKinAL<span style={{ color: '#E8192C' }}>.</span>
            </button>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    style={{
                      fontFamily: 'Crimson Pro, Georgia, serif',
                      fontSize: '0.95rem',
                      letterSpacing: '0.03em',
                      padding: '6px 16px',
                      borderRadius: 3,
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      ...(scrolled
                        ? {
                            color: isActive
                              ? '#E8192C'
                              : isDark ? 'rgba(240,236,232,0.65)' : 'rgba(17,17,21,0.6)',
                            background: isActive
                              ? isDark ? 'rgba(232,25,44,0.1)' : 'rgba(232,25,44,0.06)'
                              : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                          }
                        : {
                            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.72)',
                            background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                          }
                      ),
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.color = scrolled
                          ? (isDark ? '#f0ece8' : '#111115')
                          : '#ffffff';
                        (e.currentTarget as HTMLAnchorElement).style.background = scrolled
                          ? (isDark ? 'rgba(240,236,232,0.06)' : 'rgba(17,17,21,0.04)')
                          : 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.color = scrolled
                          ? (isDark ? 'rgba(240,236,232,0.65)' : 'rgba(17,17,21,0.6)')
                          : 'rgba(255,255,255,0.72)';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Side Actions ── */}
            <div className="flex items-center gap-1">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                  !scrolled
                    ? "text-white/80 hover:text-white hover:bg-white/15"
                    : "text-gray-500 hover:text-amber-500 hover:bg-amber-50"
                }`}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <span
                  style={{
                    position: 'absolute',
                    transition: 'opacity 0.2s, transform 0.3s',
                    opacity: isDark ? 1 : 0,
                    transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
                  }}
                >
                  <Sun className="w-[17px] h-[17px]" />
                </span>
                <span
                  style={{
                    position: 'absolute',
                    transition: 'opacity 0.2s, transform 0.3s',
                    opacity: isDark ? 0 : 1,
                    transform: isDark ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
                  }}
                >
                  <Moon className="w-[17px] h-[17px]" />
                </span>
              </button>

              {/* Language Switcher */}
              <div
                className={
                  !scrolled
                    ? "[&_button]:text-white [&_button:hover]:bg-white/15"
                    : ""
                }
              >
                <LanguageSwitcher />
              </div>

              {/* Wishlist — desktop only */}
              {user && (
                <button
                  onClick={() => navigate("/wishlist")}
                  title={t("appBar.myWishlist")}
                  className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    !scrolled
                      ? "text-white/80 hover:text-white hover:bg-white/15"
                      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Heart className="w-[18px] h-[18px]" />
                </button>
              )}

              {/* ── Profile Dropdown (desktop) ── */}
              <div className="hidden md:block">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full transition-all outline-none ${
                          !scrolled
                            ? "hover:bg-white/15 text-white"
                            : "hover:bg-gray-50 border border-gray-200 text-gray-700"
                        }`}
                      >
                        {/* Profile incomplete dot */}
                        <div className="relative">
                          {renderAvatar("sm")}
                          {!isProfileComplete && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-60 mt-2 rounded-2xl shadow-xl border-gray-100 p-1">
                      {/* User info header */}
                      <div className="px-3 py-3 mb-1">
                        <div className="flex items-center gap-3">
                          {renderAvatar()}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {user.full_name || "User"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="mx-2" />

                      {isAdmin && (
                        <DropdownMenuItem
                          onClick={() => navigate("/dashboard")}
                          className="rounded-xl mx-1 gap-2.5"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          {t("appBar.dashboard")}
                        </DropdownMenuItem>
                      )}
                      {isProvider && isProfileComplete && (
                        <DropdownMenuItem
                          onClick={() => navigate("/dashboard")}
                          className="rounded-xl mx-1 gap-2.5"
                        >
                          <Home className="w-4 h-4 text-gray-400" />
                          {t("appBar.propertiesManagement")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => navigate("/myBookings")}
                        className="rounded-xl mx-1 gap-2.5"
                      >
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {t("appBar.myBookings")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/myAccount")}
                        className="rounded-xl mx-1 gap-2.5"
                      >
                        <User2 className="w-4 h-4 text-gray-400" />
                        <span className="flex-1">
                          {isProfileComplete
                            ? t("appBar.myAccount")
                            : t("appBar.completeProfile")}
                        </span>
                        {!isProfileComplete && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                        )}
                      </DropdownMenuItem>
                      {isUser && (
                        <DropdownMenuItem
                          onClick={() => navigate("/ProviderRequest")}
                          className="rounded-xl mx-1 gap-2.5"
                        >
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {t("appBar.becomeProvider")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="mx-2" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="rounded-xl mx-1 gap-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("appBar.logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      !scrolled
                        ? "bg-white/15 text-white border border-white/25 hover:bg-white/25"
                        : "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    {t("appBar.login")}
                  </button>
                )}
              </div>

              {/* ── Mobile Hamburger ── */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className={`md:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                  !scrolled
                    ? "text-white hover:bg-white/15"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu Panel ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? "max-h-[90vh] opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{
            background: isDark ? '#0f0f12' : '#fdf9f7',
            borderTop: `1px solid ${isDark ? 'rgba(232,25,44,0.15)' : 'rgba(232,25,44,0.1)'}`,
          }}
        >
          <div className="container mx-auto px-4 pt-3 pb-6 space-y-1">
            {/* Nav links */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontFamily: 'Crimson Pro, Georgia, serif',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? '#E8192C'
                      : isDark ? 'rgba(240,236,232,0.65)' : 'rgba(17,17,21,0.65)',
                    background: isActive
                      ? isDark ? 'rgba(232,25,44,0.1)' : 'rgba(232,25,44,0.06)'
                      : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ color: isActive ? '#E8192C' : isDark ? 'rgba(240,236,232,0.35)' : 'rgba(17,17,21,0.35)' }}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${isDark ? 'rgba(232,25,44,0.12)' : 'rgba(232,25,44,0.1)'}`, marginTop: 10, paddingTop: 10 }} className="space-y-1">
              {user ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3 mb-1">
                    {renderAvatar()}
                    <div className="min-w-0">
                      <p style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.95rem', fontWeight: 600, color: isDark ? '#f0ece8' : '#111115' }} className="truncate">
                        {user.full_name || "User"}
                      </p>
                      <p style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: '0.8rem', color: isDark ? 'rgba(240,236,232,0.4)' : 'rgba(17,17,21,0.4)' }} className="truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {[
                    { label: t("appBar.myWishlist"), icon: <Heart className="w-4 h-4" />, action: () => { navigate("/wishlist"); setMobileOpen(false); } },
                    { label: t("appBar.myBookings"), icon: <CalendarDays className="w-4 h-4" />, action: () => { navigate("/myBookings"); setMobileOpen(false); } },
                    { label: isProfileComplete ? t("appBar.myAccount") : t("appBar.completeProfile"), icon: <User2 className="w-4 h-4" />, action: () => { navigate("/myAccount"); setMobileOpen(false); }, dot: !isProfileComplete },
                    ...((isAdmin || isProvider) ? [{ label: t("appBar.dashboard"), icon: <LayoutDashboard className="w-4 h-4" />, action: () => { navigate("/dashboard"); setMobileOpen(false); } }] : []),
                    ...(isUser ? [{ label: t("appBar.becomeProvider"), icon: <Building2 className="w-4 h-4" />, action: () => { navigate("/ProviderRequest"); setMobileOpen(false); } }] : []),
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        borderRadius: 4,
                        fontFamily: 'Crimson Pro, Georgia, serif',
                        fontSize: '0.95rem',
                        color: isDark ? 'rgba(240,236,232,0.65)' : 'rgba(17,17,21,0.65)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ color: isDark ? 'rgba(240,236,232,0.3)' : 'rgba(17,17,21,0.3)' }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />}
                    </button>
                  ))}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 16px',
                      borderRadius: 4,
                      fontFamily: 'Crimson Pro, Georgia, serif',
                      fontSize: '0.95rem',
                      color: '#E8192C',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("appBar.logout")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate("/auth"); setMobileOpen(false); }}
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    background: '#E8192C',
                    color: '#ffffff',
                    borderRadius: 4,
                    fontFamily: 'Bebas Neue, Impact, sans-serif',
                    fontSize: '1rem',
                    letterSpacing: '0.08em',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  {t("appBar.login")}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Flow spacer — ensures content below the fixed nav is not hidden */}
      <div className="h-16" />
    </>
  );
}

