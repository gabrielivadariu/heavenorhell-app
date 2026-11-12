import { getInstallation } from "./installation";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesPackage
} from "react-native-purchases";

export const PREMIUM_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || "premium";
const OFFERING_ID = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID?.trim() || "current";
const PACKAGE_ID = process.env.EXPO_PUBLIC_REVENUECAT_PACKAGE_ID?.trim() || "monthly";
// Optional: pin a specific store product. Otherwise use the configured package.
const STORE_PRODUCT_ID = process.env.EXPO_PUBLIC_REVENUECAT_PRODUCT_ID?.trim();
let configured = false;
let initialization: Promise<void> | undefined;
let selectedPackage: PurchasesPackage | null = null;

export type PackageDetails = {
  price: string;
  period?: "day" | "week" | "month" | "year";
  periodCount?: number;
};

export type PurchaseResult = {
  success: boolean;
  reason?: string;
};

export async function initRevenueCat(userId?: string): Promise<void> {
  if (configured) {
    const { id } = await getInstallation();
    if (await Purchases.getAppUserID() !== id) await Purchases.logIn(id);
    return;
  }
  if (initialization) return initialization;
  initialization = (async () => {
    const apiKey = Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim()
      : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim();
    if (!apiKey || (Platform.OS !== "ios" && Platform.OS !== "android")) {
      throw new Error("RevenueCat: missing public SDK key for this platform");
    }
    const appUserID = (await getInstallation()).id;
    if (userId && userId !== appUserID) throw new Error("Unexpected installation identity");
    await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey, appUserID });
    configured = await Purchases.isConfigured();
    if (!configured) throw new Error("RevenueCat initialization failed");
  })();
  try {
    await initialization;
  } finally {
    initialization = undefined;
  }
}

export async function checkPremiumStatus({
  forceRefresh,
  userId
}: { forceRefresh?: boolean; userId?: string } = {}): Promise<boolean> {
  await initRevenueCat(userId);
  if (forceRefresh) await Purchases.invalidateCustomerInfoCache();
  const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

async function getPrimaryPackage(): Promise<PurchasesPackage> {
  const offerings = await Purchases.getOfferings();
  // "current" means the offering marked current in the dashboard, not an ID.
  const offering = OFFERING_ID === "current" ? offerings.current : offerings.all[OFFERING_ID];
  const packages = offering?.availablePackages ?? [];
  const packageMatch = packages.find((pkg) =>
    STORE_PRODUCT_ID
      ? pkg.product.identifier === STORE_PRODUCT_ID
      : pkg.identifier === PACKAGE_ID || pkg.identifier === `$rc_${PACKAGE_ID}`
  );
  if (!packageMatch) {
    console.warn("RevenueCat: configured subscription missing", {
      offering: offering?.identifier ?? OFFERING_ID,
      package: PACKAGE_ID,
      product: STORE_PRODUCT_ID,
      available: packages.map((pkg) => ({ package: pkg.identifier, product: pkg.product.identifier }))
    });
    throw new Error("Configured subscription unavailable");
  }
  return packageMatch;
}

function mapPeriod(period: string | null): Pick<PackageDetails, "period" | "periodCount"> {
  // RevenueCat returns an ISO 8601 duration, e.g. P1M or P1Y.
  const match = /^P(\d+)(D|W|M|Y)$/.exec(period || "");
  if (!match) return {};
  const units = { D: "day", W: "week", M: "month", Y: "year" } as const;
  return { period: units[match[2] as keyof typeof units], periodCount: Number(match[1]) };
}

function errorReason(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === PURCHASES_ERROR_CODE.NETWORK_ERROR || code === PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR) {
    return "network";
  }
  if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return "pending";
  if (code === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) return "notAllowed";
  if (code === PURCHASES_ERROR_CODE.CONFIGURATION_ERROR || code === PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR) {
    return "unavailable";
  }
  return "failed";
}

export async function fetchPackageDetails(): Promise<{ details?: PackageDetails; reason?: string }> {
  // Do not allow purchasing a previously displayed package after a failed reload.
  selectedPackage = null;
  try {
    await initRevenueCat();
    const pkg = await getPrimaryPackage();
    if (!pkg.product.priceString) throw new Error("Store price unavailable");
    selectedPackage = pkg;
    return { details: { price: pkg.product.priceString, ...mapPeriod(pkg.product.subscriptionPeriod) } };
  } catch (error) {
    console.warn("RevenueCat price loading failed", error);
    return { reason: errorReason(error) === "network" ? "network" : "unavailable" };
  }
}

export async function purchasePremium(): Promise<PurchaseResult> {
  try {
    await initRevenueCat();
    // Purchase the exact package whose price the user saw.
    if (!selectedPackage) return { success: false, reason: "unavailable" };
    const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
    const active = Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
    return { success: active, reason: active ? undefined : "notActivated" };
  } catch (error) {
    if ((error as { userCancelled?: boolean })?.userCancelled) return { success: false };
    console.warn("RevenueCat purchase failed", error);
    return { success: false, reason: errorReason(error) };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    await initRevenueCat();
    const customerInfo = await Purchases.restorePurchases();
    const active = Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
    return { success: active, reason: active ? undefined : "nothingToRestore" };
  } catch (error) {
    console.warn("RevenueCat restore failed", error);
    return { success: false, reason: errorReason(error) };
  }
}

export async function getAppIdentity(): Promise<string> {
  return (await getInstallation()).id;
}
