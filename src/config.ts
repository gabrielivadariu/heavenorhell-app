const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const isHttps = apiBaseUrl?.startsWith("https://") ?? false;
const localIpPattern = /^http:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
const isLocalDev =
  __DEV__ &&
  (apiBaseUrl?.startsWith("http://localhost") || (apiBaseUrl ? localIpPattern.test(apiBaseUrl) : false));

if (!apiBaseUrl) {
  throw new Error(
    "[Config] Missing EXPO_PUBLIC_API_BASE_URL. Set it to your HTTPS backend (e.g. https://api.heavenorhell.app)."
  );
}

if (!isHttps && !isLocalDev) {
  throw new Error("[Config] EXPO_PUBLIC_API_BASE_URL must use https in production builds.");
}

export const API_BASE_URL = apiBaseUrl;

export type PersonaRole = "god" | "devil";
