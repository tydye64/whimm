/**
 * The onboarding question set and the projection behind the payoff screen.
 *
 * The number on the payoff screen is real arithmetic off the three answers, not
 * a fixed figure — that was deliberate in the design, and it is what makes the
 * screen a milestone rather than a settings summary. The assumptions are stated
 * on the screen itself (the breakdown rows), so the estimate can be argued with
 * rather than just believed.
 */

export type Category = { id: string; code: string; label: string };
export type Frequency = { id: string; label: string; hint: string; slips: number };
export type Amount = { id: string; label: string; mid: number };

export const CATEGORIES: Category[] = [
  { id: 'market', code: 'MK', label: 'Marketplaces' },
  { id: 'fashion', code: 'FF', label: 'Fast fashion' },
  { id: 'food', code: 'FD', label: 'Food delivery' },
  { id: 'conv', code: 'RC', label: 'Rides & convenience' },
  { id: 'resale', code: 'RA', label: 'Resale & auctions' },
  { id: 'tickets', code: 'TT', label: 'Tickets & travel' },
  { id: 'games', code: 'IG', label: 'In-app & games' },
];

export const FREQUENCIES: Frequency[] = [
  { id: 'daily', label: 'Most days', hint: '18 / mo', slips: 18 },
  { id: 'few', label: 'A few times a week', hint: '10 / mo', slips: 10 },
  { id: 'weekly', label: 'About once a week', hint: '4 / mo', slips: 4 },
  { id: 'mood', label: "Only when I'm bored or stressed", hint: '3 / mo', slips: 3 },
];

export const AMOUNTS: Amount[] = [
  { id: 'a', label: 'Under $25', mid: 18 },
  { id: 'b', label: '$25 – $75', mid: 48 },
  { id: 'c', label: '$75 – $150', mid: 108 },
  { id: 'd', label: '$150 +', mid: 210 },
];

/** How much of an intercepted order the pause is assumed to actually stop. */
const PAUSE_RATE = 0.55;
/** Each extra category beyond the first widens the estimate by 10%. */
const BREADTH_STEP = 0.1;

export type Answers = {
  categories: string[];
  frequency: string | null;
  amount: string | null;
  item: string;
};

export type Projection = {
  /** The headline figure, monthly or annualised. */
  amount: number;
  monthly: number;
  /** Orders avoided per month — the "fewer packages" line. */
  items: number;
  frequency: Frequency;
  average: Amount;
  /** "packages" unless the answers are purely delivery, then "delivery orders". */
  unit: string;
};

export function project(answers: Answers, timeframe: 'monthly' | 'yearly' = 'monthly'): Projection {
  const frequency = FREQUENCIES.find((f) => f.id === answers.frequency) ?? FREQUENCIES[1];
  const average = AMOUNTS.find((a) => a.id === answers.amount) ?? AMOUNTS[1];

  const breadth = 1 + BREADTH_STEP * (Math.max(1, answers.categories.length) - 1);
  // Rounded to the nearest $5 so the figure reads as an estimate, not a claim.
  const monthly = Math.round((frequency.slips * average.mid * PAUSE_RATE * breadth) / 5) * 5;
  const amount = timeframe === 'yearly' ? Math.round((monthly * 12) / 10) * 10 : monthly;

  const deliveryOnly =
    answers.categories.length > 0 &&
    answers.categories.every((c) => c === 'food' || c === 'conv');

  return {
    amount,
    monthly,
    items: Math.max(2, Math.round(monthly / average.mid)),
    frequency,
    average,
    unit: deliveryOnly ? 'delivery orders' : 'packages',
  };
}

/** The italic line under the number, folding in whatever they typed. */
export function tangibleLine(projection: Projection, item: string): string {
  const thing = item.trim();
  const base = `That's roughly ${projection.items} fewer ${projection.unit} arriving in a month`;
  return thing ? `${base} — and one less ${thing}.` : `${base}.`;
}
