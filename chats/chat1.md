# Impulse spending friction app

_Started 2026-08-30 17:45 UTC_

---

## User

PROMPT 1 — FOUNDATION + ONBOARDING INTRO

GOAL

I'm designing wireframes for an iOS app that adds a friction step before people open shopping and delivery apps, to interrupt impulse spending. The mechanic uses Apple's Screen Time API: the user picks which apps to monitor (Amazon, Shein, Temu, DoorDash, etc.), and my app shows a full-screen shield every time they try to open one, before it opens. The core value is a running "$ avoided" total that also implies decluttering, fewer unnecessary purchases piling up.

AUDIENCE

People who feel like they impulse-buy or impulse-order too often and want a built-in pause, not a hard block. Design for someone who wants to change a habit without feeling shamed or punished by the app.

VISUAL THEME, LOOK GUIDE AND REFERENCES
https://mobbin.com/apps/brick-ios-72304e20-0d6a-4030-be48-f53a9831e891?utm_source=copy_link&utm_medium=link&utm_campaign=app_sharing

https://mobbin.com/apps/opal-ios-3cd5ac67-b82e-481c-b1fb-6c817ac87321?utm_source=copy_link&utm_medium=link&utm_campaign=app_sharing

General Good UI design resources and references:
- https://beautifului.dev
- https://beui.dev
- https://rareui.com
- https://transitions.dev
- https://ui.shadcn.com
https://shadcnblocks.com 
https://magicui.design
https://ui.aceternity.com
https://elements.ai-sdk.dev


DESIGN BAR

This space already has design-forward competitors, and this needs to clear that bar on craft and restraint, not copy anyone's look.

Opal (Apple Design Award finalist) sets the polish bar: considered and restrained most of the time, willing to go bigger only at moments that have earned it.
Brick's real insight is that the undo shouldn't be as easy as the phone it's blocking. We're intentionally softer than Brick since this deals with money, not doomscrolling, people legitimately need to buy things quickly sometimes, so the friction should feel considered, not punitive.

Use this for structure (restraint most of the time, boldness reserved for earned moments) and for the friction philosophy, not for literal colors, type, or visual identity, that's mine to decide separately.

AI AS DELIGHT, NOT JUST UTILITY

Translate the underlying idea, not any specific app's exact choices:

A genuine AI insight feature, not just a running tally, covered in a later prompt.

TONE

Calm and restrained most of the time, bold at the moments that earn it. Avoid guilt-trip language, red warning colors, or anything that reads as a lecture. Supportive, well-crafted companion, not a scold.

SCREENS FOR THIS PROMPT

Cold open / hero screen. Sells the outcome, not features. One line on what the app does, one CTA to continue. No signup yet.
Personalization questions (2-3 screens). Ask which kinds of apps they lose money to, and about a recent purchase they regretted. Light, conversational tone, not a form.
Personalized payoff screen. Numerical projection based on their answers: an estimated monthly $ they could avoid, plus a secondary line translating that into something tangible ("that's roughly 12 fewer packages showing up this month"). This should feel like a milestone moment, not a settings summary.

Generate a rough pass on just these screens first, connected and clickable. This sets the visual language everything else will follow.

## Assistant

_[tool: run_script]_

_[tool: copy_starter_component]_

_[tool: grep]_

_[tool: read_file]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

Rough pass is clickable end to end: hero → 3 questions → payoff → a stub of what's next.

Direction I picked (yours to overrule): deep desaturated teal-ink ground, warm off-white text, single ochre accent used only for state and the payoff number. Instrument Serif for statements, Geist for UI, Geist Mono for small labels. Restraint everywhere except the payoff screen, which gets the count-up, the 104px number, and the only ochre CTA in the flow.

Notes:
- The projection is real math off their answers (order frequency × typical order × 55% assumed pause rate × slight breadth factor), and the tangible line folds in the item they typed.
- Tweaks: jump to any screen, switch the estimate to yearly, toggle the freeform "thing you regretted" field.
- Open questions for the next pass: app name is a placeholder ("Threshold"), and I avoided fake brand logos on the app picker — those tiles want real Screen Time app icons.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Count-up now runs off an interval kicked from the navigation handler, with the final value as the fallback if no frames run — so the payoff number can never render $0.

