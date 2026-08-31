/**
 * On-device persistence.
 *
 * The trust screen promises, in plain language, that the amounts stay on this
 * phone. That makes AsyncStorage the whole storage layer — no sync, no remote
 * backup, no account. If that ever changes, the trust screen has to change
 * first, not after.
 *
 * Writes are fire-and-forget and failures are swallowed: losing a pause from
 * the history is a far smaller harm than throwing inside the shield, which is
 * the one screen that must never fail to render.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ShieldEvent } from './store';

const KEY = 'whimm.state.v1';

export type Persisted = {
  totalAvoided: number;
  pauses: number;
  history: ShieldEvent[];
  settings: {
    pauseSeconds: number;
    extraStep: string;
    reshieldOn: boolean;
    reflection: boolean;
    monitoredApps: { code: string; label: string }[];
  };
  pro: boolean;
  /** Set once setup completes, so returning users skip onboarding. */
  setupComplete: boolean;
};

export async function load(): Promise<Partial<Persisted> | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<Persisted>) : null;
  } catch {
    return null;
  }
}

export function save(state: Partial<Persisted>): void {
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {
    // See above: a dropped write must not surface as a crash.
  });
}

export async function clear(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Nothing useful to do; the caller is already tearing state down.
  }
}
