/**
 * Screen 9 — the pause length.
 *
 * Free tier gets one fixed value, stated as a fact rather than offered as a
 * choice: "Your pause is ten seconds", with the reasoning in one line beneath.
 * The Pro capabilities sit below as a quiet locked list — visible, labelled,
 * and not sold. Nothing on this screen interrupts to ask for money; that
 * conversation happens after the shield has proved itself.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { CaptionHeader } from '../../src/components/Nav';
import { ProTag } from '../../src/components/Options';
import { Screen } from '../../src/components/Screen';
import { useFlow } from '../../src/onboarding/state';
import { DEFAULT_PAUSE_SECONDS } from '../../src/shield/model';
import { color } from '../../src/theme/colors';
import { gutter, radius } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

const PRO_ROWS = [
  'Pause length, 5 seconds to 5 minutes',
  'A breathing beat before the buttons',
  'Type-to-confirm instead of a tap',
  "Re-shield if you're still in there later",
  'As many apps as you want watched',
];

export default function Friction() {
  const { next, back } = useFlow();

  return (
    <Screen gutter={gutter.wide}>
      <CaptionHeader onBack={back} caption="Setup 4 of 4" />

      <Text style={styles.title}>Your pause is ten seconds.</Text>
      <Text style={styles.sub}>
        Long enough to notice the urge, short enough that a real errand isn't a fight.
      </Text>

      <View style={styles.card}>
        <Text style={styles.number}>{DEFAULT_PAUSE_SECONDS}</Text>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>seconds, then your choice</Text>
          <Text style={styles.cardSub}>
            Plus one optional question: what are you here for?
          </Text>
        </View>
      </View>

      <View style={styles.pro}>
        <Text style={styles.proLabel}>Adjustable on Pro</Text>
        <View style={styles.proList}>
          {PRO_ROWS.map((row) => (
            <View key={row} style={styles.proRow}>
              <Text style={styles.proRowText}>{row}</Text>
              <ProTag />
            </View>
          ))}
        </View>
      </View>

      <Button label="Try it once, right now" onPress={() => next('friction')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: type.title.fontFamily,
    fontSize: 32,
    lineHeight: 32 * 1.12,
    marginTop: 26,
    color: color.text,
  },
  sub: { ...type.body, marginTop: 9, maxWidth: 300, color: color.muted70 },

  card: {
    marginTop: 22,
    padding: 22,
    borderRadius: radius.cardLg,
    backgroundColor: color.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  number: {
    fontFamily: type.title.fontFamily,
    fontSize: 54,
    lineHeight: 54,
    color: color.accentBright,
  },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: type.ui.fontFamily, fontSize: 15, color: color.textStrong },
  cardSub: {
    marginTop: 4,
    fontFamily: type.body.fontFamily,
    fontSize: 13,
    lineHeight: 13 * 1.4,
    color: color.muted68,
  },

  pro: { flex: 1, marginTop: 24 },
  proLabel: { ...type.labelTight, color: color.muted60 },
  proList: { marginTop: 10 },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: color.ruleSoft,
  },
  proRowText: { flex: 1, fontFamily: type.ui.fontFamily, fontSize: 15, color: color.muted78 },
});
