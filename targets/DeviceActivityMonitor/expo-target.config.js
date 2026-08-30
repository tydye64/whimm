/** Fires the mid-session re-shield once usage crosses the threshold. */
/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'device-activity-monitor',
  name: 'ThresholdDeviceActivityMonitor',
  frameworks: ['DeviceActivity', 'ManagedSettings', 'FamilyControls'],
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups': ['group.com.threshold.app'],
  },
};
