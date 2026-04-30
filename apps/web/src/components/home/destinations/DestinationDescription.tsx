import { useMemo, useState } from "react";

interface DestinationDescriptionProps {
  text: string;
  color: string;
  limit?: number;
  readMoreLabel: string;
  showLessLabel: string;
}

export function DestinationDescription({
  text,
  color,
  limit = 180,
  readMoreLabel,
  showLessLabel,
}: DestinationDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = text.length > limit;

  const displayText = useMemo(() => {
    if (!shouldTruncate || expanded) return text;
    return `${text.slice(0, limit).trimEnd()}...`;
  }, [expanded, limit, shouldTruncate, text]);

  return (
    <div>
      <p style={{ color, lineHeight: 1.75 }}>{displayText}</p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded((value) => !value)}
          style={{
            marginTop: "0.45rem",
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            fontWeight: 700,
            color: "inherit",
          }}
        >
          {expanded ? showLessLabel : readMoreLabel}
        </button>
      )}
    </div>
  );
}
