/**
 * The frame every screen sits in: the teal ground, safe-area padding resolved
 * from the prototype's fixed-frame offsets, and the entrance animation.
 *
 * The prototypes give each screen one of three entrances — `thIn` (fade),
 * `thUp` (fade + 14px rise) or `thRise` (slide up from the bottom edge, used
 * only when the shield takes over the display). They are reproduced here so the
 * feel of moving through the flow survives the port; a screen that opts out
 * gets `enter="none"`.
 */
import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color } from '../theme/colors';
import { bottomOffset, gutter as gutters, resolve, topOffset } from '../theme/layout';

export type Enter = 'fade' | 'up' | 'rise' | 'none';

type Props = {
  children: ReactNode;
  /**
   * Layers behind the content — glows, gradients, scrims. Rendered outside the
   * padded box so their offsets stay measured from the screen edge, the way the
   * prototype's absolutely-positioned bloom is.
   */
  backdrop?: ReactNode;
  /** Which prototype entrance to play. */
  enter?: Enter;
  /** Horizontal padding. Defaults to the 24px most screens use. */
  gutter?: number;
  /** Vertical offset of the first row, from `topOffset`. */
  top?: number;
  /** Space above the home indicator, from `bottomOffset`. */
  bottom?: number;
  background?: string;
  style?: ViewStyle;
};

const DURATION: Record<Exclude<Enter, 'none'>, number> = {
  fade: 500,
  up: 450,
  rise: 520,
};

export function Screen({
  children,
  backdrop,
  enter = 'up',
  gutter = gutters.standard,
  top = topOffset.header,
  bottom = bottomOffset.standard,
  background = color.ground,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const pad = resolve(insets);
  const progress = useRef(new Animated.Value(enter === 'none' ? 1 : 0)).current;

  useEffect(() => {
    if (enter === 'none') return;
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION[enter],
      // cubic-bezier(.2,.8,.2,1) for the moving entrances, ease for the fade.
      easing: enter === 'fade' ? Easing.ease : Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [enter, progress]);

  const motion =
    enter === 'none'
      ? null
      : {
          opacity: enter === 'rise' ? 1 : progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                // `thRise` travels the full height of the display; `thUp` 14px.
                outputRange: [enter === 'rise' ? 874 : enter === 'up' ? 14 : 0, 0],
              }),
            },
          ],
        };

  return (
    <Animated.View
      style={[
        styles.root,
        { backgroundColor: background },
        motion,
      ]}
    >
      {backdrop}
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: gutter,
            paddingTop: pad.top(top),
            paddingBottom: pad.bottom(bottom),
          },
          style,
        ]}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  content: { flex: 1 },
});
