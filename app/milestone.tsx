/**
 * Screen 15 — the milestone.
 *
 * The only inversion in the app: ochre floods the display and deep teal type
 * sits on top of it. A 132px number, a rotated mono rail down the outer edge,
 * and a staggered entrance. Everything else in Threshold is restrained so that
 * this screen has something to spend.
 *
 * It fires only on a genuine threshold crossing, never on every save. That
 * scarcity is the design: a celebration that happens each time is wallpaper.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { Glow } from '../src/components/Glow';
import { Rise } from '../src/components/Rise';
import { MILESTONES, useStore } from '../src/shield/store';
import { color } from '../src/theme/colors';
import { bottomOffset, resolve, topOffset } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

export default function Milestone() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pad = resolve(insets);
  const { pauses } = useStore();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  const value = Number(amount ?? 250);
  const index = MILESTONES.indexOf(value);

  return (
    <LinearGradient
      colors={[color.milestoneTop, color.milestoneBottom]}
      start={{ x: 0.13, y: 0 }}
      end={{ x: 0.87, y: 1 }}
      style={styles.root}
    >
      {/* Teal type on an ochre ground — the status bar has to flip with it. */}
      <StatusBar style="dark" />

      <Glow
        width={420}
        height={420}
        top={-90}
        left="center"
        tint={color.milestoneBloom}
        opacity={0.75}
        breathe
        period={7000}
      />

      {/* Runs up the outer edge, rotating about its own bottom-left corner so it
          clears the text column rather than crossing it. */}
      <View style={styles.railAnchor} pointerEvents="none">
        <Text style={styles.rail}>${value} avoided</Text>
      </View>

      <View
        style={[
          styles.content,
          { paddingTop: pad.top(topOffset.caption), paddingBottom: pad.bottom(bottomOffset.standard) },
        ]}
      >
        <View style={styles.brand}>
          <View style={styles.mark} />
          <Text style={styles.tag}>
            Milestone · {index + 1} of {MILESTONES.length}
          </Text>
        </View>

        <View style={styles.middle}>
          <Rise delay={0} scaleFrom={0.9}>
            <View style={styles.figure}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.amount}>{value}</Text>
            </View>
          </Rise>

          <Rise delay={100}>
            <Text style={styles.headline}>avoided since you started</Text>
          </Rise>

          <Rise delay={180}>
            <Text style={styles.tangible}>
              {value >= 250
                ? 'That is a month of groceries that stayed in your account instead of arriving in boxes.'
                : 'That is a whole weekend of takeout you decided you did not want after all.'}
            </Text>
          </Rise>

          <Rise delay={260}>
            <View style={styles.stats}>
              {[
                { value: String(pauses), key: 'pauses' },
                { value: '68%', key: 'closed' },
                { value: '9 days', key: 'streak' },
              ].map((stat) => (
                <View key={stat.key}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statKey}>{stat.key}</Text>
                </View>
              ))}
            </View>
          </Rise>
        </View>

        <View style={styles.actions}>
          <Button
            label="See the pattern behind it"
            onPress={() => router.replace('/insights')}
            fill={color.milestoneInk}
            labelStyle={styles.ctaLabel}
          />
          <Button
            label="Done"
            variant="outline"
            onPress={() => router.replace('/home')}
            borderColor={color.milestoneInkA35}
            labelStyle={styles.secondaryLabel}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  railAnchor: { position: 'absolute', left: 9, bottom: 120 },
  rail: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 12,
    letterSpacing: 0.42 * 12,
    textTransform: 'uppercase',
    opacity: 0.32,
    color: color.milestoneInk,
    // Rotating about the left-bottom corner keeps the rail on the outer edge.
    transform: [{ rotate: '-90deg' }],
    transformOrigin: 'left bottom',
  },
  content: { flex: 1, paddingHorizontal: 30 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 10, height: 10, borderRadius: 3, backgroundColor: color.milestoneInk },
  tag: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 11,
    letterSpacing: 0.16 * 11,
    textTransform: 'uppercase',
    color: color.milestoneInk,
  },

  middle: { flex: 1, justifyContent: 'center', paddingBottom: 16 },
  figure: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  currency: {
    fontFamily: type.title.fontFamily,
    fontSize: 52,
    lineHeight: 52,
    paddingTop: 20,
    color: color.milestoneInk,
  },
  amount: {
    fontFamily: type.title.fontFamily,
    fontSize: 132,
    lineHeight: 132 * 0.86,
    letterSpacing: -0.03 * 132,
    color: color.milestoneInk,
  },
  headline: {
    marginTop: 6,
    fontFamily: type.button.fontFamily,
    fontSize: 16,
    color: color.milestoneInk,
  },
  tangible: {
    marginTop: 22,
    maxWidth: 290,
    fontFamily: type.serifBody.fontFamily,
    fontSize: 25,
    lineHeight: 25 * 1.28,
    color: color.milestoneInk,
  },
  stats: { marginTop: 26, flexDirection: 'row', gap: 22 },
  statValue: {
    fontFamily: type.title.fontFamily,
    fontSize: 27,
    lineHeight: 27,
    color: color.milestoneInk,
  },
  statKey: {
    marginTop: 3,
    fontFamily: type.monoValue.fontFamily,
    fontSize: 10,
    letterSpacing: 0.1 * 10,
    textTransform: 'uppercase',
    opacity: 0.7,
    color: color.milestoneInk,
  },

  actions: { gap: 11 },
  ctaLabel: { color: color.milestoneCta },
  secondaryLabel: { color: color.milestoneInk, fontSize: 15 },
});
