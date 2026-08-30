/**
 * The soft ochre bloom that sits behind the hero, the payoff number and the
 * shield. In CSS this is a `radial-gradient(closest-side, …, transparent 70%)`
 * on an oversized ellipse, bled off the edge of the screen; here it is an SVG
 * ellipse with the same two stops.
 *
 * The prototype adds `filter: blur(6px)` on the hero instance. That is dropped:
 * the gradient is already soft at this radius, and an SVG blur costs a
 * full-screen offscreen pass on every frame of the breathing animation.
 */
import { useEffect, useId, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { color } from '../theme/colors';

type Props = {
  width: number;
  height: number;
  /** Distance from the anchored edge; negative bleeds off-screen as in CSS. */
  top?: number;
  bottom?: number;
  left?: number | 'center';
  right?: number;
  tint?: string;
  opacity: number;
  /** Where the gradient reaches full transparency. CSS default here is 70%. */
  fade?: number;
  /** The 8–9s `thGlow` / `thBreathe` pulse. Off by default. */
  breathe?: boolean;
  /** Cycle length in ms — 9000 on the hero, 8000 on the shield, 7000 on the milestone. */
  period?: number;
};

export function Glow({
  width,
  height,
  top,
  bottom,
  left = 'center',
  right,
  tint = color.accent,
  opacity,
  fade = 0.7,
  breathe = false,
  period = 9000,
}: Props) {
  // The CSS keyframes animate opacity .55→.8 and scale 1→1.06 together.
  const pulse = useRef(new Animated.Value(0)).current;
  // Gradient ids share one namespace across every <Svg> on screen, and several
  // screens stack two glows. Colons from useId are not valid in a url(#…) ref.
  const gradientId = `glow${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    if (!breathe) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: period / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: period / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, period, pulse]);

  const centered = left === 'center';
  const position: ViewStyle = {
    top,
    bottom,
    right,
    left: centered ? '50%' : (left as number),
    marginLeft: centered ? -width / 2 : undefined,
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        position,
        { width, height },
        breathe && {
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.8] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
        },
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={tint} stopOpacity={opacity} />
            <Stop offset={fade} stopColor={tint} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="50" cy="50" rx="50" ry="50" fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute' },
});
