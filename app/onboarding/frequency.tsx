/**
 * Screen 3 — how often an order slips through.
 *
 * The mono hint on the right ("18 / mo") shows the number each answer feeds
 * into the projection, so the payoff screen two steps later cannot feel like it
 * was invented. "A rough guess is plenty" is doing real work: precision here
 * would be false, and asking for it would make the screen feel like a form.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { StepHeader } from '../../src/components/Nav';
import { OptionRow } from '../../src/components/Options';
import { Screen } from '../../src/components/Screen';
import { FREQUENCIES } from '../../src/onboarding/model';
import { useFlow } from '../../src/onboarding/state';
import { color } from '../../src/theme/colors';
import { text as type } from '../../src/theme/type';

export default function Frequency() {
  const { answers, setFrequency, next, back } = useFlow();

  return (
    <Screen>
      <StepHeader onBack={back} step={1} />

      <View style={styles.intro}>
        <Text style={styles.title}>How often does an order slip through?</Text>
        <Text style={styles.sub}>A rough guess is plenty.</Text>
      </View>

      <View style={styles.list}>
        {FREQUENCIES.map((frequency) => (
          <OptionRow
            key={frequency.id}
            label={frequency.label}
            hint={frequency.hint}
            selected={answers.frequency === frequency.id}
            onPress={() => setFrequency(frequency.id)}
          />
        ))}
      </View>

      <Button label="Continue" ready={!!answers.frequency} onPress={() => next('frequency')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: 34 },
  title: { ...type.title, color: color.text },
  sub: { ...type.body, marginTop: 10, color: color.muted70 },
  list: { flex: 1, marginTop: 26, gap: 10 },
});
