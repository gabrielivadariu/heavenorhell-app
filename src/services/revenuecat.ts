import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, { CustomerInfo, LOG_LEVEL, Offerings, PurchasesPackage } from "react-native-purchases";

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const PREMIUM_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "premium";
const OFFERING_ID = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID || "current";
const PACKAGE_ID = process.env.EXPO_PUBLIC_REVENUECAT_PACKAGE_ID || "monthly";
const STORE_PRODUCT_ID = "com.gabriellivadariu.goddevilchat.premium.monthly";
const APP_USER_ID_KEY = "revenuecat_app_user_id";

let configured = false;

function generateLocalUserId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `user_${Date.now()}_${rand}`;
}

async function getOrCreateAppUserId(): Promise<string | undefined> {
  try {
    const cached = await AsyncStorage.getItem(APP_USER_ID_KEY);
    if (cached) return cached;
    const nextId = generateLocalUserId();
    await AsyncStorage.setItem(APP_USER_ID_KEY, nextId);
    return nextId;
  } catch (err) {
    console.warn("RevenueCat: failed to persist app user id", err);
    return undefined;
  }
}

export async function initRevenueCat(userId?: string) {
  if (configured) return;

  const apiKey = REVENUECAT_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RevenueCat init skipped: EXPO_PUBLIC_REVENUECAT_API_KEY missing");
    return;
  }

  const appUserID = userId || (await getOrCreateAppUserId());

  try {
    Purchases.setLogLevel(LOG_LEVEL.INFO);
    Purchases.configure({ apiKey, appUserID });
    configured = true;
  } catch (err) {
    console.warn("RevenueCat init error", err);
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (!configured) {
    await initRevenueCat();
    if (!configured) return false;
  }

  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
  } catch (err) {
    console.warn("RevenueCat checkPremiumStatus error", err);
    return false;
  }
}

async function getPrimaryPackage(): Promise<PurchasesPackage | null> {
  const offerings: Offerings = await Purchases.getOfferings();
  const current = offerings.current ?? offerings.all?.[OFFERING_ID];
  if (!current) {
    console.warn("RevenueCat: no current offering returned");
    return null;
  }

  const packageMatch =
    current.availablePackages?.find(
      (p) => p.identifier === PACKAGE_ID || p.identifier === `$rc_${PACKAGE_ID}`
    ) ?? current.monthly;

  if (!packageMatch) {
    console.warn(`RevenueCat: package ${PACKAGE_ID} / $rc_${PACKAGE_ID} not found in offering`);
    return null;
  }

  return packageMatch;
}

export async function purchasePremium(): Promise<boolean> {
  if (!configured) {
    await initRevenueCat();
    if (!configured) return false;
  }

  try {
    const pkg = await getPrimaryPackage();
    if (!pkg) {
      console.warn("RevenueCat: no available package to purchase");
      return false;
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
  } catch (err: any) {
    if (err?.userCancelled) {
      return false;
    }
    console.warn("RevenueCat purchase error", err);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!configured) {
    await initRevenueCat();
    if (!configured) return false;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
  } catch (err) {
    console.warn("RevenueCat restore error", err);
    return false;
  }
}
