// Rewritten full component/module
import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  sidebarClasses,
} from "react-pro-sidebar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Home,
  Hotel,
  Car,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  MessageSquare,
  Package,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ====================
// CONFIGURATION ARRAYS
// ====================
// Color constants
const COLORS = {
  // Core surfaces
  sidebarBg: "#0b0b0b", // near-black (flag black)
  sidebarBorder: "#1a1a1a", // subtle black border

  // Primary (flag red)
  primary: "#e41e20", // Albanian red
  primaryDark: "#9b111e", // darker blood red

  // Gradient (red → black)
  primaryGradient: "linear-gradient(135deg, #e41e20 0%, #0b0b0b 100%)",

  // Text
  textLight: "#f5f5f5", // clean white-ish
  textMuted: "#9ca3af", // neutral gray (unchanged, works well)

  // Sub elements
  submenuBg: "#111111", // lifted black

  // States
  disabled: "#6b7280", // muted gray, readable on black
};

// Icon mapping for consistent usage
const ICONS = {
  dashboard: <LayoutDashboard size={20} />,
  apartments: <Home size={20} />,
  hotels: <Hotel size={20} />,
  cars: <Car size={20} />,
  users: <Users size={20} />,
  calendar: <Calendar size={20} />,
  finance: <DollarSign size={20} />,
  analytics: <BarChart3 size={20} />,
  messages: <MessageSquare size={20} />,
  inventory: <Package size={20} />,
  notifications: <Bell size={20} />,
  documentation: <FileText size={20} />,
  settings: <Settings size={20} />,
  bookings: <Calendar size={20} />,
};

// Route paths configuration
const ROUTES = {
  home: "/",
  apartments: {
    list: "/dashboard/ApartmentsList",
  },
  hotels: {
    list: "/dashboard/HotelsList",
  },
  cars: {
    fleet: "/dashboard/carsList",
  },
  users: {
    management: "/dashboard/userManagement",
    roles: "/dashboard/requestsManagement",
    propertyRequests: "/dashboard/propertyRequestsManagement",
  },
  bookings: {
    list: "/dashboard/bookings",
    supervision: "/dashboard/bookings/providers",
  },
  destinations: {
    management: "/dashboard/destinations",
  },
  support: {
    chat: "/dashboard/support",
  },
};

// Menu items configuration with role-based access
// Moved inside component for translation

// ====================
// STYLES CONFIGURATION
// ====================
const menuItemStyles = {
  button: ({ level, active, disabled }) => ({
    color: disabled ? COLORS.disabled : COLORS.textLight,
    backgroundColor: active ? COLORS.primary : "transparent",
    borderRadius: "8px",
    margin: "4px 8px",
    padding: level === 0 ? "10px 16px" : "8px 16px",
    fontWeight: level === 0 ? 500 : 400,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: active ? COLORS.primary : COLORS.sidebarBorder,
      color: "#ffffff",
    },
  }),
  subMenuContent: {
    backgroundColor: COLORS.submenuBg,
  },
};

// ====================
// HELPER FUNCTIONS
// ====================
const hasAccess = (roles: string[], userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return roles.includes(userRole.toLowerCase());
};

