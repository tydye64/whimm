/**
 * The quiet confirmation.
 *
 * Where most saves land. The total counts up from where it was to where it now
 * is, the per-category line names what did not arrive, and the screen returns
 * home on its own — no button, because there is no decision left to make.
 *
 * This is the restraint that the milestone screen spends. If every save looked
 * like a celebration, none of them would be one.
 */
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Glow } from '../src/components/Glow';
import { Screen } from '../src/components/Screen';
import { useCountUp } from '../src/hooks/useCountUp';
import { useStore } from '../src/shield/store';
import { color } from '../src/theme/colors';
import { text as type } from '../src/theme/type';
import { KINDS } from './capture';

const RETURN_AFTER_MS = 2600;

export default function Saved() {
  const router = useRouter();
  const { totalAvoided } = useStore();
  const { kind, amount } = useLocalSearchParams<{ kind?: string; amount?: string }>();

  const added = Number(amount ?? 0);
  const shown = useCountUp(totalAvoided, { from: totalAvoided - added, duration: 900 });
  const phrase = KINDS.find((k) => k.id === kind)?.phrase;

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/home'), RETURN_AFTER_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Screen
      enter="fade"
      style={styles.screen}
      backdrop={<Glow width={520} height={420} bottom={-160} opacity={0.15} />}
    >
      <Text style={styles.label}>Total avoided</Text>
      <View style={styles.figure}>
        <Text style={styles.currency}>$</Text>
        <Text style={styles.amount}>{shown.toLocaleString()}</Text>
      </View>
      <Text style={styles.line}>
        {phrase ? `That's ${phrase}.` : 'One fewer box on the doorstep this week.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center' },
  label: { ...type.label, color: color.muted68 },
  figure: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 3 },
  currency: {
    fontFamily: type.title.fontFamily,
    fontSize: 36,
    lineHeight: 36,
    paddingTop: 12,
    color: color.accentHi,
  },
  amount: {
    fontFamily: type.title.fontFamily,
    fontSize: 90,
    lineHeight: 90 * 0.94,
    color: color.accentHi,
  },
  line: {
    marginTop: 14,
    maxWidth: 260,
    textAlign: 'center',
    fontFamily: type.serifBody.fontFamily,
    fontSize: 21,
    lineHeight: 21 * 1.35,
    color: color.muted84,
  },
});
