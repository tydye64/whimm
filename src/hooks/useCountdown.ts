/**
 * The pause timer.
 *
 * Driven off wall-clock time rather than by decrementing on each tick, so a
 * backgrounded app, a dropped frame or a stalled JS thread cannot quietly make
 * the pause longer than it promised. The user was told ten seconds; ten seconds
 * is what elapses.
 */
import { useEffect, useRef, useState } from 'react';

export function useCountdown(seconds: number, running = true) {
  const [remaining, setRemaining] = useState(seconds);
  const deadline = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      deadline.current = null;
      setRemaining(seconds);
      return;
    }

    deadline.current = Date.now() + seconds * 1000;
    setRemaining(seconds);

    const tick = () => {
      if (deadline.current === null) return;
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) clearInterval(timer);
    };

    // 250ms rather than 1s: the displayed second changes within a frame or two
    // of the real boundary instead of drifting up to a second behind it.
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [seconds, running]);

  return { remaining, done: remaining === 0 };
}
