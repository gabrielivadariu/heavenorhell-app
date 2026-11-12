// Default API points to the currently live backend on Render.
const DEFAULT_API_BASE_URL = "https://god-devil-api.onrender.com";

const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const apiBaseUrl = envApiBaseUrl || DEFAULT_API_BASE_URL;
const isHttps = apiBaseUrl?.startsWith("https://") ?? false;
const localIpPattern = /^http:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
const isLocalDev =
  __DEV__ &&
  (apiBaseUrl?.startsWith("http://localhost") || (apiBaseUrl ? localIpPattern.test(apiBaseUrl) : false));

if (!envApiBaseUrl) {
  console.warn(
    `[Config] Missing EXPO_PUBLIC_API_BASE_URL. Falling back to default ${DEFAULT_API_BASE_URL}.`
  );
}

if (!isHttps && !isLocalDev) {
  console.warn("[Config] EXPO_PUBLIC_API_BASE_URL should use https in production builds.");
}

export const API_BASE_URL = apiBaseUrl;
export const IS_API_BASE_DEFAULT = !envApiBaseUrl;

export type PersonaRole = "god" | "devil" | "council";
