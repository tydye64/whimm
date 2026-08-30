/**
 * Selectable things. Every one of them shares a single on/off treatment —
 * ochre wash at 16% behind an ochre border at 65%, versus a flat sunken teal —
 * so that selection reads the same whether it is an app category, a price
 * bracket or a one-tap chip on the capture screen.
 */
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { color, optionState } from '../theme/colors';
import { radius } from '../theme/layout';
import { text as type } from '../theme/type';

const useOption = (on: boolean) => (on ? optionState.on : optionState.off);

type Base = { selected: boolean; onPress: () => void; style?: ViewStyle };

/**
 * Two-up tile with a mono code chip above the label — the "which apps get you"
 * grid. The code stands in for a real Screen Time icon, which only Apple's own
 * picker is allowed to draw.
 */
export function CategoryTile({
  code,
  label,
  selected,
  onPress,
  style,
}: Base & { code: string; label: string }) {
  const t = useOption(selected);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.tile, { backgroundColor: t.bg, borderColor: t.border }, style]}
    >
      <View
        style={[
          styles.code,
          { backgroundColor: selected ? color.accent : color.surfaceTileAlt },
        ]}
      >
        <Text
          style={[
            styles.codeText,
            { color: selected ? color.groundShieldAlt : color.muted72 },
          ]}
        >
          {code}
        </Text>
      </View>
      <Text style={[styles.tileLabel, { color: t.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Full-width row with a mono hint on the right — the frequency question. */
export function OptionRow({
  label,
  hint,
  selected,
  onPress,
}: Base & { label: string; hint?: string }) {
  const t = useOption(selected);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.row, { backgroundColor: t.bg, borderColor: t.border }]}
    >
      <Text style={[styles.rowLabel, { color: t.text }]}>{label}</Text>
      {hint ? (
        <Text
          style={[
            styles.rowHint,
            { color: selected ? color.accentBright : color.muted60 },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** Serif-set money tile — the price brackets on both the regret and capture screens. */
export function AmountTile({
  label,
  selected,
  onPress,
  compact = false,
  style,
}: Base & { label: string; compact?: boolean }) {
  const t = useOption(selected);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        compact ? styles.amountCompact : styles.amount,
        { backgroundColor: t.bg, borderColor: t.border },
        style,
      ]}
    >
      <Text
        style={[
          compact ? styles.amountTextCompact : styles.amountText,
          { color: t.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Pill chip — "what was it" on the capture screen. */
export function Chip({ label, selected, onPress }: Base & { label: string }) {
  const t = useOption(selected);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: t.bg, borderColor: t.border }]}
    >
      <Text style={[styles.chipLabel, { color: t.text }]}>{label}</Text>
    </Pressable>
  );
}

/** The small ochre PRO tag. Never interactive — it states a fact, it does not sell. */
export function ProTag() {
  return (
    <View style={styles.pro}>
      <Text style={styles.proText}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 13,
    borderRadius: radius.tile,
    borderWidth: 1,
    gap: 11,
  },
  code: {
    width: 30,
    height: 30,
    borderRadius: radius.tileSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: { fontFamily: type.monoValue.fontFamily, fontSize: 11 },
  tileLabel: { fontFamily: type.ui.fontFamily, fontSize: 14.5, lineHeight: 14.5 * 1.25 },

  row: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { fontFamily: type.ui.fontFamily, fontSize: 16, flexShrink: 1 },
  rowHint: { fontFamily: type.monoValue.fontFamily, fontSize: 12 },

  amount: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
  },
  amountText: { fontFamily: type.title.fontFamily, fontSize: 22 },
  amountCompact: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  amountTextCompact: { fontFamily: type.title.fontFamily, fontSize: 20 },

  chip: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: radius.chip,
    borderWidth: 1,
  },
  chipLabel: { fontFamily: type.ui.fontFamily, fontSize: 14 },

  pro: {
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: color.accentA16,
  },
  proText: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 10,
    letterSpacing: 0.08 * 10,
    color: color.accentBright,
  },
});
