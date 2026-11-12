import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { AppState, Platform } from "react-native";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { checkPremiumStatus, PREMIUM_ENTITLEMENT_ID } from "../services/revenuecat";

type PremiumContextValue = {
  isPremium: boolean;
  isChecking: boolean;
  setPremium: (value: boolean) => void;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setPremium] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") { setIsChecking(false); return; }
    let mounted = true;
    const update = (info: CustomerInfo) => {
      if (mounted) setPremium(Boolean(info.entitlements.active[PREMIUM_ENTITLEMENT_ID]));
    };
    const refresh = async () => {
      try {
        const active = await checkPremiumStatus({ forceRefresh: true });
        if (mounted) setPremium(active);
      } catch (error) {
        // A network failure is not evidence that a subscription has expired.
        console.warn("Premium status refresh unavailable", error);
      } finally {
        if (mounted) setIsChecking(false);
      }
    };
    Purchases.addCustomerInfoUpdateListener(update);
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(update);
      subscription.remove();
    };
  }, []);

  const value = useMemo(() => ({ isPremium, setPremium, isChecking }), [isPremium, isChecking]);
  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
