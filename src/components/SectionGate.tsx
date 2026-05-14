import { ReactNode } from "react";
import { useSectionVisible } from "@/hooks/useHomepageSections";

interface SectionGateProps {
  sectionKey: string;
  children: ReactNode;
  /** When true, render even if hidden (used for admin previews). */
  force?: boolean;
}

/**
 * Wraps a homepage section so admins can toggle its visibility from
 * /admin/sections without code changes. Unknown keys default to visible.
 */
export function SectionGate({ sectionKey, children, force }: SectionGateProps) {
  const visible = useSectionVisible(sectionKey);
  if (!force && !visible) return null;
  return <>{children}</>;
}