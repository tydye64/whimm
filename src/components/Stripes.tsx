/**
 * The diagonal hatch that marks the monitored-app stand-in as "not our
 * surface". CSS gets this from a `repeating-linear-gradient`; React Native has
 * no repeating gradient, so it is drawn as an SVG pattern of 45°-rotated bands.
 */
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { color } from '../theme/colors';

/** One light band plus one dark band, matching the prototype's 9px/9px. */
const BAND = 9;
const TILE = BAND * 2;

export function Stripes() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern
          id="hatch"
          x="0"
          y="0"
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(135)"
        >
          <Rect x="0" y="0" width={TILE} height={BAND} fill={color.surfaceStripeA} />
          <Rect x="0" y={BAND} width={TILE} height={BAND} fill={color.surfaceStripeB} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#hatch)" />
    </Svg>
  );
}
