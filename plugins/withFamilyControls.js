const { withEntitlementsPlist, withInfoPlist } = require('expo/config-plugins');

/**
 * Entitlements and Info.plist keys the main app needs for Screen Time.
 *
 * `com.apple.developer.family-controls` is a **restricted entitlement**: it is
 * not granted automatically. Apple has to approve a request for the
 * Family Controls (Distribution) capability against the bundle ID before a
 * build with this entitlement will install on a device or upload to App Store
 * Connect. Development builds work with the development entitlement once the
 * capability is enabled on the identifier, which is a separate step in the
 * developer portal. Neither is something a config plugin can do for you.
 *
 * FamilyControls requires iOS 16; the Expo SDK's own minimum is already above
 * that, so no deployment-target override is needed here.
 *
 * The app group is what lets the three extensions — each in its own process —
 * see the selection, the settings, and the pending-shield flags. Its identifier
 * must match `SelectionStore.appGroup` in the native module and the literal in
 * each extension.
 */
const APP_GROUP = 'group.com.threshold.app';

module.exports = function withFamilyControls(config) {
  config = withEntitlementsPlist(config, (cfg) => {
    cfg.modResults['com.apple.developer.family-controls'] = true;

    const groups = new Set(
      cfg.modResults['com.apple.security.application-groups'] ?? [],
    );
    groups.add(APP_GROUP);
    cfg.modResults['com.apple.security.application-groups'] = [...groups];

    return cfg;
  });

  config = withInfoPlist(config, (cfg) => {
    // The shield card's primary button routes here; see ShieldActionExtension.
    const schemes = new Set(cfg.modResults.LSApplicationQueriesSchemes ?? []);
    schemes.add('threshold');
    cfg.modResults.LSApplicationQueriesSchemes = [...schemes];
    return cfg;
  });

  return config;
};
