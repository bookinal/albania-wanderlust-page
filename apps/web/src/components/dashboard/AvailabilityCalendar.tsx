import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar";
import { getCarUnavailabilityDates } from "@/services/api/carService";
import { getApartmentUnavailabilityDates } from "@/services/api/apartmentService";
import { Loader2, CalendarDays } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type PropertyType = "car" | "apartment";

interface AvailabilityCalendarProps {
  propertyId: number;
  propertyType: PropertyType;
  className?: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  propertyId,
  propertyType,
  className,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tk = {
    headingText: isDark ? "#ffffff" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    legendText: isDark ? "rgba(255,255,255,0.60)" : "#44403c",
    availDot: isDark ? "rgba(255,255,255,0.15)" : "#ffffff",
    availDotBorder: isDark ? "rgba(255,255,255,0.20)" : "#d1cdc9",
    allAvailText: "#10b981",
    infoText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    errorText: "#ef4444",
    // Calendar wrapper — give shadcn Calendar a fixed light skin so its
    // internal CSS vars always resolve correctly regardless of custom theme state.
    calWrapperBg: isDark ? "#1e1e22" : "#ffffff",
    calWrapperText: isDark ? "#f0ece8" : "#111115",
    calBorder: isDark ? "rgba(255,255,255,0.10)" : "#e5e2de",
  };

  useEffect(() => {
    const fetchUnavailabilityDates = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateStrings =
          propertyType === "car"
            ? await getCarUnavailabilityDates(propertyId)
            : await getApartmentUnavailabilityDates(propertyId);
        const dates = dateStrings.map((dateStr) => {
          const [year, month, day] = dateStr.split("-").map(Number);
          return new Date(year, month - 1, day);
        });
        setUnavailableDates(dates);
      } catch (err) {
        console.error("Error fetching unavailability dates:", err);
        setError(t("availabilityCalendar.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailabilityDates();
  }, [propertyId, propertyType]);

  if (loading) {
    return (
      <div className={className}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
          <Loader2 style={{ width: "24px", height: "24px", color: "#E8192C", animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div style={{ textAlign: "center", padding: "32px 0", color: tk.errorText }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: tk.headingText, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <CalendarDays size={20} style={{ color: "#E8192C" }} />
        {t("availabilityCalendar.title")}
      </h2>

      {isDark && (
        <style>{`
          .alb-cal-wrapper .rdp,
          .alb-cal-wrapper [class*="rdp"] {
            --rdp-background-color: transparent;
          }
          .alb-cal-wrapper button,
          .alb-cal-wrapper [role="gridcell"] {
            color: #f0ece8 !important;
          }
          .alb-cal-wrapper [class*="day_outside"],
          .alb-cal-wrapper .rdp-day_outside {
            color: rgba(240,236,232,0.30) !important;
          }
          .alb-cal-wrapper [class*="nav_button"],
          .alb-cal-wrapper .rdp-nav_button {
            color: #f0ece8 !important;
            border-color: rgba(255,255,255,0.15) !important;
          }
          .alb-cal-wrapper [class*="caption"],
          .alb-cal-wrapper .rdp-caption {
            color: #ffffff !important;
          }
          .alb-cal-wrapper [class*="head_cell"],
          .alb-cal-wrapper .rdp-head_cell {
            color: rgba(240,236,232,0.50) !important;
          }
          .alb-cal-wrapper [class*="day_selected"],
          .alb-cal-wrapper .rdp-day_selected {
            background-color: #E8192C !important;
            color: #ffffff !important;
          }
          .alb-cal-wrapper [class*="day_today"],
          .alb-cal-wrapper .rdp-day_today {
            color: #E8192C !important;
            font-weight: 700 !important;
          }
          .alb-cal-wrapper button:hover:not([disabled]) {
            background: rgba(255,255,255,0.08) !important;
          }
        `}</style>
      )}
      <div
        className="alb-cal-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          background: tk.calWrapperBg,
          color: tk.calWrapperText,
          borderRadius: "12px",
          padding: "8px",
          border: `1px solid ${tk.calBorder}`,
        }}
      >
        <Calendar
          mode={undefined}
          modifiers={{ booked: unavailableDates }}
          modifiersClassNames={{ booked: "bg-red-400 text-white hover:bg-red-400 hover:text-white rounded-md" }}
          disabled={unavailableDates}
          className="rounded-md border"
          showOutsideDays={false}
        />
      </div>

      {/* Legend */}
      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", fontSize: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
          <span style={{ color: tk.legendText }}>{t("availabilityCalendar.legend.booked")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: tk.availDot, border: `1px solid ${tk.availDotBorder}`, display: "inline-block" }} />
          <span style={{ color: tk.legendText }}>{t("availabilityCalendar.legend.available")}</span>
        </div>
      </div>

      {/* Booking count info */}
      {unavailableDates.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "13px", color: tk.allAvailText, marginTop: "12px", fontWeight: 600 }}>
          {t("availabilityCalendar.info.allAvailable")}
        </p>
      ) : (
        <p style={{ textAlign: "center", fontSize: "13px", color: tk.infoText, marginTop: "12px" }}>
          {unavailableDates.length}{" "}
          {unavailableDates.length === 1
            ? t("availabilityCalendar.info.daysBooked")
            : t("availabilityCalendar.info.daysBookedPlural")}
        </p>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
