/**
 * The purchases seam.
 *
 * Mirrors ../screentime/index.ts: a typed interface, real behaviour, and a
 * failure mode that never throws. Purchases has an extra hazard screen time
 * doesn't — a malformed API key crashes the app on the SDK's native queue
 * *after* `configure()` has already returned to JS, with no catchable error
 * and no stack trace. So the key is validated before it ever reaches the SDK,
 * and every export reports failure through its return value instead.
 *
 * Every export distinguishes "not configured" from "user cancelled" from
 * "SDK error" — callers need to tell those apart (e.g. a cancelled purchase
 * must not show an error).
 */
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

import { PRO_ENTITLEMENT_ID } from './entitlement';

export type Failure =
  | { ok: false; reason: 'not_configured' }
  | { ok: false; reason: 'no_offering' }
  | { ok: false; reason: 'user_cancelled' }
  | { ok: false; reason: 'sdk_error'; error: unknown };

export type PurchasesResult<T> = { ok: true; data: T } | Failure;

// RevenueCat public keys only: "appl_…" / "goog_…" for a live project, or
// "test_…" in a sandbox. Never a secret key — this ships inside the binary.
const API_KEY_PATTERN = /^(appl|goog|test)_[A-Za-z0-9]+$/;

function resolveApiKey(): string | null {
  // Android is dropped (the mechanic is FamilyControls, iOS-only), and the
  // simulator/web have no store to talk to — both stay unconfigured.
  if (Platform.OS !== 'ios') return null;
  const key = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  return key && API_KEY_PATTERN.test(key) ? key : null;
}

let configured = false;

/**
 * Configures the SDK exactly once; later calls are a no-op. Never throws —
 * a missing or malformed key leaves purchases unavailable rather than
 * crashing the app, so this is safe to call unconditionally on mount.
 */
export function configure(): PurchasesResult<void> {
  if (configured) return { ok: true, data: undefined };
  const apiKey = resolveApiKey();
  if (!apiKey) return { ok: false, reason: 'not_configured' };
  try {
    Purchases.configure({ apiKey });
    configured = true;
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, reason: 'sdk_error', error };
  }
}

export function isConfigured(): boolean {
  return configured;
}

export function isPro(info: CustomerInfo): boolean {
  return info.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

export async function getCustomerInfo(): Promise<PurchasesResult<CustomerInfo>> {
  if (!configured) return { ok: false, reason: 'not_configured' };
  try {
    return { ok: true, data: await Purchases.getCustomerInfo() };
  } catch (error) {
    return { ok: false, reason: 'sdk_error', error };
  }
}

export async function getOffering(): Promise<PurchasesResult<PurchasesOffering>> {
  if (!configured) return { ok: false, reason: 'not_configured' };
  try {
    const current = (await Purchases.getOfferings()).current;
    if (!current) return { ok: false, reason: 'no_offering' };
    return { ok: true, data: current };
  } catch (error) {
    return { ok: false, reason: 'sdk_error', error };
  }
}

function isUserCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'userCancelled' in error &&
    (error as { userCancelled?: unknown }).userCancelled === true
  );
}

export async function purchase(
  pkg: PurchasesPackage,
): Promise<PurchasesResult<CustomerInfo>> {
  if (!configured) return { ok: false, reason: 'not_configured' };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: true, data: customerInfo };
  } catch (error) {
    if (isUserCancelled(error)) return { ok: false, reason: 'user_cancelled' };
    return { ok: false, reason: 'sdk_error', error };
  }
}

export async function restore(): Promise<PurchasesResult<CustomerInfo>> {
  if (!configured) return { ok: false, reason: 'not_configured' };
  try {
    return { ok: true, data: await Purchases.restorePurchases() };
  } catch (error) {
    return { ok: false, reason: 'sdk_error', error };
  }
}

/** Registers a listener for the lifetime of the returned unsubscribe call. */
export function addCustomerInfoListener(
  listener: CustomerInfoUpdateListener,
): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}
