import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LogoEntry {
  company_name: string | null;
  logo_url: string | null;
}

interface BusinessLogoContextType {
  getLogoOverride: (entityId: string, entityName?: string) => string | null;
}

const BusinessLogoContext = createContext<BusinessLogoContextType>({
  getLogoOverride: () => null,
});

export function BusinessLogoProvider({ children }: { children: ReactNode }) {
  const [logos, setLogos] = useState<LogoEntry[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("business_profiles")
        .select("logo_url, company_name")
        .not("logo_url", "is", null);
      if (data) setLogos(data);
    };
    fetch();
  }, []);

  const getLogoOverride = useCallback(
    (entityId: string, entityName?: string): string | null => {
      if (logos.length === 0) return null;
      const match = logos.find(
        (bp) =>
          bp.company_name?.toLowerCase().replace(/\s+/g, "-") === entityId ||
          bp.company_name?.toLowerCase() === entityId ||
          (entityName &&
            bp.company_name?.toLowerCase() === entityName.toLowerCase())
      );
      return match?.logo_url ?? null;
    },
    [logos]
  );

  return (
    <BusinessLogoContext.Provider value={{ getLogoOverride }}>
      {children}
    </BusinessLogoContext.Provider>
  );
}

export const useBusinessLogo = () => useContext(BusinessLogoContext);
