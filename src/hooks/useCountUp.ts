/**
 * Eased count-up for the two numbers in the app that are allowed to move: the
 * payoff projection during onboarding, and the running total after a save.
 *
 * Written so the number can never be caught at zero. The value starts at
 * `from`, and if the animation is torn down before it finishes — a fast
 * back-navigation, a reduced-motion setting, a JS thread stall — the state
 * lands on `target` rather than wherever the easing happened to stop. That
 * failure mode was worth designing out: a payoff screen that reads "$0" for a
 * frame undoes the whole moment.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const FRAME_MS = 24;

export function useCountUp(target: number, { duration = 1150, from = 0 } = {}): number {
  const [value, setValue] = useState(from);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const settle = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      if (!cancelled) setValue(target);
    };

    if (duration <= 0) {
      setValue(target);
      return;
    }

    // Started synchronously rather than after the reduced-motion promise
    // resolves, so the number is never parked at `from` waiting on the query.
    const start = Date.now();
    setValue(from);
    timer.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      // Cubic ease-out: fast off the line, settling into the final figure.
      const eased = 1 - Math.pow(1 - progress, 3);
      if (progress >= 1) {
        settle();
      } else {
        setValue(Math.round(from + (target - from) * eased));
      }
    }, FRAME_MS);

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (reduced) settle();
      })
      .catch(settle);

    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
    // `from` is intentionally read once per target change, not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
