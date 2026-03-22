import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type ConsentStatus = "pending" | "accepted" | "rejected";

interface CookieConsentContextType {
  consent: ConsentStatus;
  accept: () => void;
  reject: () => void;
  reset: () => void;
}

const STORAGE_KEY = "r8estate_cookie_consent";

const CookieConsentContext = createContext<CookieConsentContextType>({
  consent: "pending",
  accept: () => {},
  reject: () => {},
  reset: () => {},
});

export const useCookieConsent = () => useContext(CookieConsentContext);

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<ConsentStatus>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "accepted" || stored === "rejected") return stored;
    } catch {}
    return "pending";
  });

  const persist = useCallback((status: ConsentStatus) => {
    setConsent(status);
    try {
      localStorage.setItem(STORAGE_KEY, status);
    } catch {}
  }, []);

  const accept = useCallback(() => persist("accepted"), [persist]);
  const reject = useCallback(() => persist("rejected"), [persist]);
  const reset = useCallback(() => {
    setConsent("pending");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <CookieConsentContext.Provider value={{ consent, accept, reject, reset }}>
      {children}
    </CookieConsentContext.Provider>
  );
};
