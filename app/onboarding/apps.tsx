/**
 * Screen 2 — which categories get you.
 *
 * Categories rather than named brands, because the real app list only ever
 * appears inside Apple's own FamilyActivityPicker; nothing here can legally or
 * technically show an Amazon or DoorDash icon. Two are pre-selected so the grid
 * is never a blank interrogation.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Grid } from '../../src/components/Grid';
import { StepHeader } from '../../src/components/Nav';
import { CategoryTile } from '../../src/components/Options';
import { Screen } from '../../src/components/Screen';
import { CATEGORIES } from '../../src/onboarding/model';
import { useFlow } from '../../src/onboarding/state';
import { color } from '../../src/theme/colors';
import { text as type } from '../../src/theme/type';

export default function Apps() {
  const { answers, toggleCategory, next, back } = useFlow();
  const chosen = answers.categories.length > 0;

  return (
    <Screen>
      <StepHeader onBack={back} step={0} />

      <View style={styles.intro}>
        <Text style={styles.title}>Which apps tend to get you?</Text>
        <Text style={styles.sub}>Pick as many as feel true.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <Grid columns={2} gap={10}>
          {CATEGORIES.map((category) => (
            <CategoryTile
              key={category.id}
              code={category.code}
              label={category.label}
              selected={answers.categories.includes(category.id)}
              onPress={() => toggleCategory(category.id)}
            />
          ))}
        </Grid>
      </ScrollView>

      <Button label="Continue" ready={chosen} onPress={() => next('apps')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: 34 },
  title: { ...type.title, color: color.text },
  sub: { ...type.body, marginTop: 10, color: color.muted70 },
  scroll: { flex: 1, marginTop: 24 },
  scrollBody: { paddingBottom: 8 },
});
