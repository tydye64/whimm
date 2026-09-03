/**
 * Screen 4 — one purchase you'd take back.
 *
 * The free-text field is optional and unlabelled-by-obligation: whatever they
 * type is folded into the payoff line ("and one less standing desk"), which is
 * the only reason to ask for it. "Only you see this" is literally true — it
 * never leaves the device, and pass 3 keeps it that way.
 */
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Grid } from '../../src/components/Grid';
import { StepHeader } from '../../src/components/Nav';
import { AmountTile } from '../../src/components/Options';
import { Screen } from '../../src/components/Screen';
import { AMOUNTS } from '../../src/onboarding/model';
import { useFlow } from '../../src/onboarding/state';
import { color } from '../../src/theme/colors';
import { text as type } from '../../src/theme/type';

export default function Regret() {
  const { answers, setAmount, setItem, next, back } = useFlow();

  return (
    <Screen>
      <StepHeader onBack={back} step={2} />

      <View style={styles.intro}>
        <Text style={styles.title}>Think of one you'd take back.</Text>
        <Text style={styles.sub}>Only you see this. It sets your starting number.</Text>
      </View>

      <View style={styles.field}>
        <TextInput
          value={answers.item}
          onChangeText={setItem}
          placeholder="the thing itself, if you want"
          placeholderTextColor={color.muted55}
          style={styles.input}
          returnKeyType="done"
          autoCorrect={false}
        />
      </View>

      <View style={styles.amounts}>
        <Text style={styles.label}>About what did it cost?</Text>
        <Grid columns={2} gap={10} style={styles.grid}>
          {AMOUNTS.map((amount) => (
            <AmountTile
              key={amount.id}
              label={amount.label}
              selected={answers.amount === amount.id}
              onPress={() => setAmount(amount.id)}
            />
          ))}
        </Grid>
      </View>

      <Button label="See my number" ready={!!answers.amount} onPress={() => next('regret')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: 34 },
  title: { ...type.title, color: color.text },
  sub: { ...type.body, marginTop: 10, color: color.muted70 },
  field: {
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: color.borderStrong,
    paddingBottom: 10,
  },
  input: {
    fontFamily: type.title.fontFamily,
    fontSize: 19,
    color: color.text,
    padding: 0,
  },
  amounts: { flex: 1, marginTop: 30 },
  label: { ...type.labelTight, color: color.muted62 },
  grid: { marginTop: 14 },
});
