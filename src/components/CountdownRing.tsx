/**
 * The pause ring.
 *
 * The prototype draws this as a `conic-gradient` with a smaller circle punched
 * out of the middle. React Native has no conic gradient, and faking one would
 * mean a stack of masked images; a stroked SVG arc is both exact and cheaper.
 * Rotated -90° so the arc starts at twelve o'clock, and rounded off at the
 * ends — a hard square cap on a countdown reads as a progress bar bent into a
 * circle, which is not the same object.
 *
 * The arc grows rather than drains. Watching something fill is a different
 * feeling from watching something run out, and this screen is asking for
 * patience, not warning about a deadline.
 */
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { color } from '../theme/colors';
import { text as type } from '../theme/type';

const SIZE = 106;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
  /** 0 → 1, how much of the pause has elapsed. */
  progress: number;
  /** Seconds remaining, shown in the middle. */
  remaining: number;
};

export function CountdownRing({ progress, remaining }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={styles.root}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      accessibilityLabel={
        remaining > 0 ? `${remaining} seconds left in your pause` : 'Pause complete'
      }
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color.ruleCard}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color.accentBright}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          // Start at twelve o'clock instead of three.
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <Text style={styles.count}>{remaining}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: type.title.fontFamily,
    fontSize: 38,
    color: color.text,
  },
});
