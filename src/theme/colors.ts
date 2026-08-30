/**
 * Threshold palette.
 *
 * The prototypes are authored in oklch across three hue families — a deep
 * desaturated teal ground (h205), a single ochre accent (h78) and a warm bone
 * for text (h85). React Native has no oklch() support, so every value is
 * resolved to sRGB here and nowhere else. The comment on each line is the
 * original authored value, so a design change upstream can be re-resolved
 * without guessing which token it belonged to.
 *
 * The accent is deliberately scarce: it marks state, the payoff number, and the
 * one button per screen that has earned it. If a new screen reaches for `accent`
 * more than twice, that is usually the screen being wrong rather than the token.
 */

export const color = {
  // ── Ground ───────────────────────────────────────────────────────────────
  ground: '#081e21', // oklch(0.22 0.028 205)  app background
  groundDeep: '#031a1c', // oklch(0.20 0.03  205)  text on ochre; shield ground
  groundShield: '#0a2225', // oklch(0.235 0.03 205)  the shield itself
  groundShieldAlt: '#0b2326', // oklch(0.24 0.03  205)  onboarding shield preview
  groundHomeTop: '#11282b', // oklch(0.26 0.03  205)  springboard gradient, top
  groundHomeBottom: '#03171a', // oklch(0.19 0.028 205)  springboard gradient, bottom

  // ── Surfaces ─────────────────────────────────────────────────────────────
  surface: '#152a2d', // oklch(0.27 0.028 205)  cards, unselected options
  surfaceRaised: '#162a2c', // oklch(0.27 0.026 205)  settings + dashboard cards
  surfaceSunken: '#12282a', // oklch(0.26 0.028 205)  unselected chips
  surfaceHover: '#1e3234', // oklch(0.30 0.026 205)  card pressed state
  surfaceInput: '#15272a', // oklch(0.26 0.024 205)  text field ground
  surfacePill: '#1f3134', // oklch(0.30 0.024 205)  app pill on the shield
  surfaceQuestion: '#192d2f', // oklch(0.28 0.026 205)  reflection card
  surfaceTile: '#273638', // oklch(0.32 0.02  205)  history app tile
  surfaceTileAlt: '#233739', // oklch(0.32 0.025 205)  unselected category tile
  surfaceIcon: '#293c3e', // oklch(0.34 0.024 205)  springboard icon, unselected
  surfaceIconAlt: '#283c3e', // oklch(0.34 0.026 205)  card hover on the shield
  surfaceLaunch: '#2c3b3d', // oklch(0.34 0.02  205)  fake app-launch icon
  surfaceStepOff: '#2c3b3d', // oklch(0.34 0.02  205)  unfilled progress segment
  surfaceContinueOff: '#152527', // oklch(0.25 0.022 205)  Continue before it unlocks
  surfaceContinueOn: '#1e3234', // oklch(0.30 0.026 205)  Continue once unlocked
  surfaceStripeA: '#222b2c', // oklch(0.28 0.012 205)  monitored-app stripes
  surfaceStripeB: '#1b2324', // oklch(0.25 0.012 205)

  // ── Hairlines and borders ────────────────────────────────────────────────
  rule: '#223133', // oklch(0.30 0.02  205)  list separators, section rules
  ruleSoft: '#202e30', // oklch(0.29 0.02  205)  friction list rows
  ruleCard: '#243335', // oklch(0.31 0.02  205)  settings card dividers
  border: '#273638', // oklch(0.32 0.02  205)  card outlines
  borderMid: '#2c3b3d', // oklch(0.34 0.02  205)  quiet outlines
  borderIcon: '#314042', // oklch(0.36 0.02  205)  springboard icon outline
  borderInput: '#364647', // oklch(0.38 0.02  205)  email field
  borderStrong: '#3b4b4d', // oklch(0.40 0.02  205)  secondary buttons, underlines
  borderStrongAlt: '#394c4e', // oklch(0.40 0.024 205)  session pill
  borderStepper: '#415052', // oklch(0.42 0.02  205)  stepper buttons
  borderPill: '#3e5153', // oklch(0.42 0.024 205)  shield app-pill tile
  borderButton: '#465658', // oklch(0.44 0.02  205)  shield exit buttons
  borderContinue: '#516163', // oklch(0.48 0.02  205)  Continue, unlocked

  // ── Text ─────────────────────────────────────────────────────────────────
  text: '#f5f1e9', // oklch(0.96 0.012 85)  primary
  textBright: '#f9f5ec', // oklch(0.97 0.012 85)  toggle knob
  textStrong: '#f2eee6', // oklch(0.95 0.012 85)  headings inside cards
  textBody: '#efebe2', // oklch(0.94 0.012 85)  list titles
  textBodySoft: '#e8e4dc', // oklch(0.92 0.012 85)  reflection prompt
  textQuiet: '#e2ded5', // oklch(0.90 0.012 85)  payoff subtitle
  textQuieter: '#dbd7cf', // oklch(0.88 0.012 85)  breakdown values

  // Muted teal text — the workhorse ramp for secondary copy and labels.
  muted86: '#c4d5d7', // oklch(0.86 0.018 205)
  muted84: '#beced0', // oklch(0.84 0.018 205)
  muted82: '#b7c8ca', // oklch(0.82 0.018 205)
  muted80: '#b1c1c3', // oklch(0.80 0.018 205)
  muted78: '#abbbbd', // oklch(0.78 0.018 205)
  muted76: '#a5b5b6', // oklch(0.76 0.018 205)
  muted74: '#9dafb1', // oklch(0.74 0.02  205)
  muted72: '#97a8aa', // oklch(0.72 0.02  205)  back arrows, quiet labels
  muted70: '#91a2a4', // oklch(0.70 0.02  205)  screen subtitles
  muted68: '#8b9c9e', // oklch(0.68 0.02  205)
  muted66: '#859698', // oklch(0.66 0.02  205)
  muted64: '#7f9092', // oklch(0.64 0.02  205)
  muted62: '#798a8c', // oklch(0.62 0.02  205)  mono captions
  muted60: '#738486', // oklch(0.60 0.02  205)
  muted58: '#6d7e80', // oklch(0.58 0.02  205)
  muted56: '#67787a', // oklch(0.56 0.02  205)  footer fine print
  muted55: '#657577', // oklch(0.55 0.02  205)  arrows between pills
  muted52: '#5c6c6e', // oklch(0.52 0.02  205)  Continue while locked

  // ── Accent ───────────────────────────────────────────────────────────────
  accent: '#deae62', // oklch(0.78 0.11 78)  marks, rails, PRO tags
  accentBright: '#ebbb6e', // oklch(0.82 0.11 78)  buttons, the payoff number, ring
  accentHi: '#f2c275', // oklch(0.84 0.11 78)  totals in mono
  accentSoft: '#f2ca8d', // oklch(0.86 0.09 78)  Pro column, stepper value
  accentSofter: '#f8d193', // oklch(0.88 0.09 78)  monitored icon glyph

  // Accent at alpha — always over a teal ground, so these are premultiplied
  // against nothing and rely on real alpha compositing.
  accentA08: 'rgba(222, 174, 98, 0.08)',
  accentA12: 'rgba(222, 174, 98, 0.12)',
  accentA14: 'rgba(222, 174, 98, 0.14)',
  accentA15: 'rgba(222, 174, 98, 0.15)',
  accentA16: 'rgba(222, 174, 98, 0.16)', // selected chip fill
  accentA18: 'rgba(222, 174, 98, 0.18)',
  accentA20: 'rgba(222, 174, 98, 0.20)',
  accentA22: 'rgba(222, 174, 98, 0.22)',
  accentA40: 'rgba(222, 174, 98, 0.40)',
  accentA42: 'rgba(222, 174, 98, 0.42)',
  accentA45: 'rgba(222, 174, 98, 0.45)',
  accentA50: 'rgba(222, 174, 98, 0.50)',
  accentA55: 'rgba(222, 174, 98, 0.55)',
  accentA60: 'rgba(222, 174, 98, 0.60)',
  accentA65: 'rgba(222, 174, 98, 0.65)', // selected chip border

  // ── Milestone ────────────────────────────────────────────────────────────
  // The one inversion in the app: ochre floods, teal type sits on top.
  milestoneTop: '#fdcd68', // oklch(0.87 0.13 84)
  milestoneBottom: '#e7a55a', // oklch(0.77 0.12 68)
  milestoneInk: '#071f21', // oklch(0.22 0.03 205)  type on the flood
  milestoneInkA35: 'rgba(7, 31, 33, 0.35)', // outline button border
  milestoneInkA08: 'rgba(7, 31, 33, 0.08)', // outline button pressed
  milestoneCta: '#f8edd8', // oklch(0.95 0.03 84)   label on the dark CTA
  milestoneBloom: 'rgba(255, 237, 169, 0.75)', // oklch(0.95 0.09 92 / 0.75)

  // ── Scrims and placeholders ──────────────────────────────────────────────
  scrim: 'rgba(6, 14, 16, 0.55)', // behind the native permission dialog
  scrimPanel: 'rgba(34, 49, 51, 0.5)', // oklch(0.30 0.02 205 / 0.5)
  scrimPill: 'rgba(34, 49, 51, 0.7)', // oklch(0.30 0.02 205 / 0.7)
  scrimSession: 'rgba(7, 31, 33, 0.9)', // oklch(0.22 0.03 205 / 0.9)
  scrimSessionPill: 'rgba(7, 31, 33, 0.92)', // oklch(0.22 0.03 205 / 0.92)
  dashedNative: 'rgba(121, 138, 140, 0.7)', // oklch(0.62 0.02 205 / 0.7)
  dashedPicker: 'rgba(101, 117, 119, 0.75)', // oklch(0.55 0.02 205 / 0.75)
  pickerFill: 'rgba(21, 39, 42, 0.6)', // oklch(0.26 0.024 205 / 0.6)
} as const;

/** Selected / unselected treatment shared by every chip, tile and option row. */
export const optionState = {
  on: { bg: color.accentA16, border: color.accentA65, text: color.text },
  off: { bg: color.surfaceSunken, border: color.surfaceSunken, text: color.muted84 },
} as const;

export type ColorToken = keyof typeof color;
