/**
 * Screen 7 — the FamilyControls authorization request.
 *
 * The dialog is Apple's: its copy, its buttons, its layout. Nothing here tries
 * to imitate it — the design deliberately leaves a labelled dashed area so it
 * is obvious at a glance which pixels the app does not own. What the app *does*
 * own is the page behind it, dimmed and blurred, and the promise underneath
 * that declining is not a dead end.
 */
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useFlow } from '../../src/onboarding/state';
import { isSimulated, screenTime } from '../../src/screentime';
import { color } from '../../src/theme/colors';
import { gutter, topOffset } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

export default function Permission() {
  const { next, back } = useFlow();
  const [asking, setAsking] = useState(false);

  const request = useCallback(async () => {
    setAsking(true);
    try {
      const status = await screenTime.requestAuthorization();
      // Declining returns to the trust primer rather than stranding them here.
      if (status === 'approved') next('permission');
      else back();
    } finally {
      setAsking(false);
    }
  }, [next, back]);

  return (
    <Screen enter="fade" gutter={gutter.wide} style={styles.screen}>
      {/* The page the dialog interrupts, dimmed to 40% and pushed back. */}
      <View style={styles.behind} pointerEvents="none">
        <Text style={styles.caption}>Setup 2 of 4</Text>
        <Text style={styles.title}>One permission, then you're through.</Text>
      </View>

      {/* The prototype's `filter: blur(2px)` on the page behind the dialog.
          A real backdrop blur rather than a flat scrim, so the dimmed screen
          still reads as *this* screen sitting behind system UI. */}
      <BlurView intensity={12} tint="dark" style={styles.scrim}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTag}>Native dialog</Text>
          <Text style={styles.dialogTitle}>
            Apple FamilyControls{'\n'}authorization request
          </Text>
          <Text style={styles.dialogNote}>
            Not designed by us — system-owned copy and buttons
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label={isSimulated ? 'Simulate “Continue”' : 'Continue'}
            ready={!asking}
            onPress={request}
            size="compact"
          />
          <Text style={styles.actionNote}>
            If they decline, we return to the trust screen — never a dead end.
          </Text>
        </View>
      </BlurView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  behind: {
    paddingHorizontal: gutter.wide,
    opacity: 0.4,
  },
  caption: { ...type.label, color: color.muted60 },
  title: { ...type.title, marginTop: 26, color: color.text },

  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
    gap: 18,
  },
  dialog: {
    width: 272,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.dashedNative,
    backgroundColor: color.scrimPanel,
    alignItems: 'center',
  },
  dialogTag: { ...type.labelTight, color: color.accentBright },
  dialogTitle: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 15,
    lineHeight: 15 * 1.4,
    color: color.textBody,
  },
  dialogNote: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: type.mono.fontFamily,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.45,
    color: color.muted68,
  },
  actions: { width: 272, gap: 9 },
  actionNote: {
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.4,
    color: color.muted70,
  },
});
