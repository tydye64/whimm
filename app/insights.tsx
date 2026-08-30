/**
 * Screen 16 — insights.
 *
 * Back to full restraint immediately after the loudest screen in the app.
 *
 * The rule this screen is built on: every claim carries the count that proves
 * it. "8 of your last 11 pauses started between 9 and 11pm on a Sunday" is a
 * finding; "you shop late at night" is a horoscope. The difference is whether
 * the user can check it against their own memory and find it true — which is
 * the only thing that makes the next suggestion worth taking.
 *
 * It also ends by saying where the patterns come from and that nothing leaves
 * the phone, because a screen that demonstrates it has been watching closely is
 * exactly where that question occurs to someone.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../src/components/Button';
import { Screen } from '../src/components/Screen';
import { color } from '../src/theme/colors';
import { radius } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

/** Pauses per weekday over the last four weeks, normalised to the peak. */
const WEEK = [
  { day: 'M', value: 0.34 },
  { day: 'T', value: 0.28 },
  { day: 'W', value: 0.4 },
  { day: 'T', value: 0.3 },
  { day: 'F', value: 0.62 },
  { day: 'S', value: 0.5 },
  { day: 'S', value: 1, peak: true },
];

const PATTERNS = [
  {
    tag: 'Holds up',
    title: 'Answering the question doubles your close rate.',
    detail:
      'When you type what you came for, you close 4 times out of 5. When you skip it, closer to 2.',
  },
  {
    tag: 'Fastest yes',
    title: 'Takeout gets through in under 20 seconds.',
    detail: 'Your food orders almost never wait out the pause. Everything else usually does.',
  },
  {
    tag: 'Quietest week',
    title: 'Payday week is calmer than you would guess.',
    detail: 'Your pauses cluster four to six days after payday, not on it.',
  },
];

export default function Insights() {
  const router = useRouter();
  const [applied, setApplied] = useState(false);

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.head}>
          <Text style={styles.stamp}>Pattern found · updated Sunday</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/home')} hitSlop={10}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        <Text style={styles.lead}>Sunday night is your expensive hour.</Text>
        <Text style={styles.evidence}>
          8 of your last 11 pauses started between 9 and 11pm on a Sunday, and that is also
          when you continue most often — 5 of those 8.
        </Text>

        <View style={styles.chart}>
          {/* Bars and labels are separate rows. The prototype nests the label
              inside the 74px bar box, which pushes the peak bar out through the
              top of the card — visible as a clip against the rounded corner. */}
          <View style={styles.bars}>
            {WEEK.map((day, i) => (
              <View key={`bar-${day.day}-${i}`} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.round(day.value * 100)}%`,
                      backgroundColor: day.peak ? color.accentBright : color.borderStrongAlt,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.barLabels}>
            {WEEK.map((day, i) => (
              <Text
                key={`label-${day.day}-${i}`}
                style={[
                  styles.barLabel,
                  { color: day.peak ? color.accentHi : color.muted60 },
                ]}
              >
                {day.day}
              </Text>
            ))}
          </View>
          <Text style={styles.chartNote}>
            Pauses by day, last four weeks. Sunday is nearly double any other night.
          </Text>
        </View>

        <View style={styles.patterns}>
          {PATTERNS.map((pattern) => (
            <View key={pattern.tag} style={styles.pattern}>
              <Text style={styles.patternTag}>{pattern.tag}</Text>
              <Text style={styles.patternTitle}>{pattern.title}</Text>
              <Text style={styles.patternDetail}>{pattern.detail}</Text>
            </View>
          ))}
        </View>

        {/* One suggestion, specific enough to act on, that visibly applies. */}
        <View style={styles.suggestion}>
          <Text style={styles.suggestionLabel}>Suggested change</Text>
          <Text style={styles.suggestionText}>
            {applied
              ? 'Sunday evenings now hold for 60 seconds, 9 to 11pm.'
              : 'Want a 60-second pause on Sunday evenings, and ten seconds the rest of the week?'}
          </Text>
          <View style={styles.suggestionActions}>
            <Button
              label={applied ? 'Applied' : 'Set it up'}
              variant="accent"
              size="compact"
              ready={!applied}
              onPress={() => setApplied(true)}
              style={styles.apply}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/home')}
              style={styles.dismiss}
            >
              <Text style={styles.dismissText}>Not now</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.provenance}>
          Patterns come from your pause history on this phone. Nothing about what you browse
          or buy leaves it.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  body: { paddingBottom: 40 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stamp: { ...type.label, color: color.muted64 },
  close: { fontFamily: type.ui.fontFamily, fontSize: 14.5, color: color.muted72 },

  lead: {
    marginTop: 22,
    fontFamily: type.title.fontFamily,
    fontSize: 32,
    lineHeight: 32 * 1.12,
    color: color.text,
  },
  evidence: {
    marginTop: 12,
    fontFamily: type.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.55,
    color: color.muted74,
  },

  chart: {
    marginTop: 22,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderRadius: radius.card,
    backgroundColor: color.surfaceSunken,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 74 },
  barColumn: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 5, minHeight: 4 },
  barLabels: { marginTop: 7, flexDirection: 'row', gap: 7 },
  barLabel: { flex: 1, textAlign: 'center', fontFamily: type.monoValue.fontFamily, fontSize: 10 },
  chartNote: {
    marginTop: 12,
    fontFamily: type.body.fontFamily,
    fontSize: 12,
    lineHeight: 12 * 1.4,
    color: color.muted64,
  },

  patterns: { marginTop: 22 },
  pattern: { paddingVertical: 18, borderTopWidth: 1, borderTopColor: color.rule },
  patternTag: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 10,
    letterSpacing: 0.12 * 10,
    textTransform: 'uppercase',
    color: color.accent,
  },
  patternTitle: {
    marginTop: 8,
    fontFamily: type.ui.fontFamily,
    fontSize: 16.5,
    lineHeight: 16.5 * 1.35,
    color: color.textStrong,
  },
  patternDetail: {
    marginTop: 6,
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: color.muted70,
  },

  suggestion: {
    marginTop: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: radius.cardLg,
    backgroundColor: color.accentA12,
    borderWidth: 1,
    borderColor: color.accentA42,
  },
  suggestionLabel: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 10,
    letterSpacing: 0.12 * 10,
    textTransform: 'uppercase',
    color: color.accentHi,
  },
  suggestionText: {
    marginTop: 9,
    fontFamily: type.ui.fontFamily,
    fontSize: 17,
    lineHeight: 17 * 1.35,
    color: color.text,
  },
  suggestionActions: { marginTop: 16, flexDirection: 'row', gap: 9 },
  apply: { flex: 1 },
  dismiss: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.borderButton,
    justifyContent: 'center',
  },
  dismissText: { fontFamily: type.ui.fontFamily, fontSize: 15, color: color.muted86 },

  provenance: {
    marginTop: 20,
    fontFamily: type.body.fontFamily,
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: color.muted58,
  },
});
