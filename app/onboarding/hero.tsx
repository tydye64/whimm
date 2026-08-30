/**
 * Screen 1 — cold open.
 *
 * Sells the outcome, not the mechanic: one statement, one line of plain
 * explanation that defuses the "is this a blocker?" fear, one CTA. No signup,
 * and the reassurance about it sits under the button rather than in a modal.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Glow } from '../../src/components/Glow';
import { Screen } from '../../src/components/Screen';
import { useFlow } from '../../src/onboarding/state';
import { color } from '../../src/theme/colors';
import { gutter, topOffset } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

export default function Hero() {
  const { next } = useFlow();

  return (
    <Screen
      enter="fade"
      gutter={gutter.shield}
      top={topOffset.brand}
      /* The bloom bleeds off the top edge and breathes on a 9s cycle. */
      backdrop={<Glow width={520} height={420} top={-140} opacity={0.22} breathe />}
    >
      <View style={styles.brand}>
        <View style={styles.mark} />
        <Text style={styles.wordmark}>Threshold</Text>
      </View>

      <View style={styles.middle}>
        <Text style={styles.headline}>Keep the money you didn't mean to spend.</Text>
        <Text style={styles.sub}>
          One calm screen appears before your shopping and delivery apps open. Nothing is
          blocked — you just get a moment to decide.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button label="Begin" onPress={() => next('hero')} />
        <Text style={styles.fine}>Takes about a minute. No account yet.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 11, height: 11, borderRadius: 3, backgroundColor: color.accent },
  wordmark: {
    fontFamily: type.button.fontFamily,
    fontSize: 13,
    letterSpacing: 0.14 * 13,
    textTransform: 'uppercase',
    color: color.muted72,
  },
  middle: { flex: 1, justifyContent: 'center', paddingBottom: 20 },
  headline: { ...type.hero, color: color.text },
  sub: { ...type.bodyLg, marginTop: 26, maxWidth: 300, color: color.muted78 },
  footer: { gap: 14 },
  fine: {
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 14,
    color: color.muted62,
  },
});
