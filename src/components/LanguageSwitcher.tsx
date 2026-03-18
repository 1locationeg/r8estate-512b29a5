import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = () => i18n.changeLanguage(isAr ? 'en' : 'ar');

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-lg border-2 border-primary/40 bg-primary/10 text-primary px-3.5 py-2 text-sm font-extrabold tracking-wider transition-all hover:bg-primary/20 hover:border-primary/60 active:scale-95 shadow-sm"
      aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  );
};
