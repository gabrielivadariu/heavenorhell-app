import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hh_ai_sharing_consent';
const VERSION = 'cloudflare-openai-v1';
export async function hasAiConsent(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === VERSION;
}
export async function grantAiConsent(): Promise<void> {
  await AsyncStorage.setItem(KEY, VERSION);
}
export async function revokeAiConsent(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
