import React, { createContext, useContext, useMemo, useState } from "react";

type Language = "ro" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => any;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const translations: Record<Language, any> = {
  en: require("../i18n/en.json"),
  ro: require("../i18n/ro.json")
};

function detectDefaultLanguage(): Language {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
  return locale.toLowerCase().startsWith("ro") ? "ro" : "en";
}

function translate(locale: Language, key: string, vars?: Record<string, string | number>): any {
  const segments = key.split(".");
  let current: any = translations[locale];
  for (const segment of segments) {
    if (current && segment in current) {
      current = current[segment];
    } else {
      return key;
    }
  }

  if (typeof current === "string") {
    if (!vars) return current;

    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, "g"), String(v)),
      current
    );
  }

  return current;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectDefaultLanguage());

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, vars?: Record<string, string | number>) => translate(language, key, vars)
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return ctx;
}

export type { Language };
