/**
 * Screen 13 — the shield.
 *
 * This is the mechanic. Four things are load-bearing and should survive any
 * redesign of this screen:
 *
 * 1. **The exits are visually equal in size and weight**, side by side.
 *    Continue is not hidden, shrunk, greyed permanently, or moved. The app is a
 *    pause, not a lock, and a trapped user is a uninstalled app. (Their fills
 *    now differ — Close is the ochre-primary action, Continue an outline — but
 *    that is a color statement, not a size or prominence one; neither shrinks
 *    or hides relative to the other.)
 * 2. **Only time separates them.** Close works immediately; Continue reads
 *    "Continue in 7s" and is inert until the ring fills, then becomes identical
 *    in weight to Close. That asymmetry is the entire friction budget — softer
 *    than a hard block, because sometimes an errand really is urgent.
 * 3. **The reflection answer stays visible.** Once committed it collapses into
 *    a small "You came for —" note that remains on screen through the decision.
 *    That persistence is what makes answering worth the effort; an input that
 *    vanishes is a survey, not a prompt.
 * 4. **The footer never accuses.** The running total and pause count sit in
 *    quiet mono. Present, never a scoreboard being waved at anyone.
 *
 * Visual pass from `Whimm Shield Screen.dc.html`: the header drops the
 * app-being-shielded pill in favor of a bare wordmark, and Close becomes the
 * filled ochre action with Continue as its outline counterpart — a reversal
 * of the old restrained-dark-buttons treatment, now that Close (not Continue)
 * is the one this screen wants to make easy. That file is a single static
 * frame with no ring, no reflection card, and no footer; per direction, all
 * three stay — there was no ring layout to carry over, so the ring keeps its
 * existing side-by-side position and type scale.
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
import { BreatheStep, TypeToConfirmStep } from '../src/components/ExtraStep';
import { Glow } from '../src/components/Glow';
import { Screen } from '../src/components/Screen';
import { useCountdown } from '../src/hooks/useCountdown';
import { useStore } from '../src/shield/store';
import { color } from '../src/theme/colors';
import { bottomOffset, gutter, radius, topOffset } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

export default function Shield() {
  const router = useRouter();
  const { settings, totalAvoided, pauses, pro, logContinued, recordAttempt } =
    useStore();
  // `re` is the mid-session re-shield, which reads differently: it is checking
  // back on a session already underway rather than intercepting a launch.
  const { mode } = useLocalSearchParams<{ mode?: 'first' | 're' }>();
  const isReshield = mode === 're';

  const length = settings.pauseSeconds;
  const { remaining, done } = useCountdown(length);

  // The attempt is what resets "days since last try", so it is recorded on
  // arrival rather than on either exit — both outcomes are still an attempt.
  useEffect(() => {
    recordAttempt();
  }, [recordAttempt]);

  // The Pro extra step, if any, sits between the pause ending and Continue
  // working. `none` leaves the original behaviour untouched.
  const extraStep = pro && settings.extraStep !== 'none' ? settings.extraStep : 'none';
  const [extraStarted, setExtraStarted] = useState(false);
  const [extraSatisfied, setExtraSatisfied] = useState(false);

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
    // First tap after the ring fills starts the extra step rather than opening
    // the app; the second (once satisfied) goes through.
    if (extraStep !== 'none' && !extraSatisfied) {
      setExtraStarted(true);
      return;
    }
    logContinued();
    router.replace('/session');
  };

  const progress = (length - remaining) / length;
  const showExtra = extraStarted;
  // The extra step takes over the middle of the screen while it runs.
  const showQuestion = asking && !committed && !showExtra;
  const showEcho = committed && intent.trim().length > 0 && !showExtra;

  return (
    <Screen
      enter="rise"
      gutter={gutter.shield}
      top={topOffset.brand}
      bottom={bottomOffset.tight}
      background={color.groundShield}
      backdrop={<Glow width={520} height={400} top={-160} opacity={0.18} breathe period={8000} />}
    >
      {/* Just the wordmark now — the new design drops the app-being-shielded
          pill from the header entirely. */}
      <View style={styles.head}>
        <View style={styles.mark} />
        <Text style={styles.brandText}>Whimm</Text>
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
                  : 'Hold on. What are you here for?'}
            </Text>
            <Text style={styles.headlineSub}>
              {isReshield
                ? 'Pro re-shield, set for 5 minutes of continuous use.'
                : done
                  ? 'Both doors are open. Pick the one you meant.'
                  : `${length} seconds, then Shop opens if you still want it.`}
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

        {showExtra && extraStep === 'breathe' ? (
          <BreatheStep
            satisfied={extraSatisfied}
            onSatisfied={() => setExtraSatisfied(true)}
          />
        ) : null}
        {showExtra && extraStep === 'type' ? (
          <TypeToConfirmStep
            satisfied={extraSatisfied}
            onSatisfied={() => setExtraSatisfied(true)}
          />
        ) : null}
      </View>

      <View>
        <View style={styles.exits}>
          {/* Close is now the filled ochre action — the design's inversion of
              the old restrained-dark treatment, since this is the exit the
              screen wants to make easy. */}
          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={({ pressed }) => [
              styles.exit,
              styles.closeExit,
              pressed && { opacity: 0.92, transform: [{ translateY: 1 }] },
            ]}
          >
            <Text style={styles.closeLabel}>Close app</Text>
          </Pressable>

          {/* Continue is an outline throughout — dim and inert before the ring
              fills, then matches the new design's border/text exactly. */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !done }}
            onPress={proceed}
            disabled={!done}
            style={[
              styles.exit,
              styles.continueExit,
              { borderColor: done ? color.borderButton : color.border },
            ]}
          >
            <Text
              style={[
                styles.exitLabel,
                { color: done ? color.text : color.muted52 },
              ]}
            >
              {!done
                ? `Continue in ${remaining}s`
                : extraStep !== 'none' && !extraSatisfied
                  ? extraStep === 'breathe'
                    ? 'Take a breath'
                    : 'Type to continue'
                  : isReshield
                    ? 'Keep going'
                    : 'Continue'}
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
  head: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 9, height: 9, borderRadius: 3, backgroundColor: color.accentBright },
  brandText: { ...type.label, color: color.muted70 },

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
  closeExit: { borderColor: color.accentBright, backgroundColor: color.accentBright },
  closeLabel: { fontFamily: type.button.fontFamily, fontSize: 16, color: color.groundDeep },
  continueExit: { backgroundColor: 'transparent' },
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
