/**
 * "Send as a paper plane" animation for the booking request ticket.
 *
 * 1. foldTicket: the ticket tilts, shows its blank paper side and folds into a dart
 * 2. flyPlane:   a paper plane takes the dart's place, loops and flies off the
 *                top-right corner, drawing a dashed trail behind it
 * 3. landTicket: the ticket comes back (now "sent") and gets a rubber stamp
 *
 * Plain Web Animations API: no library, and nothing runs for users who ask the
 * system to reduce motion (see prefersReducedMotion).
 */

// Clip shapes with the same number of points so the browser can morph them
const RECT = "polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)";
const DART_HALF = "polygon(22% 0%, 78% 0%, 100% 100%, 50% 90%, 0% 100%)";
const DART = "polygon(50% 0%, 50% 0%, 100% 100%, 50% 78%, 0% 100%)";

const FOLD_MS = 1100;
const FLIGHT_MS = 1900;
const FLIGHT_EASING = "cubic-bezier(.45,.05,.4,1)";

export const prefersReducedMotion = (): boolean =>
  typeof window === "undefined" ||
  typeof Element.prototype.animate !== "function" ||
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/**
 * Folds the ticket into a small dart, centred on the part of the ticket that is
 * visible on screen. Returns the dart centre in viewport coordinates.
 */
export async function foldTicket(
  ticket: HTMLElement,
  paperCover: HTMLElement,
  dart = { width: 120, height: 140 },
): Promise<{ x: number; y: number }> {
  const rect = ticket.getBoundingClientRect();
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, window.innerHeight);
  const originX = rect.width / 2;
  const originY = (visibleTop + visibleBottom) / 2 - rect.top;
  ticket.style.transformOrigin = `${originX}px ${originY}px`;

  const sx = dart.width / rect.width;
  const sy = dart.height / rect.height;

  // The blank back of the paper (with fold creases) covers the text while folding
  paperCover.animate(
    [{ opacity: 0 }, { opacity: 0, offset: 0.18 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }],
    { duration: FOLD_MS, fill: "forwards" },
  );

  await ticket.animate(
    [
      { transform: "perspective(1400px) rotateX(0deg) scale(1, 1)", clipPath: RECT },
      { transform: "perspective(1400px) rotateX(24deg) scale(0.92, 0.92)", clipPath: RECT, offset: 0.25 },
      {
        transform: `perspective(1400px) rotateX(0deg) scale(${Math.min(1, sx * 2.4)}, ${Math.min(1, sy * 1.8)})`,
        clipPath: DART_HALF,
        offset: 0.62,
      },
      { transform: `perspective(1400px) rotateX(0deg) scale(${sx}, ${sy})`, clipPath: DART },
    ],
    { duration: FOLD_MS, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
  ).finished;

  // The dart hands over to the paper plane
  await ticket.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 140,
    fill: "forwards",
  }).finished;

  return { x: rect.left + originX, y: rect.top + originY };
}

/**
 * Flight path in viewport coordinates: starts upwards (like the dart), makes a
 * loop, then leaves through the top-right corner. Smaller loop on phones.
 */
export function buildFlightPath(x: number, y: number): string {
  const vw = window.innerWidth;
  const k = Math.min(1, vw / 900);
  const p = (dx: number, dy: number) => `${(x + dx * k).toFixed(1)} ${(y + dy * k).toFixed(1)}`;
  return [
    `M ${x.toFixed(1)} ${y.toFixed(1)}`,
    `C ${p(0, -150)} ${p(190, -200)} ${p(230, -85)}`,
    `C ${p(265, 25)} ${p(115, 95)} ${p(55, 15)}`,
    `C ${p(-10, -75)} ${p(160, -240)} ${vw + 180} -180`,
  ].join(" ");
}

/**
 * Moves the plane along the path, nose following the direction of flight, and
 * draws the trail (a mask path revealing a dashed line) at the same pace.
 */
export async function flyPlane(
  plane: HTMLElement,
  path: SVGPathElement,
  trailReveal: SVGPathElement,
): Promise<void> {
  const length = path.getTotalLength();
  const steps = 90;
  const frames: Keyframe[] = [];

  for (let i = 0; i <= steps; i++) {
    const at = (length * i) / steps;
    const point = path.getPointAtLength(at);
    const before = path.getPointAtLength(Math.max(0, at - 1));
    const after = path.getPointAtLength(Math.min(length, at + 1));
    const angle = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
    const scale = 1 - 0.5 * (i / steps); // flies away from the viewer
    frames.push({
      transform: `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`,
      opacity: i === 0 ? 0 : 1,
      offset: i / steps,
    });
  }

  trailReveal.style.strokeDasharray = `${length}`;
  trailReveal.animate(
    [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    { duration: FLIGHT_MS, easing: FLIGHT_EASING, fill: "forwards" },
  );

  await plane.animate(frames, {
    duration: FLIGHT_MS,
    easing: FLIGHT_EASING,
    fill: "forwards",
  }).finished;
}

/** Brings the (now "sent") ticket back and slams the rubber stamp on it. */
export async function landTicket(
  ticket: HTMLElement,
  paperCover: HTMLElement,
  stamp: HTMLElement | null,
): Promise<void> {
  ticket.style.opacity = "0";
  ticket.getAnimations().forEach((animation) => animation.cancel());
  paperCover.getAnimations().forEach((animation) => animation.cancel());
  ticket.style.transformOrigin = "";

  stamp?.animate(
    [
      { opacity: 0, transform: "rotate(-14deg) scale(2.6)" },
      { opacity: 1, transform: "rotate(-14deg) scale(0.9)", offset: 0.7 },
      { opacity: 1, transform: "rotate(-14deg) scale(1)" },
    ],
    { duration: 460, delay: 420, easing: "cubic-bezier(.3,1.4,.6,1)", fill: "backwards" },
  );

  const landing = ticket.animate(
    [
      { opacity: 0, transform: "translateY(48px) scale(0.96)" },
      { opacity: 1, transform: "none" },
    ],
    { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" },
  );
  ticket.style.opacity = "";
  await landing.finished;
}