## User

PROMPT 2 — TRUST, PERMISSIONS, SETUP, PAYWALL

Continuing in the same style and system established above. Next chunk of the same flow, screens 4 through 9.

Trust / value primer, right before requesting system permission. Explains in plain language what the shield can and can't see (it can't see inside other apps, it only intercepts before they open). This is the highest drop-off risk in the whole flow, it needs to build confidence, not just inform.
System permission prompt. This is Apple's native FamilyControls dialog, just leave clear space for it, don't design a custom version.
App picker screen. Apple's native FamilyActivityPicker, same, leave space for it.
Friction level screen. Free tier: single fixed default, no options shown. Paid indicator visible but not blocking.
First shield preview. A simulated version of the shield runs right here in onboarding, so the user feels the mechanic before paying. This is the aha moment, it should feel like "oh, that's clever," not "oh, that's annoying."
Paywall. Appears immediately after the simulated shield. Free tier: one monitored app, default friction, optional reflection question included. Paid tier: unlimited apps, customizable friction (delay-length slider plus an add-on step, either a breathing pause or type-to-confirm), mid-session re-shield.

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_set_props]_

_[tool: ready_for_verification]_

Screens 4–9 added to the same flow (payoff CTA now leads into them). Tweaks panel has a screen jumper if you want to land directly on one.

- **Trust primer** — a three-pill "tap → pause → app opens" line up top so the mechanic is understood before it's described, then three plain statements: it only knows the tap, it can't see inside, amounts stay on the phone. Closes with "iOS will ask next" so the system dialog isn't a surprise.
- **Permission + picker** — both left as dashed native placeholders labelled as Apple-owned, with the surrounding copy and CTAs designed. The permission screen dims the page behind the dialog; picker area is tappable to simulate a selection so the flow continues.
- **Friction level** — free default stated as a fact ("Your pause is ten seconds"), one card, then Pro capabilities listed as a quiet locked list, no upsell interruption.
- **Shield preview** — brief fake app launch, then the shield rises. Countdown 8s; "Not now, put it back" is available immediately and is the ochre button, while "Continue anyway" stays a dim label until the timer ends. That's the Brick asymmetry, tuned softer: leaving is instant, continuing waits. Either choice gets a one-line resolution, then the paywall.
- **Paywall** — free/pro compare table, monthly vs yearly, 7-day trial, and an explicit "stay on free" exit.

Two things I'd flag: the demo pause is 8s rather than 10 so review isn't tedious (real default stays 10), and the reflection question is described in the shield rather than implemented — say the word and I'll make it a live input in the preview.

## User

Continuing in the same style and system established above. This is the mechanic the whole app is built around, so give it the most attention. Screens 10 through 12.

Shield screen. Appears when the user opens a monitored app. Timed countdown/delay. Optional (skippable) reflection prompt like "what are you here for?" Two exits, Close or Continue, visually balanced, not a hidden or de-emphasized continue, this isn't meant to trap anyone.
Post-close capture screen. Appears only if they tap Close. Optional one-tap entry for what they were about to buy and a rough dollar amount. Easy to skip entirely.
Mid-session re-shield (paid only). Same shield pattern, triggered after a configurable duration of continuous use in the monitored app.

## Assistant

_[tool: dc_write]_

_[tool: ready_for_verification]_

The mechanic lives in its own file (`Threshold Shield.dc.html`) so it can be iterated hard without touching onboarding. Starts on a stub home screen — tap SHOP to trigger it.

