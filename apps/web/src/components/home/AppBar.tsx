import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MoreIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api/authService";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { Heart, Home } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function PrimarySearchAppBar() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [user, setUser] = React.useState<User>(null);
  const [userRole, setUserRole] = React.useState<any>(null);
  const [userStatus, setUserStaus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [avatarError, setAvatarError] = React.useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const navigate = useNavigate();

  // Fetch current user on mount
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();

        // Not signed in → stop here
        if (!currentUser) {
          console.log("user not found ");

          setUser(null);
          setUserRole(null);
          setUserStaus(null);
          return;
        }

        // User exists → fetch role;
        setUser(currentUser);
        setUserRole(currentUser.role);
        setUserStaus(currentUser.status);
      } catch {
        // Silent fail — user likely not authenticated
        setUser(null);
        setUserRole(null);
        setUserStaus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle suspended user redirection
  React.useEffect(() => {
    if (userStatus === "suspended") {
      handleLogout();
      window.open("/suspended", "_blank");
    }
  }, [userStatus, navigate]);

  // Reset avatar error when user or avatar URL changes
  React.useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar_url]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    authService.signOut();
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  const handleLogin = () => {
    handleMenuClose();
    setTimeout(() => {
      navigate("/auth");
    }, 100);
  };

  const handleMyAccount = () => {
    if (!user) return;
    handleMenuClose();
    navigate("/myAccount");
  };

  const handleDashboard = () => {
    handleMenuClose();
    navigate("/dashboard/bookings");
  };

  const handleMyBookings = () => {
    handleMenuClose();
    if (!user) {
      handleLogin();
      return;
    }
    navigate("/myBookings");
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // Check if user profile is complete
  const isProfileComplete = React.useMemo(() => {
    if (!user) return false;
    return !!(user.full_name && user.phone && user.location);
  }, [user]);

  // Get user initials for fallback
  const getUserInitials = React.useMemo(() => {
    if (!user) return "";
    const name = user.full_name || user.email || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  // Get display name
  const getDisplayName = () => {
    return user?.full_name || user?.email || "User";
  };

  // Check if user is admin
  const isAdmin = React.useMemo(() => {
    return userRole?.role === "admin" || userRole === "admin";
  }, [userRole]);

  const isProvider = React.useMemo(() => {
    return userRole?.role === "provider" || userRole === "provider";
  }, [userRole]);

  const isUser = React.useMemo(() => {
    return userRole?.role === "user" || userRole === "user";
  }, [userRole]);

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1.5,
            borderRadius: 2,
          },
        },
      }}
    >
      {user ? (
        <>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {getDisplayName()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          {isAdmin && (
            <MenuItem onClick={handleDashboard} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              {t("appBar.dashboard")}
            </MenuItem>
          )}
          <MenuItem onClick={handleMyBookings} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <CalendarMonthIcon fontSize="small" />
            </ListItemIcon>
            {t("appBar.myBookings")}
          </MenuItem>
          {isProvider && isProfileComplete && (
            <MenuItem onClick={handleDashboard} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <Home fontSize="small" />
              </ListItemIcon>
              {t("appBar.propertiesManagement")}
            </MenuItem>
          )}
          <MenuItem onClick={handleMyAccount} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            {isProfileComplete
              ? t("appBar.myAccount")
              : t("appBar.completeProfile")}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.5, color: "error.main" }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            {t("appBar.logout")}
          </MenuItem>
        </>
      ) : (
        <MenuItem onClick={handleLogin} sx={{ py: 1.5, color: "primary.main" }}>
          <ListItemIcon>
            <LoginIcon fontSize="small" color="primary" />
          </ListItemIcon>
          {t("appBar.login")}
        </MenuItem>
      )}
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1.5,
            borderRadius: 2,
          },
        },
      }}
    >
      <Divider />
      <MenuItem onClick={handleProfileMenuOpen} sx={{ py: 1.5 }}>
        <ListItemIcon>
          {loading ? (
            <Skeleton variant="circular" width={24} height={24} />
          ) : user?.avatar_url && !avatarError ? (
            <Avatar
              src={user.avatar_url}
              alt={user.full_name || user.email}
              sx={{ width: 24, height: 24 }}
              imgProps={{
                onError: () => setAvatarError(true),
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: "primary.main",
                fontSize: "0.75rem",
              }}
            >
              {getUserInitials}
            </Avatar>
          )}
        </ListItemIcon>
        {t("appBar.profile")}
      </MenuItem>
    </Menu>
  );

  const renderAvatar = () => {
    if (loading) {
      return (
        <Badge
          badgeContent={user && !isProfileComplete ? 1 : 0}
          color="warning"
          variant="dot"
        >
          <Skeleton variant="circular" width={32} height={32} />
        </Badge>
      );
    }

    // Check if we have a valid avatar URL and no error
    const hasValidAvatar = user?.avatar_url && !avatarError;

    const avatarComponent = hasValidAvatar ? (
      <Avatar
        src={user.avatar_url}
        alt={user.full_name || user.email}
        sx={{ width: 32, height: 32 }}
        imgProps={{
          onError: () => setAvatarError(true),
        }}
      />
    ) : (
      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
        {getUserInitials}
      </Avatar>
    );

    return (
      <Badge
        badgeContent={user && !isProfileComplete ? 1 : 0}
        color="warning"
        variant="dot"
      >
        {avatarComponent}
      </Badge>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          //backgroundColor: "rgba(0, 15, 100, 0.78)",
          background:
            "linear-gradient(135deg, #7f1d1d 0%, #7f1d1d 50%, #120000 100%)",

          color: "white",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          zIndex: 1300,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: { xs: "block", sm: "block" },
              cursor: "pointer",
              fontWeight: 600,
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={() => navigate("/")}
          >
            BOOKinAL.
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {user && (
              <Button
                color="inherit"
                startIcon={<CalendarMonthIcon />}
                onClick={() => navigate("/myBookings")}
                sx={{ textTransform: "none", mr: 1 }}
              >
                {t("appBar.myBookings")}
              </Button>
            )}
            {user && (
              <Button
                color="inherit"
                startIcon={<Heart />}
                onClick={() => navigate("/wishlist")}
                sx={{ textTransform: "none", mr: 1 }}
              >
                {t("appBar.myWishlist")}
              </Button>
            )}
            {isUser && (
              <Button
                color="inherit"
                onClick={() => navigate("/ProviderRequest")}
                sx={{ textTransform: "none", mr: 1 }}
              >
                {t("appBar.becomeProvider")}
              </Button>
            )}
            <LanguageSwitcher />
            <Tooltip title={t("appBar.account")}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                {renderAvatar()}
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <LanguageSwitcher />
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
