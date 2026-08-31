/**
 * The Screen Time seam.
 *
 * Everything the app needs from Apple's FamilyControls / ManagedSettings /
 * DeviceActivity stack goes through this interface, so screens never learn
 * whether they are talking to a real device or to the simulation below.
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
 *    real screen renders in-app. See
 *    `targets/ShieldConfiguration/ShieldConfigurationExtension.swift`.
 */
import { WhimmScreenTime } from '../../modules/whimm-screentime';

export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved';

/** What the picker gives back: counts, and an opaque handle to persist. */
export type Selection = {
  applications: number;
  categories: number;
  /** Device-scoped handle. Meaningless off this phone. */
  token: string;
};

export interface ScreenTime {
  isSupported(): boolean;
  getAuthorizationStatus(): Promise<AuthorizationStatus>;
  /** Presents Apple's FamilyControls dialog. Resolves once the user answers. */
  requestAuthorization(): Promise<AuthorizationStatus>;
  /** Presents FamilyActivityPicker. Resolves null if dismissed unchanged. */
  presentPicker(current?: Selection | null): Promise<Selection | null>;
  /** Starts intercepting the selected apps. */
  applyShield(selection: Selection): Promise<void>;
  /** Stops intercepting, without clearing the selection. */
  clearShield(): Promise<void>;
  /** Begins the usage schedule that fires the mid-session re-shield. */
  startMonitoring(afterSeconds: number): Promise<void>;
  stopMonitoring(): Promise<void>;
}

/** Stands in for the beat where system UI is on screen. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 260));

let simulatedStatus: AuthorizationStatus = 'notDetermined';

/**
 * Used in Expo Go, on the simulator, and on Android — none of which can present
 * FamilyControls UI. Reproduces the prototype's behaviour so the whole flow
 * stays walkable without a provisioned device.
 */
const simulated: ScreenTime = {
  isSupported: () => false,
  async getAuthorizationStatus() {
    return simulatedStatus;
  },
  async requestAuthorization() {
    await settle();
    simulatedStatus = 'approved';
    return simulatedStatus;
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
  async startMonitoring() {
    await settle();
  },
  async stopMonitoring() {
    await settle();
  },
};

const native: ScreenTime = {
  isSupported: () => WhimmScreenTime?.isSupported() ?? false,
  getAuthorizationStatus: () => WhimmScreenTime!.getAuthorizationStatus(),
  requestAuthorization: () => WhimmScreenTime!.requestAuthorization(),
  presentPicker: () => WhimmScreenTime!.presentPicker(),
  applyShield: () => WhimmScreenTime!.applyShield(),
  clearShield: () => WhimmScreenTime!.clearShield(),
  startMonitoring: (afterSeconds) => WhimmScreenTime!.startMonitoring(afterSeconds),
  stopMonitoring: () => WhimmScreenTime!.stopMonitoring(),
};

/**
 * The native module is absent in Expo Go and on Android, and present-but-
 * unsupported below iOS 16. Both fall back to the simulation rather than
 * throwing at import.
 */
export const screenTime: ScreenTime =
  WhimmScreenTime?.isSupported() ? native : simulated;

/** True while the app is running against the simulation rather than the OS. */
export const isSimulated = screenTime === simulated;