- **Shield** — conic-gradient countdown ring, app pill so it's clear what's being intercepted. The reflection card sits mid-screen with its own Skip; once you type, it collapses into a small "You came for —" note that stays visible through the decision, which is what makes the question worth answering. Exits are the same size, same fill, same weight, side by side; Close is live immediately, Continue reads "Continue in 7s" until the ring fills and then becomes identical to Close. Footer carries the running total and pause count in quiet mono — present, never accusing.
- **Post-close capture** — Skip is top-right and always reachable; two rows of one-tap chips (what it was, roughly how much), then a save that counts the total up and returns home on its own. Amount alone is enough to save; the category is optional.
- **Mid-session re-shield** — Continue drops you into a striped "monitored app" placeholder with a pill counting down to the check-back, then the same shield returns with re-shield framing and "Keep going" instead of "Continue". Turn `proEnabled` off in Tweaks and the session runs uninterrupted with a plain explanation instead.

Tweaks: pause length (3–30s), re-shield delay, reflection on/off, Pro on/off. Re-shield delay is in seconds for demo purposes — real copy says 5 minutes.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

The input now stays mounted while typing and only collapses into the "You came for" note on an explicit commit — Enter, blur, or a small mono "Done" pill that appears once there's text — plus automatically when the countdown hits zero if something was typed. Saved-screen copy is now per-category phrasing instead of a template string.

## User

Continuing in the same style and system established above. Screens 13 and 14, the payoff moments for all the restraint in the earlier screens.

Milestone celebration moment. The one place visual intensity gets to be loud, triggered at meaningful thresholds (first shield closed, $50 avoided, a streak). Everywhere else in the app stays restrained, this is the earned payoff for that restraint.
Insights screen. Surfaces pattern-recognition in plain, specific language, not a generic chart, something like noticing the user is most likely to open a specific app at a specific time or day. This is where the AI should feel genuinely smart, not just a tracker.

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_set_props]_

_[tool: ready_for_verification]_

Both added to the shield file, wired into the real flow rather than sitting as standalone screens.

**Milestone** — the only inversion in the app: ochre floods the screen, deep teal type on top, 132px number, a rotated mono rail down the left edge, staggered entrance. It fires only on a genuine crossing, so most saves still land on the quiet confirmation — log $60 or $120 from the $168 baseline and it triggers; $15 or $30 doesn't. `forceMilestone` in Tweaks if you want it every time.

**Insights** — back to full restraint. Lead insight is one sentence with the count that proves it ("8 of your last 11 pauses started between 9 and 11pm on a Sunday"), then a small seven-day evidence strip with the Sunday bar in ochre, three more patterns tagged by type, and one actionable suggestion — 60-second pause on Sunday evenings only — that visibly applies. Ends with a line on where the patterns come from and that nothing leaves the phone.

Reachable two ways: the milestone CTA, or tapping the THR icon on the home screen.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Rail now rotates about its left-bottom corner from a 9px left anchor, so it runs up the outer edge clear of the text column.

## User

Continuing in the same style and system established above. Final chunk, screens 15 and 16, the everyday return screens.

Home screen. Hero number is total $ avoided. Secondary stats: times resisted, current streak. Below that, a simple history list of recent shield events, including ones where they continued through, shown neutrally, no red flags, no guilt language.
Settings. Manage monitored apps, adjust friction (paid), connect email for verification (optional, not part of onboarding).

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Both return screens added; tap the THR icon on the phone home screen to reach them.

**Home** — total in the restrained treatment (off-white number, ochre `$` only), so the milestone screen keeps its monopoly on loudness. Two stats under a hairline rule, then the week's pattern as a single tappable line into Insights. History lists continued events in the same rows as closed ones — the only difference is the right column: ochre `+$60` for closed, muted mono "continued" for continued. No red, no icons, no scolding.

**Settings** — monitored apps with remove and an add row that carries a PRO tag when you're at the free limit; friction block (pause length stepper, extra-step segmented, re-shield toggle) dims to 45% and stops responding when `proEnabled` is off; optional email verification with the scope stated plainly and an Undo after sending.

The pause stepper is live — change it there and the shield actually holds for that long next time.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Both fixed: the shield headline now reads the configured length, and the re-shield toggle actually gates the session timer — with the in-session note distinguishing "you turned it off" from "it's a Pro step."

