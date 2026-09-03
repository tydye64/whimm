/**
 * JS surface of the native Screen Time module.
 *
 * Deliberately thin: it converts the native module's shapes into the
 * `ScreenTime` interface in `src/screentime` and does nothing else. All the
 * policy — when to shield, how long to monitor for — lives in the app.
 *
 * `requireOptionalNativeModule` rather than `requireNativeModule`: the module
 * is absent in Expo Go and on Android, and the app has to keep working there
 * against the simulation rather than crashing at import.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';

export type NativeAuthorizationStatus = 'notDetermined' | 'denied' | 'approved';

export type NativeSelection = {
  applications: number;
  categories: number;
  token: string;
};

type WhimmScreenTimeModule = {
  isSupported(): boolean;
  getAuthorizationStatus(): Promise<NativeAuthorizationStatus>;
  requestAuthorization(): Promise<NativeAuthorizationStatus>;
  /** Resolves null when the picker is dismissed without confirming. */
  presentPicker(): Promise<NativeSelection | null>;
  applyShield(): Promise<void>;
  clearShield(): Promise<void>;
  startMonitoring(afterSeconds: number): Promise<void>;
  stopMonitoring(): Promise<void>;
};

export const WhimmScreenTime =
  requireOptionalNativeModule<WhimmScreenTimeModule>('WhimmScreenTime');
