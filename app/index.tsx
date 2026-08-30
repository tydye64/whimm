import { Redirect } from 'expo-router';

/**
 * Pass 3 replaces this with a check for whether setup has completed — a
 * returning user lands on the home screen, not the cold open.
 */
export default function Index() {
  return <Redirect href="/onboarding/hero" />;
}
