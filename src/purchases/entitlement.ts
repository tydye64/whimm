/**
 * Single source of truth for RevenueCat identifiers.
 *
 * These strings must match the RevenueCat dashboard exactly. There is no
 * backend to catch a mismatch — a typo here makes Pro invisible to whoever
 * just paid for it, with no error anywhere.
 */
export const PRO_ENTITLEMENT_ID = 'pro';

/** RevenueCat's standard package identifiers for a monthly/annual offering. */
export const PACKAGE_IDENTIFIERS = {
  monthly: '$rc_monthly',
  annual: '$rc_annual',
} as const;

export type PlanId = keyof typeof PACKAGE_IDENTIFIERS;
