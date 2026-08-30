/**
 * Screen 6 — what Threshold can and cannot see.
 *
 * The highest drop-off point in the flow, and the one screen where being
 * *specific* beats being reassuring. The three-pill diagram runs first so the
 * mechanic is understood before it is described, then three plain statements,
 * each phrased as a limit rather than a promise. It closes by naming what
 * happens next, so Apple's dialog is never a surprise.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { CaptionHeader } from '../../src/components/Nav';
import { Screen } from '../../src/components/Screen';
import { useFlow } from '../../src/onboarding/state';
import { color } from '../../src/theme/colors';
import { gutter } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

const STATEMENTS = [
  {
    accent: true,
    title: 'It knows when you tap the icon — nothing more',
    detail:
      'Screen Time tells us an app is about to open. That signal is the whole mechanic.',
  },
  {
    accent: false,
    title: 'It cannot see inside the app',
    detail:
      'No carts, no browsing, no orders, no receipts. Apple never hands that over, and we never ask.',
  },
  {
    accent: false,
    title: 'Your numbers stay on this phone',
    detail:
      'The amounts you enter are yours. No bank connection, no card, no purchase history.',
  },
];

export default function Trust() {
  const { next, back } = useFlow();

  return (
    <Screen gutter={gutter.wide}>
      <CaptionHeader onBack={back} caption="Setup 1 of 4" />

      <Text style={styles.title}>Here is exactly what Threshold sees.</Text>

      <View style={styles.flow}>
        <Pill label="You tap the app" />
        <Text style={styles.arrow}>→</Text>
        <Pill label="Pause" highlighted />
        <Text style={styles.arrow}>→</Text>
        <Pill label="App opens" />
      </View>

      <View style={styles.statements}>
        {STATEMENTS.map((statement) => (
          <View key={statement.title} style={styles.statement}>
            <View style={styles.statementHead}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: statement.accent ? color.accentBright : color.muted60 },
                ]}
              />
              <Text style={styles.statementTitle}>{statement.title}</Text>
            </View>
            <Text style={styles.statementDetail}>{statement.detail}</Text>
          </View>
        ))}
      </View>

      <Button label="Continue" onPress={() => next('trust')} />
      <Text style={styles.fine}>
        iOS will ask next. You can turn it off in Settings anytime.
      </Text>
    </Screen>
  );
}

function Pill({ label, highlighted = false }: { label: string; highlighted?: boolean }) {
  return (
    <View style={[styles.pill, highlighted && styles.pillOn]}>
      <Text style={[styles.pillText, highlighted && styles.pillTextOn]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...type.title, marginTop: 26, color: color.text },
  flow: { marginTop: 26, flexDirection: 'row', alignItems: 'center', gap: 9 },
  pill: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: color.surface,
    // Keeps the highlighted pill the same height as its neighbours, which have
    // no border of their own.
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillOn: { backgroundColor: color.accentA18, borderColor: color.accentA55 },
  pillText: {
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 12.5,
    color: color.muted86,
  },
  pillTextOn: { color: color.text },
  arrow: { fontFamily: type.mono.fontFamily, fontSize: 12, color: color.muted55 },

  statements: { flex: 1, marginTop: 8 },
  statement: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: color.rule },
  statementHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  dot: { width: 6, height: 6, borderRadius: 2, marginTop: 7 },
  statementTitle: {
    flex: 1,
    fontFamily: type.ui.fontFamily,
    fontSize: 16.5,
    lineHeight: 16.5 * 1.3,
    color: color.textStrong,
  },
  statementDetail: {
    marginTop: 6,
    marginLeft: 17,
    fontFamily: type.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.5,
    color: color.muted70,
  },
  fine: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 13,
    color: color.muted60,
  },
});
