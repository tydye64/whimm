/**
 * Shared constants for the pause mechanic.
 *
 * Pass 2 builds the shield itself on top of these; onboarding needs them now so
 * the "your pause is ten seconds" screen and the practice run cannot drift apart
 * from the real thing.
 */

/** The free-tier pause, and the figure onboarding states as a fact. */
export const DEFAULT_PAUSE_SECONDS = 10;

/**
 * The onboarding practice run is two seconds shorter than the real pause.
 * That is deliberate — a first-time user watching a demo has not yet agreed to
 * wait, and ten seconds of nothing is where people quit onboarding. The real
 * shield still holds for `DEFAULT_PAUSE_SECONDS`.
 */
export const PREVIEW_PAUSE_SECONDS = 8;

/** Pro range for the pause length, in seconds. */
export const PAUSE_RANGE = { min: 5, max: 300, step: 5 } as const;

/** How long a monitored session runs before the Pro re-shield checks back. */
export const RESHIELD_AFTER_SECONDS = 5 * 60;
