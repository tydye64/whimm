import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { color } from '../src/theme/colors';
import {
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  GeistMono_400Regular,
  GeistMono_500Medium,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '../src/theme/type';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden — not worth failing boot over */
});

export default function RootLayout() {
  const [ready, error] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Geist_300Light,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
  });

  useEffect(() => {
    // Hide on error too: falling back to system faces beats a stuck splash.
    if (ready || error) SplashScreen.hideAsync().catch(() => {});
  }, [ready, error]);

  if (!ready && !error) return null;

  return (
    <SafeAreaProvider>
      {/* The app is dark end to end, so the status bar is light everywhere
          except the milestone screen, which flips it in place. */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.ground },
          // Screens carry their own entrance animation, matching the prototype.
          animation: 'none',
          gestureEnabled: true,
        }}
      />
    </SafeAreaProvider>
  );
}
