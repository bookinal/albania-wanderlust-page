import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, ClipboardCheck, Clock, Loader2, Mail } from "lucide-react";
import {
  buildFlightPath,
  flyPlane,
  foldTicket,
  landTicket,
  prefersReducedMotion,
} from "./paperPlaneAnimation";

export interface TicketRow {
  label: string;
  value: React.ReactNode;
}

export interface TicketStep {
  title: string;
  description: string;
}

interface BookingRequestTicketProps {
  // "review": the client checks the request and confirms it (nothing sent yet)
  // "sent": the request was created and waits for the provider
  mode: "review" | "sent";
  reference?: string; // only once the request exists
  image?: string;
  propertyName: string;
  propertySubtitle?: string;
  details: TicketRow[]; // trip details (dates, places, extras…)
  priceRows: TicketRow[]; // price breakdown
  total: string;
  totalNote?: string; // e.g. "+ €50 deposit held at pick-up"
  steps: TicketStep[]; // what happens next
  email?: string;
  onPrimary: () => void;
  primaryLabel: string;
  primaryLoading?: boolean;
  error?: string | null;
  onSecondary?: () => void;
  secondaryLabel?: string;
}

// Paper-ticket colours: the ticket stays yellow in every theme
const INK = "#3b2a05";
const INK_MUTED = "#7a5b12";
const PAPER = "#fff6d6";
const PAPER_STRONG = "#ffe9a3";
const EDGE = "#f2c94c";

// Half-circle notches cut into the ticket where the two parts meet
const notchMask = (side: "top" | "bottom") => {
  const y = side === "top" ? "bottom" : "top";
  const mask = `radial-gradient(circle at left ${y}, transparent 14px, #000 14.5px) left ${y} / 51% 100% no-repeat, radial-gradient(circle at right ${y}, transparent 14px, #000 14.5px) right ${y} / 51% 100% no-repeat`;
  return { WebkitMask: mask, mask } as React.CSSProperties;
};

// Fold creases on the blank back of the paper, shown while the ticket folds
const PAPER_BACK = [
  `linear-gradient(to bottom right, transparent 49.6%, rgba(122,91,18,0.28) 50%, transparent 50.4%)`,
  `linear-gradient(to bottom left, transparent 49.6%, rgba(122,91,18,0.28) 50%, transparent 50.4%)`,
  `linear-gradient(to right, transparent 49.7%, rgba(122,91,18,0.35) 50%, transparent 50.3%)`,
  PAPER,
].join(", ");

