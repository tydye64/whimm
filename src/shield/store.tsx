/**
 * Everything the app remembers.
 *
 * The running total, the pause history, and the friction settings all live
 * here. Nothing in this store leaves the device — that is a promise the trust
 * screen makes in plain language during onboarding, and it constrains what this
 * file is allowed to become. There is no sync, no account, and no analytics
 * hook: if a future feature needs one, it needs a design conversation first,
 * not an import.
 *
 * Pass 3 adds persistence behind the same interface.
 */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { DEFAULT_PAUSE_SECONDS } from './model';

/** Thresholds that earn the milestone screen. */
export const MILESTONES = [50, 100, 200, 250, 500, 1000];

export type ExtraStep = 'none' | 'breathe' | 'type';

export type MonitoredApp = { code: string; label: string };

export type ShieldEvent = {
  id: string;
  app: string;
  label: string;
  when: string;
  /** Dollars kept, or null when they continued through. */
  saved: number | null;
};

/**
 * Seeded with the prototype's demo history so the return screens have
 * something honest-looking to show. Pass 3 starts a real install at zero.
 */
const SEED_HISTORY: ShieldEvent[] = [
  { id: 'h1', app: 'SHOP', label: 'Closed after 10 seconds', when: 'Yesterday, 10:42pm', saved: 60 },
  { id: 'h2', app: 'FOOD', label: 'Continued through', when: 'Yesterday, 7:15pm', saved: null },
  { id: 'h3', app: 'SHOP', label: 'Closed after 4 seconds', when: 'Sunday, 11:08pm', saved: 30 },
  { id: 'h4', app: 'SHOP', label: 'Continued through', when: 'Sunday, 9:51pm', saved: null },
  { id: 'h5', app: 'FOOD', label: 'Closed after 10 seconds', when: 'Saturday, 8:30pm', saved: 25 },
  { id: 'h6', app: 'SHOP', label: 'Closed after 22 seconds', when: 'Friday, 1:12pm', saved: 15 },
];

type Settings = {
  pauseSeconds: number;
  extraStep: ExtraStep;
  reshieldOn: boolean;
  monitoredApps: MonitoredApp[];
  /** Whether the reflection question appears on the shield. */
  reflection: boolean;
};

type Store = {
  totalAvoided: number;
  pauses: number;
  streak: number;
  history: ShieldEvent[];
  settings: Settings;
  pro: boolean;
  setPro: (pro: boolean) => void;
  update: (patch: Partial<Settings>) => void;
  /**
   * Records a closed shield. Returns the milestone crossed, if any, so the
   * caller knows whether this save has earned the loud screen.
   */
  logAvoided: (amount: number, label?: string) => number | null;
  /** Records a shield the user continued through. Never framed as a failure. */
  logContinued: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function ShieldStoreProvider({ children }: { children: ReactNode }) {
  const [totalAvoided, setTotal] = useState(168);
  const [pauses, setPauses] = useState(12);
  const [history, setHistory] = useState<ShieldEvent[]>(SEED_HISTORY);
  const [pro, setPro] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    pauseSeconds: DEFAULT_PAUSE_SECONDS,
    extraStep: 'none',
    reshieldOn: true,
    monitoredApps: [{ code: 'SHOP', label: 'Shop' }],
    reflection: true,
  });

  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );

  const logAvoided = useCallback<Store['logAvoided']>(
    (amount, label) => {
      const from = totalAvoided;
      const to = from + amount;
      // The highest threshold this save passes — logging $120 over a $168
      // total crosses $200 but not $250, and only $200 is celebrated.
      // Computed from the committed total rather than inside a state updater,
      // so it is actually available to return.
      const crossed = MILESTONES.filter((m) => m > from && m <= to).pop() ?? null;

      setTotal(to);
      setPauses((n) => n + 1);
      setHistory((h) => [
        {
          id: `e${Date.now()}`,
          app: 'SHOP',
          label: label ?? 'Closed',
          when: 'Just now',
          saved: amount,
        },
        ...h,
      ]);

      return crossed;
    },
    [totalAvoided],
  );

  const logContinued = useCallback(() => {
    setHistory((h) => [
      { id: `e${Date.now()}`, app: 'SHOP', label: 'Continued through', when: 'Just now', saved: null },
      ...h,
    ]);
  }, []);

  const value = useMemo<Store>(
    () => ({
      totalAvoided,
      pauses,
      streak: 9,
      history,
      settings,
      pro,
      setPro,
      update,
      logAvoided,
      logContinued,
    }),
    [totalAvoided, pauses, history, settings, pro, update, logAvoided, logContinued],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <ShieldStoreProvider>');
  return store;
}
