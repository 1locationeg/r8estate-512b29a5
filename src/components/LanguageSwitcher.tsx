import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = () => i18n.changeLanguage(isAr ? 'en' : 'ar');

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary/60 text-foreground px-2.5 py-1.5 text-[11px] font-bold tracking-wide transition-all hover:bg-secondary hover:border-primary/30 active:scale-95"
      aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  );
};
