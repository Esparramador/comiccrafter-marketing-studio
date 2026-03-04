import React, { createContext, useContext, useState, useEffect } from "react";
import { LANGUAGES, translations } from "./i18n";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("cc_lang") || "es";
    return "es";
  });

  useEffect(() => {
    localStorage.setItem("cc_lang", lang);
    const langObj = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.dir = langObj?.dir || "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations["es"]?.[key] ?? key;
  const currentLang = LANGUAGES.find((l) => l.code === lang);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, currentLang, LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}