import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HomeSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional id for in-page anchors (e.g. journey corridor). */
  id?: string;
  /** When true, removes the default container so the child can go edge-to-edge. */
  bleed?: boolean;
  /** Tighten vertical rhythm for compact strips (e.g. trust strips). */
  compact?: boolean;
}

/**
 * Shared homepage section shell.
 *
 * Enforces the same vertical rhythm, container width, and horizontal padding
 * for every block on the homepage so the page reads as one coherent narrative
 * (mirrors the reference project's `py-14` / `max-w-6xl` discipline).
 */
export function HomeSection({
  children,
  className,
  id,
  bleed = false,
  compact = false,
}: HomeSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        compact ? "py-6 md:py-8" : "py-10 md:py-14",
        className,
      )}
    >
      {bleed ? (
        children
      ) : (
        <div className="container mx-auto max-w-6xl px-4">{children}</div>
      )}
    </section>
  );
}