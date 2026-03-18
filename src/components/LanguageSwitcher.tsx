import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = () => i18n.changeLanguage(isAr ? 'en' : 'ar');

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-full bg-[#1B3A5C] text-white px-3 py-1.5 text-xs font-bold transition-colors hover:opacity-90"
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  );
};
