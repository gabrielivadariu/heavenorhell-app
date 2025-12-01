import React, { createContext, useContext, useState, useMemo } from "react";

type PremiumContextValue = {
  isPremium: boolean;
  setPremium: (value: boolean) => void;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setPremium] = useState<boolean>(false);

  const value = useMemo(() => ({ isPremium, setPremium }), [isPremium]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error("usePremium must be used within PremiumProvider");
  }
  return ctx;
}
