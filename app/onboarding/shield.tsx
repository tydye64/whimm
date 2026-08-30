/**
 * Screen 10 — the practice run.
 *
 * The aha moment, and the reason the paywall converts: the mechanic is felt
 * before it is bought. A brief fake app launch, then the shield rises.
 *
 * The asymmetry is the whole point, and it is tuned softer than the apps that
 * inspired it. "Not now, put it back" is live immediately and is the ochre
 * button; "Continue anyway" stays a dim, inert label until the timer runs out
 * and then becomes fully available. Leaving is instant, continuing waits —
 * because this is money, and sometimes an errand really is urgent.
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Glow } from '../../src/components/Glow';
import { Screen } from '../../src/components/Screen';
import { useCountdown } from '../../src/hooks/useCountdown';
import { useFlow } from '../../src/onboarding/state';
import { PREVIEW_PAUSE_SECONDS } from '../../src/shield/model';
import { color } from '../../src/theme/colors';
import { bottomOffset, gutter, radius, topOffset } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

type Phase = 'launch' | 'shield' | 'resolved';
type Outcome = 'close' | 'open';

const LAUNCH_MS = 900;
const RESOLVE_MS = 1700;

export default function ShieldPreview() {
  const { next } = useFlow();
  const [phase, setPhase] = useState<Phase>('launch');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const { remaining, done } = useCountdown(PREVIEW_PAUSE_SECONDS, phase === 'shield');

  // The app "opens", then the shield takes the display.
  useEffect(() => {
    const timer = setTimeout(() => setPhase('shield'), LAUNCH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'resolved') return;
    const timer = setTimeout(() => next('shield'), RESOLVE_MS);
    return () => clearTimeout(timer);
  }, [phase, next]);

  const resolve = (choice: Outcome) => {
    if (choice === 'open' && !done) return;
    setOutcome(choice);
    setPhase('resolved');
  };

  if (phase === 'launch') {
    return (
      <Screen enter="fade" background={color.groundDeep} style={styles.centered}>
        <View style={styles.appIcon}>
          <Text style={styles.appIconText}>SHOP</Text>
        </View>
        <Text style={styles.launchNote}>Opening your shopping app…</Text>
      </Screen>
    );
  }

  if (phase === 'resolved') {
    return (
      <Screen enter="fade" background={color.groundDeep} style={styles.centered}>
        <Text style={styles.resolvedTitle}>
          {outcome === 'close' ? '$48 stayed where it was.' : "Opened — that's allowed."}
        </Text>
        <Text style={styles.resolvedBody}>
          {outcome === 'close'
            ? 'That’s your first entry. The total is the only scoreboard Threshold keeps.'
            : 'Some carts are errands. Threshold only asks that you meant it.'}
        </Text>
      </Screen>
    );
  }

  const progress = (PREVIEW_PAUSE_SECONDS - remaining) / PREVIEW_PAUSE_SECONDS;

  return (
    <Screen
      enter="rise"
      gutter={gutter.shield}
      top={topOffset.brand}
      bottom={bottomOffset.standard}
      background={color.groundShieldAlt}
      backdrop={<Glow width={520} height={400} top={-160} opacity={0.18} />}
    >
      <View style={styles.brand}>
        <View style={styles.mark} />
        <Text style={styles.brandText}>Threshold · practice run</Text>
      </View>

      <View style={styles.middle}>
        <Text style={styles.headline}>
          {done ? 'Still want it?' : 'Hold on. What are you here for?'}
        </Text>
        <Text style={styles.body}>
          {done
            ? 'The door is open either way. No lecture, no streak to break.'
            : "This is the screen you'll see. In the real thing there's a one-line answer box here — skip it if you're in a rush."}
        </Text>

        <View style={styles.meter}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <View style={styles.meterLabels}>
            <Text style={styles.meterLabel}>
              {done ? 'Pause complete' : `${remaining} seconds left`}
            </Text>
            <Text style={styles.meterLabel}>SHOP · $48 typical</Text>
          </View>
        </View>
      </View>

      <View style={styles.exits}>
        <Button
          label="Not now, put it back"
          variant="accent"
          onPress={() => resolve('close')}
        />
        {/* Stays mounted and in place the whole time — it dims rather than
            appearing, so nothing shifts under a thumb already reaching for it. */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !done }}
          onPress={() => resolve('open')}
          disabled={!done}
          style={[
            styles.continue,
            { borderColor: done ? color.borderContinue : color.border },
          ]}
        >
          <Text
            style={[
              styles.continueText,
              { color: done ? color.textQuieter : color.muted52 },
            ]}
          >
            {done ? 'Continue anyway' : `Continue in ${remaining}s`}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', gap: 14 },
  appIcon: {
    width: 68,
    height: 68,
    borderRadius: 17,
    backgroundColor: color.surfaceLaunch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 13,
    color: color.muted80,
  },
  launchNote: { fontFamily: type.ui.fontFamily, fontSize: 13, color: color.muted66 },

  resolvedTitle: {
    fontFamily: type.title.fontFamily,
    fontSize: 34,
    lineHeight: 34 * 1.15,
    textAlign: 'center',
    color: color.text,
  },
  resolvedBody: {
    marginTop: 12,
    maxWidth: 250,
    textAlign: 'center',
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: color.muted72,
  },

  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 9, height: 9, borderRadius: 3, backgroundColor: color.accentBright },
  brandText: { ...type.label, color: color.muted70 },

  middle: { flex: 1, justifyContent: 'center' },
  headline: {
    fontFamily: type.title.fontFamily,
    fontSize: 40,
    lineHeight: 40 * 1.06,
    color: color.text,
  },
  body: {
    marginTop: 16,
    maxWidth: 290,
    fontFamily: type.body.fontFamily,
    fontSize: 15.5,
    lineHeight: 15.5 * 1.5,
    color: color.muted76,
  },

  meter: { marginTop: 30 },
  track: {
    height: 2,
    borderRadius: 2,
    backgroundColor: color.borderMid,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: color.accentBright },
  meterLabels: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLabel: { ...type.labelTight, color: color.muted66 },

  exits: { gap: 11 },
  continue: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { fontFamily: type.ui.fontFamily, fontSize: 15.5 },
});
