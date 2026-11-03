import * as React from "react";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  /** Smallest distance kept between the two thumbs (defaults to one step). */
  minGap?: number;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
}

/**
 * Two-thumb range slider built on native range inputs. Unlike the Radix slider,
 * a thumb can never cross the other one: the min thumb stops `minGap` below the
 * max thumb and the max thumb stops `minGap` above the min thumb.
 */
export const PriceRangeSlider = ({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  minGap = step,
  minLabel,
  maxLabel,
  className,
}: PriceRangeSliderProps) => {
  const [low, high] = value;
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className={cn("price-range-slider relative h-5 w-full", className)}>
      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute h-full bg-primary"
          style={{ left: `${toPercent(low)}%`, right: `${100 - toPercent(high)}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={low}
        aria-label={minLabel}
        onChange={(e) => onValueChange([Math.min(Number(e.target.value), high - minGap), high])}
        // When both thumbs sit at the right end, keep the min thumb on top so it can be dragged back
        style={{ zIndex: low > max - (max - min) / 4 ? 4 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={high}
        aria-label={maxLabel}
        onChange={(e) => onValueChange([low, Math.max(Number(e.target.value), low + minGap)])}
      />
    </div>
  );
};
