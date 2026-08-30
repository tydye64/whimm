/**
 * Buttons.
 *
 * Three fills, and which one a screen uses is a statement about the flow:
 *   `bone`   — the neutral way forward. Almost every onboarding screen.
 *   `accent` — reserved. The payoff CTA, the paywall CTA, "put it back" on the
 *              shield, and the save on the capture screen. Nothing else.
 *   `outline`/`text` — the way out, never hidden and never shrunk.
 *
 * The prototype gates an unanswered screen by dropping the CTA to 35% opacity
 * while leaving it mounted and tappable-but-inert. That is kept: a disabled
 * button that vanishes or moves is worse than one that simply does not fire.
 */
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { color } from '../theme/colors';
import { radius } from '../theme/layout';
import { text as type } from '../theme/type';

type Variant = 'bone' | 'accent' | 'outline' | 'text';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** False dims to 35% and stops the press from firing. */
  ready?: boolean;
  /** Fully inert and dimmed further — the locked Continue on the shield. */
  disabled?: boolean;
  /**
   * `compact` is the 15px/r14 button used where a CTA sits inside a card or
   * beside system UI rather than anchoring the screen.
   */
  size?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
};

const FILL: Record<Variant, ViewStyle> = {
  bone: { backgroundColor: color.text, paddingVertical: 19 },
  accent: { backgroundColor: color.accentBright, paddingVertical: 19 },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: color.borderStrong,
    paddingVertical: 17,
  },
  text: { backgroundColor: 'transparent', paddingVertical: 2 },
};

const LABEL: Record<Variant, TextStyle> = {
  bone: { ...type.button, color: color.ground },
  accent: { ...type.button, color: color.groundDeep },
  outline: { fontFamily: type.ui.fontFamily, fontSize: 15.5, color: color.textQuieter },
  text: { fontFamily: type.ui.fontFamily, fontSize: 14, color: color.muted62 },
};

export function Button({
  label,
  onPress,
  variant = 'bone',
  ready = true,
  disabled = false,
  size = 'default',
  style,
  labelStyle,
}: Props) {
  const inert = disabled || !ready;
  const compact = size === 'compact';
  return (
    <View style={[{ opacity: ready ? 1 : 0.35 }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: inert }}
        onPress={inert ? undefined : onPress}
        style={({ pressed }) => [
          styles.base,
          FILL[variant],
          compact && styles.compact,
          // hover lifts 1px, active presses 1px down; touch only gets the press.
          pressed && !inert && { opacity: 0.9, transform: [{ translateY: 1 }] },
        ]}
      >
        <Text style={[LABEL[variant], compact && styles.compactLabel, labelStyle]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { paddingVertical: 15, borderRadius: 14 },
  compactLabel: { fontSize: 15 },
});
