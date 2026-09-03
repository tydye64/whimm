/**
 * Screen 11 — Pro.
 *
 * Placed immediately after the practice run, because that is the only moment
 * the value is felt rather than described. Three exits are deliberately left
 * open: "Not now" top-right, the full-width free option at the bottom, and the
 * back gesture. An app about not being pressured into spending cannot pressure
 * people into spending.
 */
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TERMS_URL, PRIVACY_URL } from '../../src/legal';
import { useFlow } from '../../src/onboarding/state';
import { getOffering, isPro, purchase, restore } from '../../src/purchases';
import { PlanId } from '../../src/purchases/entitlement';
import { color, optionState } from '../../src/theme/colors';
import { radius } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

const COMPARISON = [
  { feature: 'Apps watched', free: '1', pro: 'Unlimited' },
  { feature: 'Pause length', free: '10s', pro: '5s – 5 min' },
  { feature: 'Reflection question', free: 'Included', pro: 'Included' },
  { feature: 'Extra step', free: '—', pro: 'Breathe or type-to-confirm' },
  { feature: 'Mid-session re-shield', free: '—', pro: 'Yes' },
];

type PlanDisplay = { id: PlanId; tag: string; price: string; note: string };

// Rendered wherever the real offering hasn't loaded — no RevenueCat project yet,
// or web/simulator where there's no store to ask. Keeps the screen walkable
// everywhere it always has been.
const FALLBACK_PLANS: PlanDisplay[] = [
  { id: 'monthly', tag: 'Monthly', price: '$3.99', note: 'billed each month' },
  { id: 'annual', tag: 'Yearly', price: '$29.99', note: '$2.50 a month' },
];

function planDisplay(
  id: PlanId,
  tag: string,
  pkg: PurchasesPackage | null | undefined,
  fallback: PlanDisplay,
): PlanDisplay {
  if (!pkg) return fallback;
  // pricePerMonthString is the localized annual price divided down to a
  // monthly figure — the same thing the hardcoded "$2.50 a month" was
  // approximating, but correct in every storefront rather than just the US.
  const note =
    id === 'annual' && pkg.product.pricePerMonthString
      ? `${pkg.product.pricePerMonthString} a month`
      : fallback.note;
  return { id, tag, price: pkg.product.priceString, note };
}

