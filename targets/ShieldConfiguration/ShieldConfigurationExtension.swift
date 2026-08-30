import ManagedSettings
import ManagedSettingsUI
import UIKit

/**
 The card iOS draws when a monitored app is opened.

 READ THIS BEFORE TRYING TO MAKE IT MATCH THE ARTBOARD.

 This extension cannot render the designed shield, and no amount of effort will
 change that. `ShieldConfiguration` is a value type with a fixed set of fields —
 a background colour or blur, an icon, a title, a subtitle, and up to two
 buttons. It is not a view. There is no view hierarchy to attach to, no custom
 font loading, no layout control, no timer, and no text input. The system
 composes these fields with its own typography and spacing, out of process.

 So the countdown ring, the reflection question, the running total and
 Instrument Serif all live in the app, and this card's primary button is the
 door to them: tapping it opens `threshold://shield`, and the real screen takes
 over from there.

 What this card CAN do is carry the tone. It is the first thing the user sees
 at the moment of impulse, so the copy matters more here than anywhere else in
 the app — it has to read as a pause rather than a punishment, in two short
 lines the system will typeset for us.

 The colours are the resolved sRGB values from `src/theme/colors.ts`; this
 process cannot import anything from the JS bundle.
 */
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
  /// oklch(0.22 0.028 205) — the app's ground.
  private let ground = UIColor(red: 0x08 / 255, green: 0x1e / 255, blue: 0x21 / 255, alpha: 1)
  /// oklch(0.82 0.11 78) — the accent, used here only on the primary button.
  private let accent = UIColor(red: 0xeb / 255, green: 0xbb / 255, blue: 0x6e / 255, alpha: 1)
  /// oklch(0.96 0.012 85) — primary text.
  private let bone = UIColor(red: 0xf5 / 255, green: 0xf1 / 255, blue: 0xe9 / 255, alpha: 1)
  /// oklch(0.72 0.02 205) — secondary text.
  private let muted = UIColor(red: 0x97 / 255, green: 0xa8 / 255, blue: 0xaa / 255, alpha: 1)

  private func shield(subtitle: String) -> ShieldConfiguration {
    ShieldConfiguration(
      backgroundBlurStyle: .systemUltraThinMaterialDark,
      backgroundColor: ground.withAlphaComponent(0.9),
      icon: UIImage(named: "ShieldMark"),
      title: ShieldConfiguration.Label(
        text: "One moment first.",
        color: bone
      ),
      subtitle: ShieldConfiguration.Label(
        text: subtitle,
        color: muted
      ),
      // Opens the app, where the real shield renders.
      primaryButtonLabel: ShieldConfiguration.Label(
        text: "Take the pause",
        color: ground
      ),
      primaryButtonBackgroundColor: accent,
      // Dismisses back to the home screen. Named as a choice, not a failure.
      secondaryButtonLabel: ShieldConfiguration.Label(
        text: "Not now, put it back",
        color: muted
      )
    )
  }

  override func configuration(shielding application: Application) -> ShieldConfiguration {
    shield(subtitle: "Threshold is holding the door for a few seconds. Nothing is blocked.")
  }

  override func configuration(
    shielding application: Application,
    in category: ActivityCategory
  ) -> ShieldConfiguration {
    shield(subtitle: "Threshold is holding the door for a few seconds. Nothing is blocked.")
  }

  override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
    shield(subtitle: "Threshold is holding the door for a few seconds. Nothing is blocked.")
  }

  override func configuration(
    shielding webDomain: WebDomain,
    in category: ActivityCategory
  ) -> ShieldConfiguration {
    shield(subtitle: "Threshold is holding the door for a few seconds. Nothing is blocked.")
  }
}
