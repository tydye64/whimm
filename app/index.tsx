import { Redirect } from 'expo-router';

import { useStore } from '../src/shield/store';

/**
 * Entry. A returning user lands on their total, not on the cold open.
 *
 * Nothing renders until the saved state has been read — a frame of the hero
 * screen before redirecting would be a worse first impression than a frame of
 * the ground colour.
 */
export default function Index() {
  const { hydrated, setupComplete } = useStore();

  if (!hydrated) return null;
  return <Redirect href={setupComplete ? '/home' : '/onboarding/hero'} />;
}
