/**
 * Screen 5 — the personalized payoff.
 *
 * This is the first place the app raises its voice: a 104px count-up, the italic
 * translation into something physical, and the only ochre CTA before the
 * paywall. Everything preceding it is restrained precisely so this lands.
 *
 * The breakdown rows under the rule are not decoration — they show the
 * arithmetic, including the 55% assumption, so the number can be disagreed with
 * rather than swallowed. A projection you can audit is a projection you trust.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Glow } from '../../src/components/Glow';
import { Screen } from '../../src/components/Screen';
import { useCountUp } from '../../src/hooks/useCountUp';
import { project, tangibleLine } from '../../src/onboarding/model';
import { useFlow } from '../../src/onboarding/state';
import { color } from '../../src/theme/colors';
import { gutter, topOffset } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

/** Switch to 'yearly' to show a first-year figure instead. */
const TIMEFRAME: 'monthly' | 'yearly' = 'monthly';

export default function Payoff() {
  const { answers, next, back } = useFlow();
  const projection = project(answers, TIMEFRAME);
  const shown = useCountUp(projection.amount);
  const yearly = TIMEFRAME === 'yearly';

  const breakdown = [
    { key: 'App types watched', value: String(answers.categories.length) },
    { key: 'Impulse orders', value: projection.frequency.hint },
    { key: 'Typical order', value: projection.average.label },
    { key: 'Assumed pause rate', value: '55%' },
  ];

  return (
    <Screen
      enter="fade"
      gutter={gutter.wide}
      top={topOffset.caption}
      backdrop={<Glow width={560} height={460} bottom={-180} opacity={0.16} />}
    >
      <Text style={styles.caption}>
        {yearly ? 'Your first-year estimate' : 'Your monthly estimate'}
      </Text>

      <View style={styles.middle}>
        <View style={styles.figure}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.amount}>{shown.toLocaleString()}</Text>
        </View>
        <Text style={styles.sub}>
          {yearly ? 'you could keep this year' : 'a month you could hold on to'}
        </Text>
        <Text style={styles.tangible}>{tangibleLine(projection, answers.item)}</Text>
      </View>

      <View style={styles.breakdown}>
        {breakdown.map((row) => (
          <View key={row.key} style={styles.row}>
            <Text style={styles.rowKey}>{row.key}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Set up my pause" variant="accent" onPress={() => next('payoff')} />
        <Button label="Adjust my answers" variant="text" onPress={back} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  caption: { ...type.label, color: color.muted66 },
  middle: { flex: 1, justifyContent: 'center', paddingBottom: 12 },
  figure: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  currency: {
    fontFamily: type.title.fontFamily,
    fontSize: 44,
    lineHeight: 44,
    paddingTop: 14,
    color: color.accentBright,
  },
  amount: {
    fontFamily: type.title.fontFamily,
    fontSize: 104,
    lineHeight: 104 * 0.92,
    letterSpacing: -0.02 * 104,
    color: color.accentBright,
  },
  sub: {
    marginTop: 8,
    fontFamily: type.ui.fontFamily,
    fontSize: 17,
    color: color.textQuiet,
  },
  tangible: { ...type.serifBody, marginTop: 22, color: color.muted82 },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: color.borderMid,
    paddingTop: 16,
    gap: 9,
    marginBottom: 22,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  rowKey: { fontFamily: type.ui.fontFamily, fontSize: 13, color: color.muted68 },
  rowValue: {
    fontFamily: type.mono.fontFamily,
    fontSize: 12,
    color: color.textQuieter,
    textAlign: 'right',
  },
  actions: { gap: 12 },
});
