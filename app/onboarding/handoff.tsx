/**
 * Screen 12 — setup complete.
 *
 * States what is now true rather than congratulating anyone, and is honest that
 * the total starts at zero. Pass 3 replaces "Replay the flow" with the real
 * hand-off into the home screen.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useFlow } from '../../src/onboarding/state';
import { color } from '../../src/theme/colors';
import { gutter, topOffset } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

const UP_NEXT = [
  {
    n: '01',
    title: 'One app on pause',
    detail: 'Swap which one whenever you like.',
  },
  {
    n: '02',
    title: 'Ten seconds, question on',
    detail: 'Change it any time from settings.',
  },
  {
    n: '03',
    title: '$0 avoided so far',
    detail: 'Your total starts the first time you put something back.',
  },
];

export default function Handoff() {
  const { restart } = useFlow();

  return (
    <Screen gutter={gutter.wide} top={topOffset.caption}>
      <Text style={styles.caption}>You're set</Text>
      <Text style={styles.title}>Your pause is live.</Text>

      <View style={styles.list}>
        {UP_NEXT.map((row) => (
          <View key={row.n} style={styles.row}>
            <Text style={styles.index}>{row.n}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowDetail}>{row.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button label="Replay the flow" variant="outline" onPress={restart} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  caption: { ...type.label, color: color.muted66 },
  title: {
    marginTop: 14,
    fontFamily: type.title.fontFamily,
    fontSize: 36,
    lineHeight: 36 * 1.08,
    color: color.text,
  },
  list: { flex: 1, marginTop: 30 },
  row: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: color.rule,
  },
  index: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 12,
    color: color.accent,
    // Aligns the number to the first line of the title beside it.
    marginTop: 4,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: type.ui.fontFamily, fontSize: 16.5, color: color.textBody },
  rowDetail: {
    marginTop: 4,
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    lineHeight: 14 * 1.45,
    color: color.muted66,
  },
});
