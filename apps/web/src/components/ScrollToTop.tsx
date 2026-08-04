import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "scroll-positions";

function readPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writePosition(key: string, y: number) {
  const positions = readPositions();
  positions[key] = y;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

export default function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const saved = readPositions()[key];
    if (navigationType === "POP" && typeof saved === "number") {
      window.scrollTo({ top: saved, behavior: "instant" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        writePosition(key, window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, key, navigationType]);

  return null;
}
