import type { ReactNode } from "react";

export type BreadcrumbItem = string | { label: string; href: string };

export interface PageHeaderProps {
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  other?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

function PageHeader(props: PageHeaderProps) {
  const { other, subtitle, title, breadcrumbs = [] } = props;

  const allBreadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/" },
    ...breadcrumbs,
  ];

  return (
    <div className="space-y-3 mb-6">
      <nav aria-label="Breadcrumb" className="flex items-center">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm text-text-secondary">
          {allBreadcrumbs.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === allBreadcrumbs.length - 1;

            // Normalisasi data item (apakah string atau objek)
            const label = typeof item === "string" ? item : item.label;
            const href =
              typeof item === "object" && item !== null ? item.href : undefined;

            return (
              <li
                key={`${label}-${index}`}
                className="inline-flex items-center"
              >
                {/* Separator / Pembatas Chevron (hanya muncul setelah item pertama) */}
                {!isFirst && (
                  <svg
                    className="w-4 h-4 mx-1 text-text-secondary/60 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}

                {/* Konten Item Breadcrumb */}
                <div className="inline-flex items-center gap-1.5">
                  {/* Icon Home khusus untuk item pertama (Dashboard) */}
                  {isFirst && (
                    <svg
                      className="w-4 h-4 text-text-secondary shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  )}

                  {/* Render sebagai Link (jika ada href dan bukan item terakhir) atau Text biasa */}
                  {href && !isLast ? (
                    <a
                      href={href}
                      className="font-medium text-text-secondary hover:text-primary-main transition-colors cursor-pointer"
                    >
                      {label}
                    </a>
                  ) : (
                    <span
                      className={
                        isLast
                          ? "font-semibold text-text-primary"
                          : "font-medium text-text-secondary"
                      }
                    >
                      {label}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {(title || subtitle || other) && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
          {other && <div className="shrink-0">{other}</div>}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
