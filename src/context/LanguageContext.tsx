import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "ro" | "en" | "de" | "no";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => any;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const translations: Record<Language, any> = {
  en: require("../i18n/en.json"),
  ro: require("../i18n/ro.json"),
  de: require("../i18n/de.json"),
  no: require("../i18n/no.json")
};

function detectDefaultLanguage(): Language {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
  const lower = locale.toLowerCase();
  if (lower.startsWith("ro")) return "ro";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("no") || lower.startsWith("nb")) return "no";
  return "en";
}

function translate(locale: Language, key: string, vars?: Record<string, string | number>): any {
  const segments = key.split(".");
  let current: any = translations[locale];
  let fallback: any = translations.en;
  for (const segment of segments) {
    current = current && typeof current === "object" ? current[segment] : undefined;
    fallback = fallback && typeof fallback === "object" ? fallback[segment] : undefined;
  }
  current = current ?? fallback ?? key;

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
  const [language, updateLanguage] = useState<Language>(detectDefaultLanguage());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("hh_language").then(value => {
      if (active && ["en", "ro", "de", "no"].includes(value || "")) updateLanguage(value as Language);
    }).catch(() => {}).finally(() => { if (active) setHydrated(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem("hh_language", language).catch(() => {});
  }, [language, hydrated]);
  const setLanguage = updateLanguage;

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
