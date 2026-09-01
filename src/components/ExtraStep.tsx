/**
 * The Pro "extra step" — one more beat between the pause ending and the app
 * actually opening.
 *
 * Two forms, and the difference matters:
 *
 *  - **Breathe** interrupts the *body*. One slow inhale and exhale, roughly
 *    eight seconds, with nothing to read and nothing to decide. It works by
 *    putting a gap where the reflex lives.
 *  - **Type to confirm** interrupts the *intent*. Copying a short sentence is
 *    a deliberate act you cannot do absent-mindedly, which is the point.
 *
 * Neither is a punishment or a test, so neither can be failed — both are
 * skippable by simply closing instead, which stays instant throughout. The
 * phrase is a callback to the onboarding copy ("Whimm only asks that you meant
 * it"); it asks the user to say they meant it, not to admit to anything.
 *
 * There is no design for this screen — it was described in the brief but never
 * drawn — so it is composed from the shield's existing vocabulary: the same
 * card surface as the reflection question, the same ochre for state, the same
 * Instrument Serif for the thing being said.
 */
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { color } from '../theme/colors';
import { radius } from '../theme/layout';
import { text as type } from '../theme/type';

/** The sentence a type-to-confirm step asks for. */
export const CONFIRM_PHRASE = 'I meant to open this';

const INHALE_MS = 4000;
const EXHALE_MS = 4000;

type Props = {
  /** Called once the step is satisfied and Continue may proceed. */
  onSatisfied: () => void;
  /** True once satisfied — the step stays on screen and shows it resolved. */
  satisfied: boolean;
};

/**
 * One slow breath. The ring grows for four seconds, then shrinks for four,
 * and the step completes at the bottom of the exhale.
 */
export function BreatheStep({ onSatisfied, satisfied }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: INHALE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: EXHALE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && !cancelled) onSatisfied();
      });
      // Flip the label at the turn, independently of the driven animation.
      const turn = setTimeout(() => !cancelled && setPhase('out'), INHALE_MS);
      return () => clearTimeout(turn);
    };

    let cleanupTurn: (() => void) | undefined;

    // Reduced motion gets the same eight seconds of pause without the movement:
    // shortening it would quietly remove the step for those users.
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (cancelled) return;
        if (reduced) {
          scale.setValue(0.6);
          const turn = setTimeout(() => !cancelled && setPhase('out'), INHALE_MS);
          const done = setTimeout(
            () => !cancelled && onSatisfied(),
            INHALE_MS + EXHALE_MS,
          );
          cleanupTurn = () => {
            clearTimeout(turn);
            clearTimeout(done);
          };
        } else {
          cleanupTurn = run();
        }
      })
      .catch(() => {
        cleanupTurn = run();
      });

    return () => {
      cancelled = true;
      cleanupTurn?.();
      scale.stopAnimation();
    };
  }, [onSatisfied, scale]);

  return (
    <View style={styles.card}>
      <View style={styles.breathArea}>
        <Animated.View
          style={[
            styles.breathRing,
            {
              opacity: scale.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
              transform: [
                { scale: scale.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }) },
              ],
            },
          ]}
        />
        <Text style={styles.breathLabel} accessibilityLiveRegion="polite">
          {satisfied ? 'Done' : phase === 'in' ? 'Breathe in' : 'Breathe out'}
        </Text>
      </View>
      <Text style={styles.note}>
        {satisfied ? 'One breath taken. Continue is open.' : 'One breath, then the door opens.'}
      </Text>
    </View>
  );
}

/** Copy a short sentence. Matching is forgiving about case and spacing. */
export function TypeToConfirmStep({ onSatisfied, satisfied }: Props) {
  const [value, setValue] = useState('');

  const normalise = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  const matches = normalise(value) === normalise(CONFIRM_PHRASE);

  useEffect(() => {
    if (matches) onSatisfied();
  }, [matches, onSatisfied]);

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>Type this to continue</Text>
      <Text style={styles.phrase}>{CONFIRM_PHRASE}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={CONFIRM_PHRASE}
        placeholderTextColor={color.muted55}
        style={[styles.input, matches && styles.inputMatched]}
        autoCapitalize="sentences"
        autoCorrect={false}
        accessibilityLabel={`Type the phrase: ${CONFIRM_PHRASE}`}
      />
      <Text style={styles.note}>
        {matches ? 'That’s it — Continue is open.' : 'Close is still one tap, any time.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: radius.cardLg,
    backgroundColor: color.surfaceQuestion,
    borderWidth: 1,
    borderColor: color.borderMid,
  },

  breathArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  breathRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: color.accentA60,
    backgroundColor: color.accentA12,
  },
  breathLabel: {
    fontFamily: type.title.fontFamily,
    fontSize: 22,
    color: color.text,
  },

  prompt: { ...type.labelTight, color: color.muted66 },
  phrase: {
    marginTop: 8,
    fontFamily: type.title.fontFamily,
    fontSize: 21,
    color: color.text,
  },
  input: {
    marginTop: 12,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: color.borderStrong,
    fontFamily: type.ui.fontFamily,
    fontSize: 16,
    color: color.text,
  },
  inputMatched: { borderBottomColor: color.accentBright },

  note: {
    marginTop: 12,
    fontFamily: type.body.fontFamily,
    fontSize: 12,
    color: color.muted62,
  },
});
