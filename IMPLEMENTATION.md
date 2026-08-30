# Threshold — implementation notes

The Expo app in this repo implements the designs handed off in `project/`
(see `README.md` for the bundle, and `chats/chat1.md` for the intent behind
each screen).

Being built in three passes:

| Pass | Scope | State |
| --- | --- | --- |
| 1 | Foundation — tokens, type, primitives, and all 12 onboarding screens | **done** |
| 2 | The mechanic — shield, reflection, session, post-close capture, milestone, insights | **done** |
| 3 | Return screens (home, settings) + real Screen Time wiring | not started |

## Running it

```bash
npm install
npx expo start          # then i / a, or scan with a dev build
npm run typecheck
```

`npx expo start --web` renders everything except the native Screen Time surfaces
and is how the screens in pass 1 were checked against the artboards. Web has no
safe-area insets, so vertical spacing at the top of each screen is tighter there
than on a device — that difference is expected, not a layout bug.

Pass 3 introduces native modules, at which point Expo Go stops being enough and
a development build is required.

## The one design constraint worth knowing up front

**The shield you see in `Threshold Shield.dc.html` cannot be rendered by iOS's
real shield.**

When a monitored app is opened, iOS draws the blocking UI itself, from a
`ShieldConfiguration` your app extension returns. That configuration allows a
background color or blur, an icon, a title, a subtitle, and up to two buttons —
with system typography and system layout. It is not a view you get to draw.

Everything that makes the designed shield what it is — the conic countdown ring,
the live timer, the reflection input, Instrument Serif, the running `$ avoided`
footer — is outside what that API can express. There is no workaround; the
extension runs out-of-process with a fixed layout.

So the mechanic is split:

- the **ShieldConfiguration** shows a minimal, Apple-styled card whose primary
  button deep-links into Threshold;
- the **designed shield renders in-app**, where the countdown, the reflection
  question and the two exits all work as drawn.

The cost is one extra tap on the real interception path, and the shield card the
user first sees is plainer than the artboard. Everything downstream of that tap
matches the design exactly. This is how every Screen Time app in this category
does it, for the same reason.

Worth flagging to design before pass 3 lands: the copy on that first Apple-drawn
card is the only part of the mechanic that has not been designed yet, and it is
the part that has to carry "this is a pause, not a block".

## Structure

```
app/                     expo-router routes, one file per screen
  onboarding/            the 12-screen setup flow
src/
  theme/                 colors, type, layout geometry
  components/            Screen, Button, Nav, Options, Grid, Glow
  hooks/                 useCountUp, useCountdown
  onboarding/            flow state + the projection model
  screentime/            the Screen Time seam (see below)
  shield/                constants shared by onboarding and the real shield
```

### Colors

The prototypes are authored in `oklch()`, which React Native does not support.
All 93 distinct values are resolved to sRGB once, in `src/theme/colors.ts`, with
the original authored value kept in a comment on each line so an upstream design
change can be re-resolved rather than guessed at.

The palette is three hue families: a teal-ink ground (h205), a bone text (h85),
and a single ochre accent (h78). The accent is scarce on purpose — it marks
state, the payoff number, and one button per screen.

### Layout

The prototypes are drawn in a fixed 402×874 frame, so their vertical padding is
measured from the top of the display (`padding-top: 66px` clears a status bar of
a known height). `src/theme/layout.ts` re-expresses those as offsets from the
safe-area inset, which land back on the prototype's exact numbers on an
iPhone 15/16 and stay correct on other devices.

### The Screen Time seam

`src/screentime/index.ts` defines the whole interface the app needs from
FamilyControls / ManagedSettings / DeviceActivity. Pass 1 ships a simulation
behind it that reproduces the prototype's behaviour; pass 3 swaps in a native
module and keeps the simulation as the fallback for Expo Go and the simulator,
neither of which can present FamilyControls UI. No screen knows the difference.

## Deliberate deviations from the prototypes

- **The practice-run pause is 8 seconds, the real pause is 10.** Carried over
  from the design, for the reason given in the transcript: ten seconds of
  nothing is where people quit onboarding. `src/shield/model.ts` keeps the two
  values apart so they cannot silently converge.
- **The hero glow drops its `filter: blur(6px)`.** The radial gradient is
  already soft at that radius, and an SVG blur costs a full-screen offscreen
  pass on every frame of the breathing animation. The permission screen's
  `filter: blur(2px)` *is* implemented, with `expo-blur`, because there it is
  doing real work — it reads as system UI sitting in front of the app.
- **Hover states are dropped, press states kept.** The prototypes are mouse-
  driven; `style-hover` has no meaning on a phone.
- **Category tiles show mono codes, not brand logos.** Not a shortcut — real app
  names and icons exist only inside Apple's picker, and the tokens it returns
  are opaque. The design already worked this way.
- **The insights bar chart puts its day labels below the plot, not inside it.**
  The prototype nests each label inside the 74px bar box, so the peak bar plus
  its label overflow the box and the Sunday bar clips against the top of the
  card. Reproducing that faithfully would have shipped the bug.
- **The countdown ring is a stroked SVG arc, not a conic gradient.** Same
  geometry, and it can animate without re-rasterising a gradient each frame.

## Open questions for design

1. The Apple-drawn shield card (above) needs copy and an icon.
2. `estimateTimeframe` (monthly vs yearly) was a prototype toggle. Pass 1 hard-
   codes monthly in `app/onboarding/payoff.tsx`; if yearly is meant to be a real
   variant, it needs a rule for when it shows.
3. The paywall's "Not now", "Stay on free" and the back gesture all currently
   lead to the same place. Intended, or should declining Pro land somewhere
   different from completing setup?