// Top view of a paper plane, nose pointing right (rotated along the flight path)
function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <polygon points="98,50 4,8 34,50" fill={PAPER} stroke={EDGE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="98,50 4,92 34,50" fill={PAPER_STRONG} stroke={EDGE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="98,50 34,50 44,60" fill={EDGE} />
      <line x1="98" y1="50" x2="34" y2="50" stroke={INK_MUTED} strokeOpacity="0.45" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Booking request summary shown right after the client sends a request.
 * Looks like a yellow paper ticket and explains what happens next.
 */
export default function BookingRequestTicket({
  mode,
  reference,
  image,
  propertyName,
  propertySubtitle,
  details,
  priceRows,
  total,
  totalNote,
  steps,
  email,
  onPrimary,
  primaryLabel,
  primaryLoading = false,
  error,
  onSecondary,
  secondaryLabel,
}: BookingRequestTicketProps) {
  const { t } = useTranslation();
  const isReview = mode === "review";

  const overlayRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const paperCoverRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const flightPathRef = useRef<SVGPathElement>(null);
  const trailRevealRef = useRef<SVGPathElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const previousMode = useRef(mode);
  const [animating, setAnimating] = useState(false);
  const [flightPath, setFlightPath] = useState<string | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // review -> sent: fold the ticket into a dart...
  useEffect(() => {
    const wasReview = previousMode.current === "review";
    previousMode.current = mode;
    if (!wasReview || mode !== "sent" || prefersReducedMotion()) return;
    const ticketEl = ticketRef.current;
    const cover = paperCoverRef.current;
    if (!ticketEl || !cover) return;

    let cancelled = false;
    setAnimating(true);
    foldTicket(ticketEl, cover)
      .then(({ x, y }) => {
        if (!cancelled) setFlightPath(buildFlightPath(x, y));
      })
      .catch(() => setAnimating(false));
    return () => {
      cancelled = true;
    };
  }, [mode]);

  // ...then fly it to the provider as a paper plane and land the "sent" ticket
  useEffect(() => {
    if (!flightPath) return;
    const plane = planeRef.current;
    const path = flightPathRef.current;
    const trail = trailRevealRef.current;
    const ticketEl = ticketRef.current;
    const cover = paperCoverRef.current;
    if (!plane || !path || !trail || !ticketEl || !cover) {
      // cannot fly: show the sent ticket straight away instead of a stuck dart
      setFlightPath(null);
      if (ticketEl && cover) void landTicket(ticketEl, cover, stampRef.current);
      setAnimating(false);
      return;
    }

    captionRef.current?.animate(
      [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
      { duration: 450, fill: "forwards" },
    );
    // No effect-cleanup cancellation here: clearing flightPath below re-runs this
    // effect's cleanup, and the sequence must still finish (unmount is checked instead)
    flyPlane(plane, path, trail)
      .then(() => {
        if (!mountedRef.current) return;
        setFlightPath(null);
        if (overlayRef.current) overlayRef.current.scrollTop = 0;
        return landTicket(ticketEl, cover, stampRef.current);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mountedRef.current) setAnimating(false);
      });
  }, [flightPath]);

  // Keep the page behind from scrolling while the ticket is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const rowList = (rows: TicketRow[]) => (
    <dl className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
          <dt style={{ color: INK_MUTED }}>{row.label}</dt>
          <dd className="text-right font-semibold" style={{ color: INK }}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-busy={animating}
      aria-labelledby="booking-ticket-title"
      // above the site header (z-[9999])
      className="fixed inset-0 z-[10000] flex justify-center overflow-y-auto px-4 py-8"
      style={{ background: "rgba(15, 23, 42, 0.72)" }}
    >
      <div
        // my-auto centres the ticket but never cuts its top when it is taller than the screen
        className="my-auto w-full max-w-lg"
        style={{ filter: "drop-shadow(0 22px 40px rgba(0,0,0,0.35))" }}
      >
      <div
        ref={ticketRef}
        className="relative"
        style={{ pointerEvents: animating ? "none" : undefined }}
      >
        {/* ── Top part: request + trip details ── */}
        <div
          className="relative rounded-t-3xl px-6 pb-6 pt-6 sm:px-7"
          style={{ background: PAPER, ...notchMask("top") }}
        >
          {/* Rubber stamp once the request is sent */}
          {!isReview && (
            <div
              ref={stampRef}
              aria-hidden="true"
              className="pointer-events-none absolute right-6 top-[9.75rem] select-none rounded-lg px-3 py-1 text-xl font-black uppercase tracking-[0.2em]"
              style={{
                color: "#15803d",
                border: "3px solid #15803d",
                transform: "rotate(-14deg)",
                opacity: 0.85,
                mixBlendMode: "multiply",
              }}
            >
              {t("bookingTicket.stamp")} ✓
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{ background: PAPER_STRONG, color: INK, border: `1px solid ${EDGE}` }}
            >
              {isReview ? (
                <ClipboardCheck className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {isReview ? t("bookingTicket.review.status") : t("bookingTicket.status")}
            </span>
            {reference && (
              <span className="font-mono text-sm font-bold" style={{ color: INK_MUTED }}>
                {reference}
              </span>
            )}
          </div>

          <h2
            id="booking-ticket-title"
            className="mt-4 text-2xl font-extrabold leading-tight"
            style={{ color: INK }}
          >
            {isReview ? t("bookingTicket.review.title") : t("bookingTicket.title")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: INK_MUTED }}>
            {isReview ? t("bookingTicket.review.subtitle") : t("bookingTicket.subtitle")}
          </p>

          <div
            className="mt-5 flex items-center gap-3 rounded-2xl p-3"
            style={{ background: PAPER_STRONG }}
          >
            {image && (
              <img
                src={image}
                alt={propertyName}
                className="h-14 w-20 shrink-0 rounded-xl object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-bold" style={{ color: INK }}>
                {propertyName}
              </p>
              {propertySubtitle && (
                <p className="truncate text-xs" style={{ color: INK_MUTED }}>
                  {propertySubtitle}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5">{rowList(details)}</div>
        </div>

        {/* ── Bottom part: price + next steps ── */}
        <div
          className="rounded-b-3xl px-6 pb-6 sm:px-7"
          style={{ background: PAPER, ...notchMask("bottom") }}
        >
          {/* Perforation between the notches */}
          <div className="mb-5" style={{ borderTop: `2px dashed ${EDGE}` }} />
          <p
            className="mb-3 text-xs font-bold uppercase tracking-widest"
            style={{ color: INK_MUTED }}
          >
            {t("bookingTicket.priceTitle")}
          </p>
          {rowList(priceRows)}
          <div
            className="mt-3 flex items-baseline justify-between gap-4 pt-3"
            style={{ borderTop: `1px solid ${EDGE}` }}
          >
            <span className="text-base font-bold" style={{ color: INK }}>
              {t("bookingTicket.total")}
            </span>
            <span className="text-right">
              <span className="text-2xl font-extrabold" style={{ color: INK }}>
                {total}
              </span>
              {totalNote && (
                <span className="block text-xs font-semibold" style={{ color: INK_MUTED }}>
                  {totalNote}
                </span>
              )}
            </span>
          </div>

          {/* What happens next */}
          <div
            className="mt-6 rounded-2xl p-4"
            style={{ background: PAPER_STRONG, border: `1px solid ${EDGE}` }}
          >
            <p className="text-sm font-extrabold" style={{ color: INK }}>
              {t("bookingTicket.nextStepsTitle")}
            </p>
            <ol className="mt-3 space-y-3">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: INK, color: PAPER }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: INK }}>
                      {step.title}
                    </p>
                    <p className="text-sm leading-snug" style={{ color: INK_MUTED }}>
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {email && !isReview && (
            <p className="mt-4 flex items-start gap-2 text-xs" style={{ color: INK_MUTED }}>
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("bookingTicket.emailNotice", { email })}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
              style={{ background: INK, color: PAPER }}
            >
              {primaryLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {primaryLabel}
            </button>
            {onSecondary && secondaryLabel && (
              <button
                type="button"
                onClick={onSecondary}
                disabled={primaryLoading}
                className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition hover:opacity-80 disabled:opacity-50"
                style={{ background: "transparent", color: INK, border: `1.5px solid ${INK}` }}
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>

        {/* Blank back of the paper, faded in while the ticket folds */}
        <div
          ref={paperCoverRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ background: PAPER_BACK, opacity: 0 }}
        />
      </div>
      </div>

      {/* Paper plane flight: dashed trail + plane + caption */}
      {flightPath && (
        <div className="pointer-events-none fixed inset-0 z-[10001]" aria-hidden="true">
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <mask id="booking-plane-trail" maskUnits="userSpaceOnUse">
                <path
                  ref={trailRevealRef}
                  d={flightPath}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </mask>
            </defs>
            <path
              ref={flightPathRef}
              d={flightPath}
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1 12"
              mask="url(#booking-plane-trail)"
            />
          </svg>
          <div
            ref={planeRef}
            className="absolute left-0 top-0 h-[110px] w-[110px]"
            style={{ opacity: 0, filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.35))" }}
          >
            <PaperPlaneIcon />
          </div>
          <p
            ref={captionRef}
            className="absolute inset-x-0 bottom-[12%] px-6 text-center text-lg font-bold text-white"
            style={{ opacity: 0 }}
          >
            {t("bookingTicket.flying")}
          </p>
        </div>
      )}
    </div>
  );
}
