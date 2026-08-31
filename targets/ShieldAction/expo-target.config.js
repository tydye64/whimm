/** Handles taps on the shield card's two buttons. */
/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'shield-action',
  name: 'WhimmShieldAction',
  frameworks: ['ManagedSettings', 'FamilyControls'],
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups': ['group.com.whimm.app'],
  },
};
