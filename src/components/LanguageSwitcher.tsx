import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const switchTo = (lng: string) => {
    if (i18n.language === lng) return;
    i18n.changeLanguage(lng);
  };

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/50 overflow-hidden text-xs font-bold">
      <button
        onClick={() => switchTo('ar')}
        className={`px-2.5 py-1.5 transition-colors ${
          isAr
            ? 'bg-[#1B3A5C] text-white'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        AR
      </button>
      <button
        onClick={() => switchTo('en')}
        className={`px-2.5 py-1.5 transition-colors ${
          !isAr
            ? 'bg-[#1B3A5C] text-white'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
    </div>
  );
};
