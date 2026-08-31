/**
 * Screen 17 — home.
 *
 * The everyday screen. The total is the hero, but in the *restrained*
 * treatment: off-white numerals with only the `$` in ochre. The milestone
 * screen keeps the monopoly on loudness, and this screen is seen every day —
 * a number that shouts on the fiftieth viewing is a number you stop reading.
 *
 * The history list is the part that takes discipline. Sessions the user
 * continued through are listed in the same rows, same type, same order as the
 * ones they closed. The only difference is the right column: an ochre `+$60`
 * versus a muted "continued". No red, no icons, no empty state scolding anyone
 * into a streak. An app that shames you for the times you continued is an app
 * you stop opening, and then it cannot help at all.
 */
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../src/components/Screen';
import { useStore } from '../src/shield/store';
import { color } from '../src/theme/colors';
import { radius } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

export default function Home() {
  const router = useRouter();
  const { totalAvoided, pauses, streak, history } = useStore();

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.head}>
          <View style={styles.brand}>
            <View style={styles.mark} />
            <Text style={styles.wordmark}>Whimm</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} hitSlop={10}>
            <Text style={styles.settings}>Settings</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Avoided so far</Text>
          <View style={styles.figure}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.total}>{totalAvoided.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{pauses}</Text>
            <Text style={styles.statKey}>Times resisted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={[styles.stat, styles.statRight]}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statKey}>Day streak</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/insights')}
          style={({ pressed }) => [styles.pattern, pressed && { backgroundColor: color.surfaceHover }]}
        >
          <View style={styles.patternText}>
            <Text style={styles.patternLabel}>This week's pattern</Text>
            <Text style={styles.patternTitle}>Sunday night is your expensive hour.</Text>
          </View>
          <Text style={styles.patternArrow}>→</Text>
        </Pressable>

        <View style={styles.historyHead}>
          <Text style={styles.historyLabel}>Recent pauses</Text>
          <Text style={styles.historyNote}>last 4 days</Text>
        </View>
        <View>
          {history.map((event) => (
            <View key={event.id} style={styles.event}>
              <View style={styles.eventTile}>
                <Text style={styles.eventTileText}>{event.app}</Text>
              </View>
              <View style={styles.eventText}>
                <Text style={styles.eventLabel}>{event.label}</Text>
                <Text style={styles.eventWhen}>{event.when}</Text>
              </View>
              <Text
                style={[
                  styles.eventValue,
                  { color: event.saved === null ? color.muted62 : color.accentHi },
                ]}
              >
                {event.saved === null ? 'continued' : `+$${event.saved}`}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.harnessRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/harness')}
            style={styles.harness}
          >
            <Text style={styles.harnessText}>back to the phone home screen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  body: { paddingBottom: 40 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 10, height: 10, borderRadius: 3, backgroundColor: color.accent },
  wordmark: { ...type.label, color: color.muted68 },
  settings: { fontFamily: type.ui.fontFamily, fontSize: 14, color: color.muted72 },

  hero: { marginTop: 30 },
  heroLabel: {
    ...type.labelTight,
    letterSpacing: 0.12 * 10.5,
    color: color.muted62,
  },
  figure: { marginTop: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 3 },
  // Only the dollar sign is ochre. The numerals stay off-white so the daily
  // screen never competes with the milestone.
  currency: {
    fontFamily: type.title.fontFamily,
    fontSize: 34,
    lineHeight: 34,
    paddingTop: 11,
    color: color.accentBright,
  },
  total: {
    fontFamily: type.title.fontFamily,
    fontSize: 84,
    lineHeight: 84 * 0.92,
    letterSpacing: -0.02 * 84,
    color: color.text,
  },

  stats: {
    marginTop: 26,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: color.rule,
  },
  stat: { flex: 1, paddingVertical: 16 },
  statRight: { paddingLeft: 18 },
  statDivider: { width: 1, backgroundColor: color.rule },
  statValue: { fontFamily: type.title.fontFamily, fontSize: 28, lineHeight: 28, color: color.text },
  statKey: {
    marginTop: 4,
    fontFamily: type.monoValue.fontFamily,
    fontSize: 10,
    letterSpacing: 0.1 * 10,
    textTransform: 'uppercase',
    color: color.muted62,
  },

  pattern: {
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 17,
    borderRadius: radius.card,
    backgroundColor: color.surfaceRaised,
    borderWidth: 1,
    borderColor: color.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  patternText: { flex: 1 },
  patternLabel: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 10,
    letterSpacing: 0.12 * 10,
    textTransform: 'uppercase',
    color: color.accentBright,
  },
  patternTitle: {
    marginTop: 6,
    fontFamily: type.ui.fontFamily,
    fontSize: 15.5,
    lineHeight: 15.5 * 1.3,
    color: color.textStrong,
  },
  patternArrow: { fontFamily: type.ui.fontFamily, fontSize: 16, color: color.muted66 },

  historyHead: {
    marginTop: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  historyLabel: { ...type.labelTight, letterSpacing: 0.12 * 10.5, color: color.muted62 },
  historyNote: { fontFamily: type.ui.fontFamily, fontSize: 12, color: color.muted58 },

  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: color.ruleSoft,
  },
  eventTile: {
    width: 30,
    height: 30,
    borderRadius: radius.tileSm,
    backgroundColor: color.surfaceTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTileText: { fontFamily: type.monoValue.fontFamily, fontSize: 8.5, color: color.muted80 },
  eventText: { flex: 1, minWidth: 0 },
  eventLabel: { fontFamily: type.ui.fontFamily, fontSize: 15, color: color.textBody },
  eventWhen: {
    marginTop: 3,
    fontFamily: type.body.fontFamily,
    fontSize: 12.5,
    color: color.muted64,
  },
  eventValue: { fontFamily: type.monoValue.fontFamily, fontSize: 12, textAlign: 'right' },

  harnessRow: { marginTop: 24, alignItems: 'center' },
  harness: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: color.borderMid,
  },
  harnessText: { fontFamily: type.mono.fontFamily, fontSize: 11.5, color: color.muted66 },
});
