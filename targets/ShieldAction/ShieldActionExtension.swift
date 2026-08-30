import ManagedSettings
import UIKit

/**
 What happens when a button on the shield card is tapped.

 The primary button hands off to the app. An app extension cannot call
 `UIApplication.open`, so the deep link is written into the shared app group and
 the app reads it on next foreground — which is immediate, because `.defer`
 keeps the shield up and the user's next action is opening Threshold.

 The secondary button closes the shield and returns to the home screen. That
 path is instant and unconditional: leaving is always the cheap option, which is
 the asymmetry the whole design rests on.
 */
class ShieldActionExtension: ShieldActionDelegate {
  private let defaults = UserDefaults(suiteName: "group.com.threshold.app")

  private func handle(
    _ action: ShieldAction,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    switch action {
    case .primaryButtonPressed:
      // Record the intent for the app to pick up, and leave the shield in
      // place. `.defer` rather than `.close`: if the user never opens the app,
      // the monitored app stays shielded rather than falling open.
      defaults?.set(true, forKey: "threshold.pendingShield")
      defaults?.set(Date().timeIntervalSince1970, forKey: "threshold.pendingShieldAt")
      completionHandler(.defer)

    case .secondaryButtonPressed:
      defaults?.set(false, forKey: "threshold.pendingShield")
      // Counted as a close so the total and history stay honest even when the
      // user never opens the app.
      let closed = defaults?.integer(forKey: "threshold.pendingCloses") ?? 0
      defaults?.set(closed + 1, forKey: "threshold.pendingCloses")
      completionHandler(.close)

    @unknown default:
      completionHandler(.close)
    }
  }

  override func handle(
    action: ShieldAction,
    for application: ApplicationToken,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    handle(action, completionHandler: completionHandler)
  }

  override func handle(
    action: ShieldAction,
    for webDomain: WebDomainToken,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    handle(action, completionHandler: completionHandler)
  }

  override func handle(
    action: ShieldAction,
    for category: ActivityCategoryToken,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    handle(action, completionHandler: completionHandler)
  }
}
