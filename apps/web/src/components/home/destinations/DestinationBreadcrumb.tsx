import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface DestinationBreadcrumbItem {
  label: string;
  to?: string;
}

interface DestinationBreadcrumbProps {
  items: DestinationBreadcrumbItem[];
  variant?: "translucent" | "page";
}

/**
 * Breadcrumb trail styled for the translucent hero banners used across the
 * destinations flow (/destinations -> category -> subcategory -> details).
 * Always prepends a "Home" crumb.
 */
export function DestinationBreadcrumb({
  items,
  variant = "translucent",
}: DestinationBreadcrumbProps) {
  const { t } = useTranslation();
  const allItems: DestinationBreadcrumbItem[] = [
    { label: t("home.appBar.Home"), to: "/" },
    ...items,
  ];

  const isPage = variant === "page";
  const linkColor = isPage ? "rgba(100, 116, 139, 0.85)" : "rgba(255,255,255,0.72)";
  const linkHoverColor = isPage ? "rgba(15, 23, 42, 1)" : "rgba(255,255,255,0.98)";
  const pageColor = isPage ? "rgba(15, 23, 42, 0.9)" : "rgba(255,255,255,0.95)";
  const separatorColor = isPage ? "rgba(148, 163, 184, 0.6)" : "rgba(255,255,255,0.4)";

  return (
    <Breadcrumb>
      <BreadcrumbList
        style={{
          flexWrap: "wrap",
          rowGap: "0.35rem",
          marginBottom: isPage ? "0" : "1.25rem",
        }}
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {!isLast && item.to ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.to}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        color: linkColor,
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = linkHoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = linkColor;
                      }}
                    >
                      {isHome && <Home className="w-3.5 h-3.5" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      color: pageColor,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {isHome && <Home className="w-3.5 h-3.5" />}
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator style={{ color: separatorColor }}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