// ====================
// MAIN COMPONENT
// ====================
const Hsidebar = ({ children }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  // Get user role
  const userRole = user?.role?.toLowerCase();

  // Menu items configuration with role-based access
  const MENU_ITEMS = {
    singleItems: [
      {
        label: t("sidebar.home"),
        icon: ICONS.dashboard,
        route: ROUTES.home,
        roles: ["admin", "provider"], // Available to both roles
      },
    ],
    subMenuItems: [
      {
        label: t("sidebar.apartments.title"),
        icon: ICONS.apartments,
        roles: ["admin", "provider"],
        items: [
          {
            label: t("sidebar.apartments.allApartments"),
            route: ROUTES.apartments.list,
            roles: ["admin", "provider"],
          },
        ],
      },
      {
        label: t("sidebar.hotels.title"),
        icon: ICONS.hotels,
        roles: ["admin", "provider"],
        items: [
          {
            label: t("sidebar.hotels.allHotels"),
            route: ROUTES.hotels.list,
            roles: ["admin", "provider"],
          },
        ],
      },
      {
        label: t("sidebar.cars.title"),
        icon: ICONS.cars,
        roles: ["admin", "provider"],
        items: [
          {
            label: t("sidebar.cars.fleetManagement"),
            route: ROUTES.cars.fleet,
            roles: ["admin", "provider"],
          },
        ],
      },
      {
        label: t("sidebar.bookings.title"),
        icon: ICONS.bookings,
        roles: ["admin", "provider"],
        items: [
          {
            label: t("sidebar.bookings.allBookings"),
            route: ROUTES.bookings.list,
            roles: ["admin", "provider"],
          },
          {
            label: t("sidebar.bookings.supervision"),
            route: ROUTES.bookings.supervision,
            roles: ["admin"],
          },
        ],
      },
      {
        label: t("sidebar.destinations.title"),
        icon: ICONS.settings,
        roles: ["admin"],
        items: [
          {
            label: t("sidebar.destinations.management"),
            route: ROUTES.destinations.management,
            roles: ["admin"],
          },
        ],
      },
      {
        label: t("sidebar.support.title"),
        icon: ICONS.messages,
        roles: ["admin"],
        items: [
          {
            label: t("sidebar.support.chatDashboard"),
            route: ROUTES.support.chat,
            roles: ["admin"],
          },
        ],
      },
      {
        label: t("sidebar.users.title"),
        icon: ICONS.users,
        roles: ["admin"], // Only admin can see users
        items: [
          {
            label: t("sidebar.users.management"),
            route: ROUTES.users.management,
            roles: ["admin"],
          },
          {
            label: t("sidebar.users.providerRequests"),
            route: ROUTES.users.roles,
            roles: ["admin"],
          },
          {
            label: t("sidebar.users.propertyRequests"),
            route: ROUTES.users.propertyRequests,
            roles: ["admin"],
          },
        ],
      },
    ],
  };

  // Render single menu items (filtered by role)
  const renderSingleItems = () => {
    return MENU_ITEMS.singleItems
      .filter((item) => hasAccess(item.roles, userRole))
      .map((item, index) => (
        <MenuItem
          key={`single-${index}`}
          icon={item.icon}
          component={<Link to={item.route} />}
        >
          {item.label}
        </MenuItem>
      ));
  };

  // Render submenu items (filtered by role)
  const renderSubMenuItems = () => {
    return MENU_ITEMS.subMenuItems
      .filter((submenu) => hasAccess(submenu.roles, userRole))
      .map((submenu, index) => {
        // Filter submenu items based on role
        const accessibleItems = submenu.items.filter((item) =>
          hasAccess(item.roles, userRole),
        );

        // Only render submenu if it has accessible items
        if (accessibleItems.length === 0) return null;

        return (
          <SubMenu
            key={`submenu-${index}`}
            icon={submenu.icon}
            label={submenu.label}
          >
            {accessibleItems.map((item, itemIndex) => (
              <MenuItem
                key={`${submenu.label}-${itemIndex}`}
                component={<Link to={item.route} />}
              >
                {item.label}
              </MenuItem>
            ))}
          </SubMenu>
        );
      });
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        collapsed={collapsed}
        transitionDuration={300}
        width="280px"
        collapsedWidth="80px"
        backgroundColor={COLORS.sidebarBg}
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            backgroundColor: COLORS.sidebarBg,
            borderRight: `1px solid ${COLORS.sidebarBorder}`,
          },
        }}
      >
        {/* Logo Section */}
        <div
          className={`min-h-20 flex items-center ${collapsed ? "justify-center p-6" : "justify-between p-6"}`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Hotel size={32} style={{ color: COLORS.primary }} />

              <span className="text-xl font-semibold text-white">
                {t("sidebar.brand")}
              </span>
            </div>
          ) : (
            <Hotel size={28} style={{ color: COLORS.primary }} />
          )}
        </div>

        {/* Menu Section */}
        <div className="py-4 overflow-y-auto h-[calc(100vh-160px)]">
          <Menu menuItemStyles={menuItemStyles}>
            {renderSingleItems()}
            {renderSubMenuItems()}
          </Menu>
        </div>

        {/* Toggle Button */}
        <div
          className={`
            p-4 border-t border-gray-800 flex
            ${collapsed ? "justify-center" : "justify-end"}
          `}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: COLORS.primaryGradient,
              border: `1px solid ${COLORS.primaryDark}`,
              color: COLORS.textLight,
            }}
            className="rounded-lg p-2.5 flex items-center gap-2 transition-all duration-200 font-medium"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>{t("sidebar.collapse")}</span>
              </>
            )}
          </button>
        </div>
      </Sidebar>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ background: isDark ? "#0d0d0d" : "#f5f4f1" }}>{children}</main>
    </div>
  );
};

export default Hsidebar;
