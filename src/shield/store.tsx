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
 * Persisted to AsyncStorage and nowhere else — see ./persistence.
 */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { screenTime } from '../screentime';
import { DEFAULT_PAUSE_SECONDS, RESHIELD_AFTER_SECONDS } from './model';
import { load, save } from './persistence';

/** Thresholds that earn the milestone screen. */
export const MILESTONES = [50, 100, 200, 250, 500, 1000];

const DAY_MS = 24 * 60 * 60 * 1000;

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
  /**
   * Whole days since the last time a monitored app was opened — null when it
   * has never happened. Counts from the *attempt*, not the outcome, so closing
   * the shield resets it just as continuing through does. It measures how long
   * the urge has stayed away rather than how well the user resisted it.
   */
  daysSinceLastAttempt: number | null;
  history: ShieldEvent[];
  settings: Settings;
  pro: boolean;
  setPro: (pro: boolean) => void;
  /** False until onboarding finishes; drives where the app opens. */
  setupComplete: boolean;
  /** Null while the saved state is still being read at boot. */
  hydrated: boolean;
  /** Marks setup done and asks the OS to start intercepting. */
  completeSetup: () => Promise<void>;
  update: (patch: Partial<Settings>) => void;
  /**
   * Records a closed shield. Returns the milestone crossed, if any, so the
   * caller knows whether this save has earned the loud screen.
   */
  logAvoided: (amount: number, label?: string) => number | null;
  /** Records a shield the user continued through. Never framed as a failure. */
  logContinued: () => void;
  /** Called when a shield opens, whatever the user then chooses. */
  recordAttempt: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function ShieldStoreProvider({ children }: { children: ReactNode }) {
  const [totalAvoided, setTotal] = useState(168);
  const [pauses, setPauses] = useState(12);
  const [history, setHistory] = useState<ShieldEvent[]>(SEED_HISTORY);
  // Optimistic only until useEntitlement's RevenueCat check resolves and, on
  // repeat launches, until persistence rehydrates below.
  const [pro, setPro] = useState(false);
  // Seeded three days back so the return screens have a plausible figure
  // before any real attempt has been recorded.
  const [lastAttemptAt, setLastAttemptAt] = useState<number | null>(
    Date.now() - 3 * DAY_MS,
  );
  const [setupComplete, setSetupComplete] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    pauseSeconds: DEFAULT_PAUSE_SECONDS,
    extraStep: 'none',
    reshieldOn: true,
    monitoredApps: [{ code: 'SHOP', label: 'Shop' }],
    reflection: true,
  });
  const hydrated = useRef(false);

  // Rehydrate once at boot. Until this resolves the seeded values stand, so
  // there is never a frame of $0 on the home screen.
  useEffect(() => {
    let cancelled = false;
    load().then((saved) => {
      if (cancelled) return;
      if (saved) {
        if (saved.totalAvoided !== undefined) setTotal(saved.totalAvoided);
        if (saved.pauses !== undefined) setPauses(saved.pauses);
        if (saved.history) setHistory(saved.history);
        if (saved.pro !== undefined) setPro(saved.pro);
        if (saved.setupComplete !== undefined) setSetupComplete(saved.setupComplete);
        if (saved.lastAttemptAt !== undefined) setLastAttemptAt(saved.lastAttemptAt);
        if (saved.settings) setSettings((s) => ({ ...s, ...saved.settings } as Settings));
      }
      hydrated.current = true;
      setIsHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist after hydration only, so an early write cannot clobber saved state
  // with the seed values.
  useEffect(() => {
    if (!hydrated.current) return;
    save({ totalAvoided, pauses, history, settings, pro, setupComplete, lastAttemptAt });
  }, [totalAvoided, pauses, history, settings, pro, setupComplete, lastAttemptAt]);

  // Keep the OS in step with the friction settings. The re-shield schedule is
  // owned by DeviceActivity, so turning the switch off has to reach the
  // extension, not just this store.
  useEffect(() => {
    if (!hydrated.current) return;
    if (pro && settings.reshieldOn) {
      screenTime.startMonitoring(RESHIELD_AFTER_SECONDS).catch(() => {});
    } else {
      screenTime.stopMonitoring().catch(() => {});
    }
  }, [pro, settings.reshieldOn]);

  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );

  const completeSetup = useCallback<Store['completeSetup']>(async () => {
    setSetupComplete(true);
    // Failure here means the OS is not yet intercepting, which is worth
    // knowing but is not worth blocking the hand-off screen over — settings
    // can retry, and the app is still usable.
    try {
      await screenTime.applyShield({ applications: 1, categories: 0, token: 'current' });
    } catch {
      // Left unshielded; Settings offers the retry.
    }
  }, []);

  const recordAttempt = useCallback(() => setLastAttemptAt(Date.now()), []);

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
      daysSinceLastAttempt:
        lastAttemptAt === null
          ? null
          : Math.max(0, Math.floor((Date.now() - lastAttemptAt) / DAY_MS)),
      history,
      settings,
      pro,
      setPro,
      setupComplete,
      hydrated: isHydrated,
      completeSetup,
      update,
      logAvoided,
      logContinued,
      recordAttempt,
    }),
    [
      totalAvoided,
      pauses,
      history,
      settings,
      pro,
      setupComplete,
      isHydrated,
      lastAttemptAt,
      completeSetup,
      update,
      logAvoided,
      logContinued,
      recordAttempt,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <ShieldStoreProvider>');
  return store;
}
