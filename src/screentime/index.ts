/**
 * The Screen Time seam.
 *
 * Everything the app needs from Apple's FamilyControls / ManagedSettings /
 * DeviceActivity stack goes through this interface, so the screens never learn
 * whether they are talking to a real device or to the simulation below.
 *
 * Pass 3 replaces `simulated` with a native module. Until then the simulation
 * reproduces the prototype's behaviour exactly: authorization always succeeds,
 * and the picker returns one app the first time it is opened.
 *
 * A note on what is and is not possible, because it shapes this interface:
 *
 *  - `requestAuthorization` and `presentPicker` map onto real system UI that
 *    Apple owns end to end. The app cannot restyle, prefill, or read the
 *    contents of either. The picker hands back opaque tokens, never bundle IDs
 *    or app names — which is why the whole design shows category codes instead
 *    of brand logos.
 *  - `applyShield` sets a ManagedSettings shield on the selected tokens. The
 *    shield *card* iOS then draws is a ShieldConfiguration: a background, an
 *    icon, a title, a subtitle and up to two buttons, with system typography.
 *    The designed shield — countdown ring, reflection field, running total —
 *    cannot be drawn there. Its primary button deep-links into the app, and the
 *    real screen renders in-app. `shieldDeepLink` is that hand-off.
 */

export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved';

/** What the picker gives back: a count, and an opaque selection to persist. */
export type Selection = {
  /** Number of individual apps chosen. */
  applications: number;
  /** Number of whole categories chosen. */
  categories: number;
  /** Opaque, device-scoped token blob. Meaningless off this phone. */
  token: string;
};

export interface ScreenTime {
  isSupported(): boolean;
  getAuthorizationStatus(): Promise<AuthorizationStatus>;
  /** Presents Apple's FamilyControls dialog. Resolves once the user answers. */
  requestAuthorization(): Promise<AuthorizationStatus>;
  /** Presents FamilyActivityPicker. Resolves null if dismissed without a change. */
  presentPicker(current?: Selection | null): Promise<Selection | null>;
  /** Starts intercepting the selected apps. */
  applyShield(selection: Selection): Promise<void>;
  /** Stops intercepting, without clearing the selection. */
  clearShield(): Promise<void>;
}

const simulated: ScreenTime = {
  isSupported: () => true,
  async getAuthorizationStatus() {
    return status;
  },
  async requestAuthorization() {
    await settle();
    status = 'approved';
    return status;
  },
  async presentPicker() {
    await settle();
    return { applications: 1, categories: 0, token: 'simulated-selection' };
  },
  async applyShield() {
    await settle();
  },
  async clearShield() {
    await settle();
  },
};

let status: AuthorizationStatus = 'notDetermined';

/** Stands in for the beat where system UI is on screen. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 260));

/**
 * Resolved once at import. Pass 3 swaps this for the native implementation and
 * keeps `simulated` as the fallback for Expo Go and the simulator, neither of
 * which can present FamilyControls UI.
 */
export const screenTime: ScreenTime = simulated;

/** True while the app is running against the simulation rather than the OS. */
export const isSimulated = screenTime === simulated;
