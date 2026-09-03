/**
 * Staggered entrance for the milestone screen.
 *
 * The prototype gives each element on that screen its own `animation-delay`, so
 * the number lands first and the supporting lines arrive behind it. That order
 * is the point — it reads as a reveal rather than a page appearing.
 *
 * Used nowhere else. Every other screen in the app enters as a single block,
 * which is what keeps this one feeling like an event.
 */
import { ReactNode, useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  /** Milliseconds to wait before starting. */
  delay?: number;
  duration?: number;
  /** Rise distance. The prototype's `thUp` travels 14px. */
  distance?: number;
  /** Set for a `thPop`-style scale-in instead of a rise. */
  scaleFrom?: number;
  style?: ViewStyle;
};

export function Rise({
  children,
  delay = 0,
  duration = 600,
  distance = 14,
  scaleFrom,
  style,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    const play = () => {
      Animated.timing(progress, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.bezier(0.2, 0.9, 0.2, 1),
        useNativeDriver: true,
      }).start();
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (cancelled) return;
        // Reduced motion still gets the reveal, just without the travel.
        if (reduced) progress.setValue(1);
        else play();
      })
      .catch(play);

    return () => {
      cancelled = true;
    };
  }, [delay, duration, progress]);

  // Kept as two whole style objects rather than one with a computed
  // `transform`: a union of transform arrays does not narrow cleanly against
  // Animated's style types.
  const motion =
    scaleFrom !== undefined
      ? {
          opacity: progress,
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [scaleFrom, 1] }) },
          ],
        }
      : {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
          ],
        };

  return <Animated.View style={[style, motion]}>{children}</Animated.View>;
}