export default function Paywall() {
  const { plan, setPlan, next } = useFlow();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOffering().then((result) => {
      if (!cancelled && result.ok) setOffering(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const plans: PlanDisplay[] = [
    planDisplay('monthly', 'Monthly', offering?.monthly, FALLBACK_PLANS[0]),
    planDisplay('annual', 'Yearly', offering?.annual, FALLBACK_PLANS[1]),
  ];
  const selectedPlan = plans.find((p) => p.id === plan)!;

  const done = () => next('paywall');

  const start = async () => {
    const pkg = plan === 'monthly' ? offering?.monthly : offering?.annual;
    // No real package to buy (web, simulator, or not yet configured) — same
    // no-op-and-continue behaviour the mock always had.
    if (!pkg) {
      done();
      return;
    }
    setError(null);
    setPurchasing(true);
    const result = await purchase(pkg);
    setPurchasing(false);
    if (result.ok) {
      done();
    } else if (result.reason !== 'user_cancelled') {
      setError('Something went wrong — try again.');
    }
  };

  const restorePurchases = async () => {
    setError(null);
    setRestoring(true);
    const result = await restore();
    setRestoring(false);
    if (!result.ok) {
      setError('Could not restore — try again.');
    } else if (isPro(result.data)) {
      done();
    }
    // Restored ok but not Pro: no purchase found on this Apple ID — not an
    // error, so the screen just stays put.
  };

  return (
    <Screen enter="fade" style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.head}>
          <Text style={styles.eyebrow}>Whimm Pro</Text>
          <Pressable accessibilityRole="button" onPress={done} hitSlop={10}>
            <Text style={styles.dismiss}>Not now</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>That worked once. Pro makes it hold.</Text>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={styles.headCell} />
            <Text style={[styles.headCell, styles.centered]}>Free</Text>
            <Text style={[styles.headCell, styles.centered, styles.headPro]}>Pro</Text>
          </View>
          {COMPARISON.map((row) => (
            <View key={row.feature} style={styles.tableRow}>
              <Text style={styles.rowFeature}>{row.feature}</Text>
              <Text style={styles.rowFree}>{row.free}</Text>
              <Text style={styles.rowPro}>{row.pro}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {plans.map((option) => {
            const selected = plan === option.id;
            const t = selected ? optionState.on : optionState.off;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setPlan(option.id)}
                style={[styles.plan, { backgroundColor: t.bg, borderColor: t.border }]}
              >
                <Text
                  style={[
                    styles.planTag,
                    { color: selected ? color.accentBright : color.muted66 },
                  ]}
                >
                  {option.tag}
                </Text>
                <Text style={styles.planPrice}>{option.price}</Text>
                <Text style={styles.planNote}>{option.note}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Button
            label={purchasing ? 'Purchasing…' : 'Start 7 days free'}
            variant="accent"
            ready={!purchasing}
            onPress={start}
          />
          <Text style={styles.fine}>
            {plan === 'annual'
              ? `Then ${selectedPlan.price} a year. Cancel anytime — one tap in Settings.`
              : `Then ${selectedPlan.price} a month. Cancel anytime — one tap in Settings.`}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Stay on free — one app, ten seconds" variant="text" onPress={done} />
          <View style={styles.legalRow}>
            <Pressable accessibilityRole="button" onPress={restorePurchases} hitSlop={8}>
              <Text style={styles.legalLink}>
                {restoring ? 'Restoring…' : 'Restore purchases'}
              </Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
              <Text style={styles.legalLink}>Terms</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
              <Text style={styles.legalLink}>Privacy</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  body: { paddingBottom: 44 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { ...type.label, color: color.muted60 },
  dismiss: { fontFamily: type.ui.fontFamily, fontSize: 14, color: color.muted62 },
  title: {
    marginTop: 20,
    fontFamily: type.title.fontFamily,
    fontSize: 33,
    lineHeight: 33 * 1.1,
    color: color.text,
  },

  table: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: color.rule,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: color.surface,
  },
  headCell: {
    ...type.labelTight,
    color: color.muted68,
    flex: 0.7,
  },
  headPro: { color: color.accentBright, flex: 0.9 },
  centered: { textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  rowFeature: {
    flex: 1.35,
    fontFamily: type.ui.fontFamily,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.3,
    color: color.textQuiet,
  },
  rowFree: {
    flex: 0.7,
    textAlign: 'center',
    fontFamily: type.mono.fontFamily,
    fontSize: 12.5,
    color: color.muted62,
  },
  rowPro: {
    flex: 0.9,
    textAlign: 'center',
    fontFamily: type.mono.fontFamily,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.25,
    color: color.accentSoft,
  },

  plans: { marginTop: 18, flexDirection: 'row', gap: 9 },
  plan: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: radius.tile,
    borderWidth: 1,
  },
  planTag: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 12,
    letterSpacing: 0.08 * 12,
    textTransform: 'uppercase',
  },
  planPrice: {
    marginTop: 7,
    fontFamily: type.title.fontFamily,
    fontSize: 26,
    lineHeight: 26,
    color: color.text,
  },
  planNote: {
    marginTop: 5,
    fontFamily: type.body.fontFamily,
    fontSize: 12,
    color: color.muted68,
  },

  actions: { marginTop: 20, gap: 11 },
  fine: {
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.45,
    color: color.muted60,
  },
  error: {
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.45,
    color: color.accentBright,
  },
  legalRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: { fontFamily: type.ui.fontFamily, fontSize: 12.5, color: color.muted62 },
  legalDot: { fontFamily: type.ui.fontFamily, fontSize: 12.5, color: color.muted60 },
});
