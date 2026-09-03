import DeviceActivity
import FamilyControls
import ManagedSettings

/**
 The mid-session re-shield.

 `eventDidReachThreshold` fires once the monitored apps have been used
 continuously for the configured duration. Re-applying the shield is what
 brings Whimm back in front of a session already underway — the Pro step
 the design calls "checks back after 5 minutes of continuous use".

 This runs in its own process with a tight memory budget and no access to the
 app's state, so it does exactly one thing and reads its inputs from the shared
 app group.
 */
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
  private let store = ManagedSettingsStore(named: .whimm)
  private let defaults = UserDefaults(suiteName: "group.com.whimm.app")

  override func eventDidReachThreshold(
    _ event: DeviceActivityEvent.Name,
    activity: DeviceActivityName
  ) {
    super.eventDidReachThreshold(event, activity: activity)
    guard event == .reshield else { return }

    // Honour the user's own switch. The app writes this whenever the setting
    // changes; an extension that ignored it would re-shield someone who had
    // explicitly turned re-shielding off, which is worse than not shipping it.
    guard defaults?.bool(forKey: "whimm.reshieldEnabled") ?? true else { return }

    guard let data = defaults?.data(forKey: "whimm.selection"),
          let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    else { return }

    // Marks this interception as a re-shield so the app can open with the
    // "you've been in here a while" framing rather than the launch framing.
    defaults?.set(true, forKey: "whimm.pendingReshield")

    store.shield.applications =
      selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
    store.shield.applicationCategories =
      selection.categoryTokens.isEmpty ? nil : .specific(selection.categoryTokens)
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    defaults?.set(false, forKey: "whimm.pendingReshield")
  }
}

extension ManagedSettingsStore.Name {
  static let whimm = Self("whimm")
}

extension DeviceActivityEvent.Name {
  static let reshield = Self("whimm.reshield")
}
