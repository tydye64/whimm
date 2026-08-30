/**
 * The shield card iOS draws in front of a monitored app.
 * See ShieldConfigurationExtension.swift for why this cannot be the designed
 * screen — the extension returns a value, not a view.
 */
/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'shield-config',
  name: 'ThresholdShieldConfiguration',
  frameworks: ['ManagedSettings', 'ManagedSettingsUI', 'FamilyControls'],
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups': ['group.com.threshold.app'],
  },
};
