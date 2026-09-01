/**
 * Mounted exactly once, at the root — see EntitlementSync in app/_layout.tsx.
 * Configures RevenueCat, reads the starting entitlement, and keeps `pro` in
 * step with every subsequent customer-info update (a purchase, a renewal, a
 * cancellation, a restore on another device).
 *
 * The store's persisted `pro` is treated as optimistic, not authoritative:
 * it's what renders before this effect resolves, and this corrects it once
 * RevenueCat actually answers — so a slow network never locks out someone
 * who has genuinely paid, and never leaves someone stuck Pro after lapsing.
 */
import { useEffect } from 'react';

import { useStore } from '../shield/store';
import { addCustomerInfoListener, configure, getCustomerInfo, isPro } from './index';

export function useEntitlement(): void {
  const { setPro } = useStore();

  useEffect(() => {
    const configured = configure();
    if (!configured.ok) return;

    let cancelled = false;
    getCustomerInfo().then((result) => {
      if (!cancelled && result.ok) setPro(isPro(result.data));
    });

    const unsubscribe = addCustomerInfoListener((info) => {
      setPro(isPro(info));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [setPro]);
}
