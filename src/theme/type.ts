/**
 * Typography.
 *
 * Three families, each with one job:
 *   Instrument Serif — statements and numbers. Anything that is the point of
 *                      the screen rather than a description of it.
 *   Geist           — every piece of UI copy.
 *   Geist Mono      — small uppercase labels, counters, and money in lists.
 *
 * React Native picks a weight by font *file*, not by numeric weight, so the
 * family name carries the weight. Two conversions from the CSS prototypes are
 * baked in here rather than at each call site:
 *   - unitless CSS line-height ratios become absolute `lineHeight` points
 *   - `letter-spacing` in em becomes points (RN has no em)
 */
import { TextStyle } from 'react-native';

export const font = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  light: 'Geist_300Light',
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
} as const;

/** CSS `letter-spacing: <em>` at a given size, in points. */
export const tracking = (em: number, size: number) => em * size;

/** CSS `font: …/<ratio>` at a given size, in points. */
export const leading = (ratio: number, size: number) => ratio * size;

/**
 * The recurring text roles. Screens compose these with a color; nothing here
 * sets one, because the same role appears on both the teal ground and the
 * ochre milestone flood.
 */
export const text = {
  /** Hero statement — the cold open only. */
  hero: {
    fontFamily: font.serif,
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: tracking(-0.01, 52),
  } as TextStyle,

  /** Screen heading. Most onboarding and return screens open with this. */
  title: {
    fontFamily: font.serif,
    fontSize: 34,
    lineHeight: leading(1.1, 34),
  } as TextStyle,

  /** Slightly tighter heading, where a screen has more below it to fit. */
  titleSm: {
    fontFamily: font.serif,
    fontSize: 30,
    lineHeight: leading(1.12, 30),
  } as TextStyle,

  /** The italic serif line that carries the tangible translation of a number. */
  serifBody: {
    fontFamily: font.serifItalic,
    fontSize: 23,
    lineHeight: leading(1.32, 23),
  } as TextStyle,

  /** Body copy under a heading. */
  body: {
    fontFamily: font.light,
    fontSize: 15,
    lineHeight: leading(1.5, 15),
  } as TextStyle,

  /** Larger body, used on the hero and the trust primer. */
  bodyLg: {
    fontFamily: font.light,
    fontSize: 16.5,
    lineHeight: leading(1.55, 16.5),
  } as TextStyle,

  /** Row titles and other plain UI text. */
  ui: {
    fontFamily: font.regular,
    fontSize: 15,
  } as TextStyle,

  uiLg: {
    fontFamily: font.regular,
    fontSize: 16.5,
    lineHeight: leading(1.3, 16.5),
  } as TextStyle,

  /** Primary button label. */
  button: {
    fontFamily: font.medium,
    fontSize: 17,
    letterSpacing: tracking(-0.01, 17),
  } as TextStyle,

  /** The small uppercase mono label above a section or beside a counter. */
  label: {
    fontFamily: font.monoMedium,
    fontSize: 11,
    letterSpacing: tracking(0.14, 11),
    textTransform: 'uppercase',
  } as TextStyle,

  /** Tighter tracking variant, used inside cards and table headers. */
  labelTight: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    letterSpacing: tracking(0.1, 10.5),
    textTransform: 'uppercase',
  } as TextStyle,

  /** Mono running text — footers, values in a list. */
  mono: {
    fontFamily: font.mono,
    fontSize: 12,
  } as TextStyle,

  monoValue: {
    fontFamily: font.monoMedium,
    fontSize: 12,
  } as TextStyle,
} as const;

/** Every font file the app needs, for a single `useFonts` call at boot. */
export { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
export { Geist_300Light, Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from '@expo-google-fonts/geist';
export { GeistMono_400Regular, GeistMono_500Medium } from '@expo-google-fonts/geist-mono';
