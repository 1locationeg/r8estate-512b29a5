import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const toggle = () => i18n.changeLanguage(isAr ? 'en' : 'ar');

  return (
    <span
      onClick={toggle}
      className={cn(
        "text-[11px] font-bold tracking-wide text-muted-foreground cursor-pointer hover:text-foreground transition-all duration-500 select-none",
        show ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}
      aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
    >
      {isAr ? 'EN' : 'AR'}
    </span>
  );
};
