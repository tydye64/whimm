/**
 * The header row shared by every screen that can be backed out of: a bare
 * arrow, then either the three-segment progress bar (the personalization
 * questions) or a mono "Setup n of 4" caption (the permission run).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color } from '../theme/colors';
import { text as type } from '../theme/type';

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={12}
      style={styles.back}
    >
      <Text style={styles.backGlyph}>←</Text>
    </Pressable>
  );
}

/** Three hairlines; filled ones are ochre, the rest sit at 34% lightness. */
export function StepBar({ step, count = 3 }: { step: number; count?: number }) {
  return (
    <View style={styles.steps}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.step,
            { backgroundColor: i <= step ? color.accent : color.surfaceStepOff },
          ]}
        />
      ))}
    </View>
  );
}

export function StepHeader({ onBack, step }: { onBack: () => void; step: number }) {
  return (
    <View style={styles.row}>
      <BackButton onPress={onBack} />
      <StepBar step={step} />
    </View>
  );
}

export function CaptionHeader({ onBack, caption }: { onBack?: () => void; caption: string }) {
  return (
    <View style={styles.row}>
      {onBack ? <BackButton onPress={onBack} /> : null}
      <Text style={[type.label, styles.caption]}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { width: 28, height: 28, justifyContent: 'center' },
  backGlyph: { fontFamily: type.ui.fontFamily, fontSize: 20, color: color.muted72 },
  steps: { flex: 1, flexDirection: 'row', gap: 5 },
  step: { flex: 1, height: 2, borderRadius: 2 },
  caption: { color: color.muted60 },
});
