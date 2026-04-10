import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = () => i18n.changeLanguage(isAr ? 'en' : 'ar');

  return (
    <span
      onClick={toggle}
      className="text-[11px] font-bold tracking-wide text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}
      aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
    >
      {isAr ? 'EN' : 'AR'}
    </span>
  );
};
