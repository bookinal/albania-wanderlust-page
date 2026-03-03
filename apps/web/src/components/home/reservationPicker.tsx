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
} from "@mui/material";
import { Add, Remove, DirectionsCar, Hotel } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export default function ReservationPickerValue() {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = React.useState(0); // 0 = Car, 1 = Stay
  const [destination, setDestination] = React.useState("");
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
          destination,
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
        maxWidth: { xs: "95%", sm: "90%", md: "fit-content" },
        width: { xs: "95%", sm: "auto" },
        mx: "auto",
        my: { xs: 2, md: 4 },
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
            fontSize: { xs: "0.875rem", sm: "1rem" },
          },
        }}
      >
        <Tab icon={<DirectionsCar />} iconPosition="start" label={t("common.car")} />
        <Tab icon={<Hotel />} iconPosition="start" label={t("common.stay")} />
      </Tabs>

      {/* Search Fields */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1.5, sm: 2 },
          p: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        <TextField
          label={tabValue === 1 ? t("home.reservationPicker.Destination") : t("home.reservationPicker.carModel")}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          variant="outlined"
          sx={{ minWidth: { xs: "100%", sm: 100 } }}
        />

        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder={
              tabValue === 1
                ? t("home.reservationPicker.period")
                : t("home.reservationPicker.carDate")
            }
            minDate={new Date()}
            className="w-full sm:w-auto [&_button]:!text-gray-900 [&_button]:!bg-white [&_button]:border-gray-300 [&_button:hover]:!bg-gray-50"
          />
        </Box>

        {/* Show guest/room fields only for Stay tab */}
        {tabValue === 1 && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "space-between", sm: "flex-start" },
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {t("home.reservationPicker.adults")}
              </Typography>
              <IconButton
                onClick={() => handleDecrement(setAdults)}
                size="small"
              >
                <Remove />
              </IconButton>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {adults}
              </Typography>
              <IconButton
                onClick={() => handleIncrement(setAdults)}
                size="small"
              >
                <Add />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "space-between", sm: "flex-start" },
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {t("home.reservationPicker.children")}
              </Typography>
              <IconButton
                onClick={() => handleDecrement(setChildren)}
                size="small"
              >
                <Remove />
              </IconButton>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {children}
              </Typography>
              <IconButton
                onClick={() => handleIncrement(setChildren)}
                size="small"
              >
                <Add />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "space-between", sm: "flex-start" },
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {t("home.reservationPicker.rooms")}
              </Typography>
              <IconButton
                onClick={() => handleDecrement(setRooms)}
                size="small"
              >
                <Remove />
              </IconButton>
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {rooms}
              </Typography>
              <IconButton
                onClick={() => handleIncrement(setRooms)}
                size="small"
              >
                <Add />
              </IconButton>
            </Box>
          </>
        )}

        <Button
          variant="contained"
          color="primary"
          disabled={!dateRange?.from || !dateRange?.to || loading}
          onClick={handleSearch}
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: "bold",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {loading ? t("common.loading") : t("home.reservationPicker.search")}
        </Button>
      </Box>
    </Box>
  );
}
