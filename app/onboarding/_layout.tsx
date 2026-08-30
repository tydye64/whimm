import { Stack } from 'expo-router';

import { color } from '../../src/theme/colors';
import { OnboardingProvider } from '../../src/onboarding/state';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.ground },
          animation: 'none',
        }}
      />
    </OnboardingProvider>
  );
}
