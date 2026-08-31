# Whimm — implementation notes

The Expo app in this repo implements the designs handed off in `project/`
(see `README.md` for the bundle, and `chats/chat1.md` for the intent behind
each screen).

Built in three passes, all landed:

| Pass | Scope | State |
| --- | --- | --- |
| 1 | Foundation — tokens, type, primitives, and all 12 onboarding screens | **done** |
| 2 | The mechanic — shield, reflection, session, post-close capture, milestone, insights | **done** |
| 3 | Return screens (home, settings) + real Screen Time wiring | **done** |

## Running it

```bash
npm install
npm run typecheck
npx expo start --web    # the whole flow, against the Screen Time simulation
```

`--web` renders every screen and is how each one was checked against the
artboards. Web has no safe-area insets, so vertical spacing at the top of each
screen is tighter there than on a device — expected, not a layout bug.

**On a device, Screen Time needs a development build and a provisioned bundle
ID.** Expo Go cannot host the extensions or the restricted entitlement:

```bash
npx expo prebuild --platform ios      # generates ios/, including the 3 extensions
npx expo run:ios --device
```

Before that will install, three things have to happen outside this repo:

1. Set `appleTeamId` in `app.json` (currently `REPLACE_WITH_TEAM_ID`).
2. Enable the **Family Controls** capability on the `com.whimm.app`
   identifier, and create the `group.com.whimm.app` App Group.
3. Request the **Family Controls (Distribution)** entitlement from Apple for
   that bundle ID. It is a restricted entitlement and is not granted
   automatically; distribution builds will not upload without it.

Without all three, the app still runs — `src/screentime` falls back to the
simulation and the whole flow stays walkable. `/harness` is the fake springboard
that lets you trigger the shield by hand in that mode.

### What is unverified

The Swift in `modules/` and `targets/` has not been compiled. This work was done
on Linux, where there is no Xcode and no iOS SDK. What *was* verified is that
`expo prebuild` generates the three extension targets into the Xcode project,
embeds them as `.appex` products, links FamilyControls / DeviceActivity /
ManagedSettingsUI, and writes the entitlements to both the app and each
extension. Expect to fix compile errors on first build.

## The one design constraint worth knowing up front

**The shield you see in `Whimm Shield.dc.html` cannot be rendered by iOS's
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
  button deep-links into Whimm;
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
  shield.tsx             the mechanic
  capture.tsx saved.tsx  post-close logging and its confirmation
  milestone.tsx          the one loud screen
  insights.tsx           pattern recognition
  home.tsx settings.tsx  the everyday return screens
  session.tsx harness.tsx  stand-ins, not product screens
src/
  theme/                 colors, type, layout geometry
  components/            Screen, Button, Nav, Options, Grid, Glow, Ring, Rise
  hooks/                 useCountUp, useCountdown
  onboarding/            flow state + the projection model
  screentime/            the Screen Time seam (see below)
  shield/                store, persistence, shared constants
modules/
  whimm-screentime/  the native module (Swift + JS surface)
targets/
  ShieldConfiguration/   the card iOS draws over a monitored app
  ShieldAction/          what its two buttons do
  DeviceActivityMonitor/ fires the mid-session re-shield
plugins/
  withFamilyControls.js  entitlements + app group for the main app
```

### Stand-ins, not product screens

`app/harness.tsx` (a fake iOS springboard) and `app/session.tsx` (the monitored
app) exist so the mechanic can be driven without a provisioned device. On a real
build the trigger is DeviceActivity and the "session" is Amazon or DoorDash.
Neither is reachable from the app's own UI.

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
FamilyControls / ManagedSettings / DeviceActivity, and picks the native module
when it is present and supported, the simulation otherwise. No screen knows the
difference.

The picker returns **opaque tokens**, never bundle IDs or app names, and those
tokens never cross into JavaScript — they are encoded into the shared app group
for the extensions to read. That is why every tile in the app shows a category
code rather than a logo: the information to draw one does not exist outside
Apple's own picker.

### Storage

`src/shield/persistence.ts` is the entire storage layer: AsyncStorage, on device,
nothing else. The trust screen promises exactly that in plain language during
onboarding, so if a future feature needs a server, the trust screen has to change
first.

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

1. The Apple-drawn shield card (above) needs sign-off. I wrote placeholder copy
   — "One moment first." / "Whimm is holding the door for a few seconds.
   Nothing is blocked." / "Take the pause" / "Not now, put it back" — and it
   needs a `ShieldMark` icon asset, which does not exist yet. This is the first
   thing a user sees at the moment of impulse, so it deserves more attention
   than a placeholder.
2. `estimateTimeframe` (monthly vs yearly) was a prototype toggle. Pass 1 hard-
   codes monthly in `app/onboarding/payoff.tsx`; if yearly is meant to be a real
   variant, it needs a rule for when it shows.
3. The paywall's "Not now", "Stay on free" and the back gesture all currently
   lead to the same place. Intended, or should declining Pro land somewhere
   different from completing setup?
4. The shield's "extra step" setting (breathe / type-to-confirm) is stored and
   settable but not yet implemented on the shield itself — it was described in
   the transcript but never designed. Both need a screen before they can ship.
5. `streak` is hard-coded to 9 on the home and milestone screens. Real streak
   logic needs a rule: what breaks a streak — a day with no pause, or a day
   where every pause was continued through?
