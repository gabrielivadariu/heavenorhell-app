// Compatibility wrapper: all purchases must go through the store.
import { purchasePremium as purchaseWithStore } from "./revenuecat";

export async function purchasePremium(): Promise<boolean> {
  return (await purchaseWithStore()).success;
}
