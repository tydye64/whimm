/**
 * Screen geometry.
 *
 * The prototypes are drawn inside a fixed 402×874 device frame, so their
 * vertical padding is measured from the top of the display: `padding-top:66px`
 * clears a status bar that the frame draws at a fixed height. On a real device
 * that distance is the safe-area inset plus a little air, so the constants here
 * are expressed as offsets from the inset and resolved per device by
 * `useFrameInsets`. On an iPhone 15/16 (59pt top, 34pt bottom) they land back on
 * the prototype's exact numbers.
 */
import { EdgeInsets } from 'react-native-safe-area-context';

/** Top inset on the iPhone the prototypes were drawn against. */
const REFERENCE_TOP = 59;
/** Home-indicator inset on the same device. */
const REFERENCE_BOTTOM = 34;

/** Prototype `padding-top` values, by the role of the screen. */
export const topOffset = {
  /** Back arrow / step bar row — most onboarding and settings screens. */
  header: 66 - REFERENCE_TOP,
  /** Screens that open straight onto a wordmark: hero, shield. */
  brand: 70 - REFERENCE_TOP,
  /** Screens that open onto a mono caption: payoff, handoff, milestone. */
  caption: 74 - REFERENCE_TOP,
  /** The pill that floats over a monitored-app session. */
  sessionPill: 62 - REFERENCE_TOP,
};

/** Prototype `padding-bottom`, above the home indicator. */
export const bottomOffset = {
  standard: 44 - REFERENCE_BOTTOM,
  tight: 40 - REFERENCE_BOTTOM,
  session: 54 - REFERENCE_BOTTOM,
};

export const gutter = {
  /** Most screens. */
  standard: 24,
  /** Screens whose content wants a touch more air: hero, trust, payoff. */
  wide: 26,
  /** The shield, which is the widest-set screen in the app. */
  shield: 28,
  /** The app picker, which is the tightest. */
  narrow: 22,
};

export const radius = {
  chip: 999,
  button: 18,
  card: 16,
  cardLg: 18,
  tile: 15,
  tileSm: 9,
  exit: 17,
};

export const resolve = (insets: EdgeInsets) => ({
  top: (offset: number) => insets.top + offset,
  bottom: (offset: number) => Math.max(insets.bottom, REFERENCE_BOTTOM) + offset,
});
