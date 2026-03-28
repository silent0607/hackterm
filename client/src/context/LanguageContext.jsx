import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Detect from localStorage or browser settings
    const saved = localStorage.getItem('hackterm_lang');
    if (saved) return saved;
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'tr';
  });

  const toggleLanguage = () => {
    const next = language === 'tr' ? 'en' : 'tr';
    setLanguage(next);
    localStorage.setItem('hackterm_lang', next);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
