import ExpoModulesCore
import FamilyControls
import ManagedSettings
import DeviceActivity
import SwiftUI

/**
 The native half of `src/screentime`.

 Four responsibilities, and the boundaries between them are set by Apple, not
 by us:

 - **Authorization.** `AuthorizationCenter.requestAuthorization` presents a
   system dialog we cannot style or pre-empt. On a child account it also
   requires a parent; `.individual` is the mode this app wants.
 - **Selection.** `FamilyActivityPicker` is a SwiftUI view, so it is presented
   from a hosting controller rather than called as a function. What comes back
   is a `FamilyActivitySelection` of opaque tokens — never bundle IDs, never
   names. They are meaningless outside this device and this app's keychain, so
   the whole UI shows category codes instead of logos.
 - **Shielding.** Writing the tokens into a `ManagedSettingsStore` is what makes
   iOS intercept the app. The store is shared with the extensions through an
   app group.
 - **Monitoring.** A `DeviceActivitySchedule` with an event threshold drives the
   mid-session re-shield.

 The selection is persisted as encoded JSON in the shared app group so the
 extensions — which run in separate processes and cannot ask the app anything —
 can read it.
 */
public class ThresholdScreenTimeModule: Module {
  private let store = ManagedSettingsStore(named: .threshold)
  private let center = AuthorizationCenter.shared
  private let activityCenter = DeviceActivityCenter()

  public func definition() -> ModuleDefinition {
    Name("ThresholdScreenTime")

    Function("isSupported") { () -> Bool in
      if #available(iOS 16.0, *) { return true }
      return false
    }

    AsyncFunction("getAuthorizationStatus") { () -> String in
      Self.describe(self.center.authorizationStatus)
    }

    AsyncFunction("requestAuthorization") { () async throws -> String in
      do {
        try await self.center.requestAuthorization(for: .individual)
        return Self.describe(self.center.authorizationStatus)
      } catch {
        // A decline surfaces as a thrown error, not a status. The flow treats
        // that as "denied" and returns to the trust screen rather than
        // stranding the user on a dead end.
        return "denied"
      }
    }

    AsyncFunction("presentPicker") { (promise: Promise) in
      DispatchQueue.main.async {
        SelectionPresenter.shared.present(
          current: SelectionStore.load(),
          onDone: { selection in
            guard let selection else {
              promise.resolve(nil)
              return
            }
            SelectionStore.save(selection)
            promise.resolve([
              "applications": selection.applicationTokens.count,
              "categories": selection.categoryTokens.count,
              // The tokens themselves never cross into JavaScript. This is a
              // handle for the app group copy, nothing more.
              "token": SelectionStore.handle,
            ])
          }
        )
      }
    }

    AsyncFunction("applyShield") { () throws in
      guard let selection = SelectionStore.load() else {
        throw ShieldError.noSelection
      }
      self.store.shield.applications =
        selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
      self.store.shield.applicationCategories =
        selection.categoryTokens.isEmpty
          ? nil
          : .specific(selection.categoryTokens)
    }

    AsyncFunction("clearShield") {
      self.store.shield.applications = nil
      self.store.shield.applicationCategories = nil
      self.activityCenter.stopMonitoring()
    }

    /// Starts the schedule that fires the mid-session re-shield.
    AsyncFunction("startMonitoring") { (afterSeconds: Int) throws in
      guard let selection = SelectionStore.load() else {
        throw ShieldError.noSelection
      }

      // A schedule covering the whole day; the event inside it is what
      // actually matters. `threshold` is continuous usage of the monitored
      // apps, which is precisely the "still in there later" the design means.
      let schedule = DeviceActivitySchedule(
        intervalStart: DateComponents(hour: 0, minute: 0),
        intervalEnd: DateComponents(hour: 23, minute: 59),
        repeats: true
      )

      let event = DeviceActivityEvent(
        applications: selection.applicationTokens,
        categories: selection.categoryTokens,
        threshold: DateComponents(second: afterSeconds)
      )

      self.activityCenter.stopMonitoring([.session])
      try self.activityCenter.startMonitoring(
        .session,
        during: schedule,
        events: [.reshield: event]
      )
    }

    AsyncFunction("stopMonitoring") {
      self.activityCenter.stopMonitoring([.session])
    }
  }

  private static func describe(_ status: AuthorizationStatus) -> String {
    switch status {
    case .approved: return "approved"
    case .denied: return "denied"
    default: return "notDetermined"
    }
  }
}

enum ShieldError: Error {
  case noSelection
}

// MARK: - Shared names

extension ManagedSettingsStore.Name {
  /// Shared with the shield extensions through the app group.
  static let threshold = Self("threshold")
}

extension DeviceActivityName {
  static let session = Self("threshold.session")
}

extension DeviceActivityEvent.Name {
  static let reshield = Self("threshold.reshield")
}

// MARK: - Selection persistence

/**
 The picker's result, stored in the app group so the extensions can read it.

 `FamilyActivitySelection` is Codable, and its tokens stay opaque through the
 round trip — encoding them does not reveal which apps they refer to.
 */
enum SelectionStore {
  static let appGroup = "group.com.threshold.app"
  static let key = "threshold.selection"
  static let handle = "device-selection"

  private static var defaults: UserDefaults? {
    UserDefaults(suiteName: appGroup)
  }

  static func save(_ selection: FamilyActivitySelection) {
    guard let data = try? JSONEncoder().encode(selection) else { return }
    defaults?.set(data, forKey: key)
  }

  static func load() -> FamilyActivitySelection? {
    guard let data = defaults?.data(forKey: key) else { return nil }
    return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
  }
}

// MARK: - Picker presentation

/**
 `FamilyActivityPicker` is SwiftUI-only, so it is presented from a hosting
 controller on top of the key window. There is no UIKit equivalent and no way
 to read or seed its contents beyond the selection binding.
 */
@available(iOS 16.0, *)
final class SelectionPresenter {
  static let shared = SelectionPresenter()

  private var hosting: UIViewController?

  func present(
    current: FamilyActivitySelection?,
    onDone: @escaping (FamilyActivitySelection?) -> Void
  ) {
    guard
      let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
      let root = scene.keyWindow?.rootViewController
    else {
      onDone(nil)
      return
    }

    let model = SelectionModel(selection: current ?? FamilyActivitySelection())
    model.onDone = { [weak self] selection in
      self?.hosting?.dismiss(animated: true)
      self?.hosting = nil
      onDone(selection)
    }

    let controller = UIHostingController(rootView: SelectionSheet(model: model))
    hosting = controller
    root.present(controller, animated: true)
  }
}

@available(iOS 16.0, *)
final class SelectionModel: ObservableObject {
  @Published var selection: FamilyActivitySelection
  var onDone: ((FamilyActivitySelection?) -> Void)?

  init(selection: FamilyActivitySelection) {
    self.selection = selection
  }
}

@available(iOS 16.0, *)
struct SelectionSheet: View {
  @ObservedObject var model: SelectionModel

  var body: some View {
    NavigationStack {
      FamilyActivityPicker(selection: $model.selection)
        .navigationTitle("Choose an app")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .cancellationAction) {
            Button("Cancel") { model.onDone?(nil) }
          }
          ToolbarItem(placement: .confirmationAction) {
            Button("Done") { model.onDone?(model.selection) }
          }
        }
    }
  }
}
