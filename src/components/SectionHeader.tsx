import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional small ALL-CAPS eyebrow rendered above the title. */
  eyebrow?: ReactNode;
  /** Optional "View all" link rendered on the trailing edge (RTL-safe). */
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Center-align the title + subtitle (defaults to start-aligned). */
  centered?: boolean;
  className?: string;
}

/**
 * Standard section header used across the homepage.
 *
 * Title + subtitle on the leading edge, optional "View all →" on the trailing
 * edge — same pattern the reference design uses for every list-style section.
 * Uses logical properties (`text-start`, `ms-/me-`) so it flips cleanly in RTL.
 */
export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  viewAllHref,
  viewAllLabel = "View all",
  centered = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 md:mb-8 flex flex-wrap items-end gap-3",
        centered ? "justify-center text-center" : "justify-between text-start",
        className,
      )}
    >
      <div className={cn(centered && "mx-auto max-w-2xl")}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="heading-section text-foreground">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllHref && !centered && (
        <Link
          to={viewAllHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {viewAllLabel}
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      )}
    </div>
  );
}