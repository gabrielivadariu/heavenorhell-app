// Expo statically replaces EXPO_PUBLIC_* references when bundling the app.
declare const process: { env: Record<string, string | undefined> };
