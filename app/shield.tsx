/**
 * Screen 13 — the shield.
 *
 * This is the mechanic. Four things are load-bearing and should survive any
 * redesign of this screen:
 *
 * 1. **The exits are visually equal.** Same size, same weight, side by side.
 *    Continue is not hidden, shrunk, greyed permanently, or moved. The app is a
 *    pause, not a lock, and a trapped user is a uninstalled app.
 * 2. **Only time separates them.** Close works immediately; Continue reads
 *    "Continue in 7s" and is inert until the ring fills, then becomes identical
 *    to Close. That asymmetry is the entire friction budget — softer than a
 *    hard block, because sometimes an errand really is urgent.
 * 3. **The reflection answer stays visible.** Once committed it collapses into
 *    a small "You came for —" note that remains on screen through the decision.
 *    That persistence is what makes answering worth the effort; an input that
 *    vanishes is a survey, not a prompt.
 * 4. **The footer never accuses.** The running total and pause count sit in
 *    quiet mono. Present, never a scoreboard being waved at anyone.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CountdownRing } from '../src/components/CountdownRing';
import { Glow } from '../src/components/Glow';
import { Screen } from '../src/components/Screen';
import { useCountdown } from '../src/hooks/useCountdown';
import { useStore } from '../src/shield/store';
import { color } from '../src/theme/colors';
import { bottomOffset, gutter, radius, topOffset } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

export default function Shield() {
  const router = useRouter();
  const { settings, totalAvoided, pauses, logContinued } = useStore();
  // `re` is the mid-session re-shield, which reads differently: it is checking
  // back on a session already underway rather than intercepting a launch.
  const { mode } = useLocalSearchParams<{ mode?: 'first' | 're' }>();
  const isReshield = mode === 're';

  const length = settings.pauseSeconds;
  const { remaining, done } = useCountdown(length);

  const [asking, setAsking] = useState(settings.reflection && !isReshield);
  const [intent, setIntent] = useState('');
  const [committed, setCommitted] = useState(false);
  const intentRef = useRef('');
  intentRef.current = intent;

  // If they typed something but never explicitly committed it, commit on the
  // pause ending rather than discarding it — the answer was still given.
  useEffect(() => {
    if (done && intentRef.current.trim()) setCommitted(true);
  }, [done]);

  const commit = useCallback(() => {
    if (intentRef.current.trim()) {
      setCommitted(true);
      Keyboard.dismiss();
    }
  }, []);

  const close = () =>
    // How long they actually waited, so the history row can say "Closed after
    // 4 seconds" rather than a flat "Closed".
    router.replace({
      pathname: '/capture',
      params: { waited: String(length - remaining) },
    });
  const proceed = () => {
    if (!done) return;
    logContinued();
    router.replace('/session');
  };

  const progress = (length - remaining) / length;
  const showQuestion = asking && !committed;
  const showEcho = committed && intent.trim().length > 0;

  return (
    <Screen
      enter="rise"
      gutter={gutter.shield}
      top={topOffset.brand}
      bottom={bottomOffset.tight}
      background={color.groundShield}
      backdrop={<Glow width={540} height={420} top={-170} opacity={0.2} breathe period={8000} />}
    >
      <View style={styles.head}>
        <View style={styles.brand}>
          <View style={styles.mark} />
          <Text style={styles.brandText}>
            {isReshield ? 'Threshold · re-shield' : 'Threshold · pause'}
          </Text>
        </View>
        {/* Names what is being intercepted, so the shield is never ambiguous. */}
        <View style={styles.appPill}>
          <View style={styles.appTile}>
            <Text style={styles.appTileText}>SH</Text>
          </View>
          <Text style={styles.appName}>Shop</Text>
        </View>
      </View>

      <View style={styles.middle}>
        <View style={styles.ringRow}>
          <CountdownRing progress={progress} remaining={remaining} />
          <View style={styles.headline}>
            <Text style={styles.headlineText}>
              {isReshield
                ? done
                  ? 'Still worth it?'
                  : "You've been in here a while."
                : done
                  ? 'Your call.'
                  : `${length} seconds, then it's yours.`}
            </Text>
            <Text style={styles.headlineSub}>
              {isReshield
                ? 'Pro re-shield, set for 5 minutes of continuous use.'
                : done
                  ? 'Both doors are open. Pick the one you meant.'
                  : 'Shop opens the moment the ring fills, if you still want it.'}
            </Text>
          </View>
        </View>

        {showQuestion ? (
          <View style={styles.question}>
            <View style={styles.questionHead}>
              <Text style={styles.questionPrompt}>What are you here for?</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAsking(false)}
                hitSlop={8}
              >
                <Text style={styles.skip}>Skip</Text>
              </Pressable>
            </View>
            {/* Stays mounted while typing; only an explicit commit — Done,
                return, blur, or the pause ending — collapses it. */}
            <TextInput
              value={intent}
              onChangeText={setIntent}
              onSubmitEditing={commit}
              onBlur={commit}
              placeholder="a phone charger, actually"
              placeholderTextColor={color.muted55}
              style={styles.input}
              returnKeyType="done"
            />
            <View style={styles.questionFoot}>
              <Text style={styles.questionNote}>Optional. Nobody reads it but you.</Text>
              {intent.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={commit}
                  style={styles.done}
                >
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {showEcho ? (
          <View style={styles.echo}>
            <Text style={styles.echoLabel}>You came for</Text>
            <Text style={styles.echoText}>{intent}</Text>
          </View>
        ) : null}
      </View>

      <View>
        <View style={styles.exits}>
          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={({ pressed }) => [
              styles.exit,
              styles.closeExit,
              pressed && { backgroundColor: color.surfaceIconAlt },
            ]}
          >
            <Text style={styles.exitLabel}>Close app</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !done }}
            onPress={proceed}
            disabled={!done}
            style={[
              styles.exit,
              {
                backgroundColor: done ? color.surfaceContinueOn : color.surfaceContinueOff,
                borderColor: done ? color.borderButton : color.border,
              },
            ]}
          >
            <Text
              style={[
                styles.exitLabel,
                { color: done ? color.text : color.muted55 },
              ]}
            >
              {done ? (isReshield ? 'Keep going' : 'Continue') : `Continue in ${remaining}s`}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>${totalAvoided.toLocaleString()} avoided</Text>
          <Text style={styles.footerText}>{pauses} pauses this month</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 9, height: 9, borderRadius: 3, backgroundColor: color.accentBright },
  brandText: { ...type.label, color: color.muted72 },
  appPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 7,
    paddingRight: 10,
    borderRadius: radius.chip,
    backgroundColor: color.surfacePill,
  },
  appTile: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: color.borderPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTileText: { fontFamily: type.monoValue.fontFamily, fontSize: 7.5, color: color.muted86 },
  appName: { fontFamily: type.ui.fontFamily, fontSize: 12, color: color.muted84 },

  middle: { flex: 1, justifyContent: 'center', gap: 26 },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  headline: { flex: 1 },
  headlineText: {
    fontFamily: type.title.fontFamily,
    fontSize: 31,
    lineHeight: 31 * 1.08,
    color: color.text,
  },
  headlineSub: {
    marginTop: 8,
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    lineHeight: 14 * 1.45,
    color: color.muted72,
  },

  question: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderRadius: radius.cardLg,
    backgroundColor: color.surfaceQuestion,
    borderWidth: 1,
    borderColor: color.borderMid,
  },
  questionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  questionPrompt: { fontFamily: type.ui.fontFamily, fontSize: 15, color: color.textBodySoft },
  skip: { fontFamily: type.ui.fontFamily, fontSize: 12.5, color: color.muted66 },
  input: {
    marginTop: 12,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: color.borderStrong,
    fontFamily: type.title.fontFamily,
    fontSize: 18,
    color: color.text,
  },
  questionFoot: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  questionNote: {
    fontFamily: type.body.fontFamily,
    fontSize: 12,
    color: color.muted62,
  },
  done: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: color.accentA50,
  },
  doneText: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 11.5,
    color: color.accentHi,
  },

  echo: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: radius.cardLg,
    backgroundColor: color.accentA12,
    borderWidth: 1,
    borderColor: color.accentA40,
  },
  echoLabel: { ...type.labelTight, color: color.accentBright },
  echoText: {
    marginTop: 6,
    fontFamily: type.title.fontFamily,
    fontSize: 21,
    color: color.text,
  },

  exits: { flexDirection: 'row', gap: 10 },
  exit: {
    flex: 1,
    paddingVertical: 19,
    paddingHorizontal: 10,
    borderRadius: radius.exit,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeExit: { borderColor: color.borderButton, backgroundColor: color.surfaceHover },
  exitLabel: { fontFamily: type.button.fontFamily, fontSize: 16, color: color.text },

  footer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: type.mono.fontFamily,
    fontSize: 11.5,
    letterSpacing: 0.06 * 11.5,
    textTransform: 'uppercase',
    color: color.muted62,
  },
});
