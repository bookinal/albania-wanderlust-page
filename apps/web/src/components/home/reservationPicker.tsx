// components/reservationPicker.tsx
import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Remove,
  DirectionsCar,
  Hotel,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  CAR_PICKUP_LOCATIONS,
  DEFAULT_CAR_PICKUP_LOCATION,
} from "@/lib/albanianCities";

export default function ReservationPickerValue() {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = React.useState(0); // 0 = Car, 1 = Stay
  const [destination, setDestination] = React.useState("");
  const [pickupLocation, setPickupLocation] = React.useState<string>(
    DEFAULT_CAR_PICKUP_LOCATION,
  );
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined,
  );
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [rooms, setRooms] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
  ) => setter((prev) => prev + 1);

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
  ) => setter((prev) => Math.max(0, prev - 1));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const navigate = useNavigate();

  const firstFieldSx = {
    width: { xs: "100%", sm: "auto" },
    flex: { sm: "1.3 1 0" },
    minWidth: { sm: 220 },
    // 48px tall field, label re-centered to match
    "& .MuiInputBase-input": { py: "12.5px" },
    "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
      transform: "translate(14px, 13px) scale(1)",
    },
  };

  // Helper function to format date as YYYY-MM-DD without timezone conversion
  const formatDateForSearch = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const handleSearch = async () => {
    setLoading(true);
    const searchType = tabValue === 0 ? "car" : "stay";

    if (searchType === "stay") {
      navigate("/searchResults", {
        state: {
          type: "stay",
          destination,
          checkInDate: dateRange?.from
            ? formatDateForSearch(dateRange.from)
            : null,
          checkOutDate: dateRange?.to
            ? formatDateForSearch(dateRange.to)
            : null,
          adults,
          children,
          rooms,
        },
      });
    } else {
      navigate("/searchCarResults", {
        state: {
          type: "car",
          pickupLocation,
          pickupDate: dateRange?.from
            ? formatDateForSearch(dateRange.from)
            : null,
          returnDate: dateRange?.to ? formatDateForSearch(dateRange.to) : null,
        },
      });
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        opacity: 0.85,
        borderRadius: { xs: 2, md: 3 },
        boxShadow: 3,
        width: "100%",
        mx: "auto",
        my: { xs: 0.5, sm: 1, md: 1.5 },
        overflow: "hidden",
      }}
    >
      {/* Tabs Section */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.9rem" },
            minHeight: { xs: 42, sm: 50 },
            py: 0.75,
          },
        }}
      >
        <Tab
          icon={<DirectionsCar fontSize="small" />}
          iconPosition="start"
          label={t("common.car")}
        />
        <Tab
          icon={<Hotel fontSize="small" />}
          iconPosition="start"
          label={t("common.stay")}
        />
      </Tabs>

      {/* Search Fields */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.25, sm: 1.75 },
          p: { xs: 1.5, sm: 2, md: 2.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: { sm: "wrap", md: "nowrap" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1, sm: 1.5 },
            width: "100%",
          }}
        >
          {tabValue === 0 ? (
            <TextField
              select
              label={t("home.reservationPicker.pickupLocation")}
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              variant="outlined"
              size="small"
              sx={firstFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                },
                select: { MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } },
              }}
            >
              {CAR_PICKUP_LOCATIONS.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label={t("home.reservationPicker.Destination")}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              variant="outlined"
              size="small"
              sx={firstFieldSx}
            />
          )}

          <Box
            sx={{
              width: { xs: "100%", sm: "auto" },
              flex: { sm: "1 1 0" },
              minWidth: { sm: 200 },
            }}
          >
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              placeholder={
                tabValue === 1
                  ? t("home.reservationPicker.period")
                  : t("home.reservationPicker.carDate")
              }
              minDate={new Date()}
              className="w-full text-sm [&_button]:!h-12 [&_button]:!text-gray-900 [&_button]:!bg-white [&_button]:border-gray-300 [&_button:hover]:!bg-gray-50"
            />
          </Box>

          {tabValue === 0 && (
            <Button
              variant="contained"
              color="primary"
              disabled={!dateRange?.from || !dateRange?.to || loading}
              onClick={handleSearch}
              size="small"
              sx={{
                px: 4,
                height: 48,
                minWidth: { md: 140 },
                fontWeight: "bold",
                width: { xs: "100%", md: "auto" },
                flexShrink: 0,
              }}
            >
              {loading
                ? t("common.loading")
                : t("home.reservationPicker.search")}
            </Button>
          )}
        </Box>

        {/* Show guest/room fields only for Stay tab */}
        {tabValue === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: { sm: "wrap", md: "nowrap" },
              alignItems: "center",
              justifyContent: { xs: "center", sm: "space-around", md: "flex-start" },
              gap: { xs: 1.5, sm: 2 },
              width: "100%",
              mt: { md: 0.5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: "flex-start",
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  mr: { xs: "auto", sm: 1 },
                }}
              >
                {t("home.reservationPicker.adults")}
              </Typography>
              <IconButton
                onClick={() => handleDecrement(setAdults)}
                size="small"
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {adults}
              </Typography>
              <IconButton
                onClick={() => handleIncrement(setAdults)}
                size="small"
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: "flex-start",
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  mr: { xs: "auto", sm: 1 },
                }}
              >
                {t("home.reservationPicker.children")}
              </Typography>
              <IconButton
                onClick={() => handleDecrement(setChildren)}
                size="small"
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {children}
              </Typography>
              <IconButton
                onClick={() => handleIncrement(setChildren)}
                size="small"
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: "flex-start",
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  mr: { xs: "auto", sm: 1 },
                }}
              >
                {t("home.reservationPicker.rooms")}
              </Typography>
              <IconButton
                onClick={() => handleDecrement(setRooms)}
                size="small"
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {rooms}
              </Typography>
              <IconButton
                onClick={() => handleIncrement(setRooms)}
                size="small"
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              color="primary"
              disabled={!dateRange?.from || !dateRange?.to || loading}
              onClick={handleSearch}
              size="small"
              sx={{
                px: 4,
                height: 48,
                minWidth: { md: 140 },
                fontWeight: "bold",
                width: { xs: "100%", md: "auto" },
                ml: { md: "auto" },
              }}
            >
              {loading
                ? t("common.loading")
                : t("home.reservationPicker.search")}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
