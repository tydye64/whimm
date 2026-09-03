/**
 * Onboarding flow state.
 *
 * The prototype walks a flat ORDER array with go(+1)/go(-1). That shape is kept
 * because the flow really is linear — every screen has exactly one way forward
 * and one way back — but the steps are named routes so each screen is its own
 * file and the back gesture works without extra wiring.
 */
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import { Answers } from './model';

export const STEPS = [
  'hero',
  'apps',
  'frequency',
  'regret',
  'payoff',
  'trust',
  'permission',
  'picker',
  'friction',
  'shield',
  'paywall',
  'handoff',
] as const;

export type Step = (typeof STEPS)[number];

type Flow = {
  answers: Answers;
  toggleCategory: (id: string) => void;
  setFrequency: (id: string) => void;
  setAmount: (id: string) => void;
  setItem: (value: string) => void;
  /** Whether the FamilyActivityPicker has yielded a selection. */
  appPicked: boolean;
  setAppPicked: (picked: boolean) => void;
  plan: 'monthly' | 'annual';
  setPlan: (plan: 'monthly' | 'annual') => void;
  next: (from: Step) => void;
  back: () => void;
  restart: () => void;
};

const FlowContext = createContext<Flow | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Seeded exactly as the prototype is, so the first screen is never an empty
  // grid — two plausible categories are already on.
  const [answers, setAnswers] = useState<Answers>({
    categories: ['market', 'food'],
    frequency: null,
    amount: null,
    item: '',
  });
  const [appPicked, setAppPicked] = useState(false);
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');

  const next = useCallback(
    (from: Step) => {
      const index = STEPS.indexOf(from);
      const target = STEPS[Math.min(STEPS.length - 1, index + 1)];
      router.push(`/onboarding/${target}`);
    },
    [router],
  );

  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const restart = useCallback(() => {
    setAnswers({ categories: ['market', 'food'], frequency: null, amount: null, item: '' });
    setAppPicked(false);
    setPlan('annual');
    router.dismissAll();
    router.replace('/onboarding/hero');
  }, [router]);

  const value = useMemo<Flow>(
    () => ({
      answers,
      toggleCategory: (id) =>
        setAnswers((a) => ({
          ...a,
          categories: a.categories.includes(id)
            ? a.categories.filter((c) => c !== id)
            : [...a.categories, id],
        })),
      setFrequency: (id) => setAnswers((a) => ({ ...a, frequency: id })),
      setAmount: (id) => setAnswers((a) => ({ ...a, amount: id })),
      setItem: (item) => setAnswers((a) => ({ ...a, item })),
      appPicked,
      setAppPicked,
      plan,
      setPlan,
      next,
      back,
      restart,
    }),
    [answers, appPicked, plan, next, back, restart],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow(): Flow {
  const flow = useContext(FlowContext);
  if (!flow) throw new Error('useFlow must be used inside <OnboardingProvider>');
  return flow;
}
