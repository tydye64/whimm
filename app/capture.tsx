/**
 * Screen 14 — logging what went back.
 *
 * Only ever reached by choosing to close, so it opens from a position of
 * something having gone right. Three rules hold it together:
 *
 *  - **Skip is top-right and reachable from the first frame.** The pause
 *    already counted; this screen is a bonus, and it has to behave like one.
 *  - **The amount alone is enough.** Category is optional, so the fastest path
 *    through is a single tap plus save.
 *  - **No free-text, no keyboard.** Two rows of chips. Anything that takes
 *    longer than the pause itself would make closing more expensive than
 *    continuing, which would invert the whole mechanic.
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../src/components/Button';
import { Chip, AmountTile } from '../src/components/Options';
import { Grid } from '../src/components/Grid';
import { Screen } from '../src/components/Screen';
import { useStore } from '../src/shield/store';
import { color } from '../src/theme/colors';
import { gutter } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

/**
 * Each category carries its own closing phrase. A template string ("that's one
 * less clothes") reads as machine output; these read as someone noticing.
 */
export const KINDS = [
  { id: 'clothes', label: 'Clothes', phrase: "clothes that aren't arriving in a bag you'd forget about" },
  { id: 'gadget', label: 'Gadget', phrase: "a gadget that isn't showing up at your door" },
  { id: 'home', label: 'Home stuff', phrase: 'one less thing to find a place for' },
  { id: 'food', label: 'Takeout', phrase: "a dinner you'll make instead" },
  { id: 'other', label: 'Something else', phrase: 'one fewer box on the doorstep this week' },
];

export const SUMS = [
  { id: 's1', label: '$15', value: 15 },
  { id: 's2', label: '$30', value: 30 },
  { id: 's3', label: '$60', value: 60 },
  { id: 's4', label: '$120', value: 120 },
];

export default function Capture() {
  const router = useRouter();
  const { logAvoided } = useStore();
  const { waited } = useLocalSearchParams<{ waited?: string }>();
  const [kind, setKind] = useState<string | null>(null);
  const [sum, setSum] = useState<string | null>(null);

  const picked = SUMS.find((s) => s.id === sum);

  const save = () => {
    if (!picked) return;
    const seconds = Number(waited ?? 0);
    const crossed = logAvoided(
      picked.value,
      seconds > 0 ? `Closed after ${seconds} second${seconds === 1 ? '' : 's'}` : 'Closed',
    );
    // Most saves land on the quiet confirmation. The loud screen fires only on
    // a genuine crossing, which is what keeps it meaning anything.
    router.replace(
      crossed
        ? { pathname: '/milestone', params: { amount: String(crossed) } }
        : { pathname: '/saved', params: { kind: kind ?? '', amount: String(picked.value) } },
    );
  };

  return (
    <Screen gutter={gutter.wide}>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>Closed · nothing bought</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/home')} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Want to log what you put back?</Text>
      <Text style={styles.sub}>Two taps, or skip it — the pause counted either way.</Text>

      <View style={styles.section}>
        <Text style={styles.label}>What was it</Text>
        <View style={styles.chips}>
          {KINDS.map((k) => (
            <Chip
              key={k.id}
              label={k.label}
              selected={kind === k.id}
              onPress={() => setKind(kind === k.id ? null : k.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.amounts}>
        <Text style={styles.label}>Roughly how much</Text>
        <Grid columns={4} gap={8} style={styles.amountGrid}>
          {SUMS.map((s) => (
            <AmountTile
              key={s.id}
              label={s.label}
              compact
              selected={sum === s.id}
              onPress={() => setSum(s.id)}
            />
          ))}
        </Grid>
      </View>

      <Button
        label={picked ? `Log $${picked.value} avoided` : 'Pick an amount'}
        variant="accent"
        ready={!!picked}
        onPress={save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { ...type.label, color: color.muted66 },
  skip: { fontFamily: type.ui.fontFamily, fontSize: 14.5, color: color.muted72 },
  title: {
    marginTop: 22,
    fontFamily: type.title.fontFamily,
    fontSize: 33,
    lineHeight: 33 * 1.1,
    color: color.text,
  },
  sub: { ...type.body, marginTop: 9, maxWidth: 300, color: color.muted70 },
  section: { marginTop: 26 },
  label: { ...type.labelTight, color: color.muted60 },
  chips: { marginTop: 11, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amounts: { marginTop: 26, flex: 1 },
  amountGrid: { marginTop: 11 },
});
