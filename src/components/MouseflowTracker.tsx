import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Loads Mouseflow tracking script when enabled in platform_settings.
 * Controlled via key: "mouseflow_enabled" (value "true" / "false").
 */
export const MouseflowTracker = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "mouseflow_enabled")
        .maybeSingle();
      setEnabled(data?.value === "true");
    };
    check();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Avoid double-injection
    if (document.getElementById("mouseflow-script")) return;

    (window as any)._mfq = (window as any)._mfq || [];
    const mf = document.createElement("script");
    mf.id = "mouseflow-script";
    mf.type = "text/javascript";
    mf.defer = true;
    mf.src = "//cdn.mouseflow.com/projects/d6662369-8cb2-4b3a-89c0-c6cc59cc07f3.js";
    document.head.appendChild(mf);

    return () => {
      const el = document.getElementById("mouseflow-script");
      if (el) el.remove();
    };
  }, [enabled]);

  return null;
};
