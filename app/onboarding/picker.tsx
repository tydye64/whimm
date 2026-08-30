/**
 * Screen 8 — choosing the app to watch.
 *
 * Like the permission dialog, the picker itself is Apple's. The dashed area is
 * honest about that, and the copy explains *why* there are no logos anywhere in
 * this app: real names and icons only exist inside Apple's list, and the tokens
 * it returns are opaque. The confirmation row below fills in once a choice
 * comes back, so the screen resolves rather than just advancing.
 */
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { CaptionHeader } from '../../src/components/Nav';
import { Screen } from '../../src/components/Screen';
import { useFlow } from '../../src/onboarding/state';
import { isSimulated, screenTime } from '../../src/screentime';
import { color } from '../../src/theme/colors';
import { gutter, radius } from '../../src/theme/layout';
import { text as type } from '../../src/theme/type';

export default function Picker() {
  const { appPicked, setAppPicked, next, back } = useFlow();
  const [opening, setOpening] = useState(false);

  const open = useCallback(async () => {
    setOpening(true);
    try {
      const selection = await screenTime.presentPicker();
      if (selection) setAppPicked(selection.applications + selection.categories > 0);
    } finally {
      setOpening(false);
    }
  }, [setAppPicked]);

  return (
    <Screen gutter={gutter.narrow}>
      <CaptionHeader onBack={back} caption="Setup 3 of 4" />

      <View style={styles.intro}>
        <Text style={styles.title}>Pick the one that costs you most.</Text>
        <Text style={styles.sub}>Free plan watches one app. You can swap it whenever.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open the app picker"
        onPress={open}
        disabled={opening}
        style={styles.native}
      >
        <Text style={styles.nativeTag}>Native picker</Text>
        <Text style={styles.nativeTitle}>Apple FamilyActivityPicker{'\n'}fills this area</Text>
        <Text style={styles.nativeNote}>
          Real app names and icons are only visible inside Apple's own list.
          {isSimulated ? ' Tap to simulate a choice.' : ' Tap to open it.'}
        </Text>
      </Pressable>

      <View
        style={[
          styles.confirm,
          {
            backgroundColor: appPicked ? color.accentA14 : color.surfaceSunken,
            borderColor: appPicked ? color.accentA60 : color.surfaceSunken,
          },
        ]}
      >
        <View
          style={[
            styles.confirmTile,
            { backgroundColor: appPicked ? color.accentBright : color.surfaceIcon },
          ]}
        >
          <Text style={styles.confirmCode}>{appPicked ? 'SHOP' : '—'}</Text>
        </View>
        <View style={styles.confirmText}>
          <Text style={styles.confirmTitle}>
            {appPicked ? 'One app selected' : 'Nothing selected yet'}
          </Text>
          <Text style={styles.confirmSub}>
            {appPicked
              ? 'Threshold will step in front of it'
              : 'Tap the picker above to choose'}
          </Text>
        </View>
      </View>

      <Button
        label="Continue"
        ready={appPicked}
        onPress={() => next('picker')}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: 22, paddingHorizontal: 4 },
  title: { ...type.titleSm, color: color.text },
  sub: {
    marginTop: 9,
    fontFamily: type.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.5,
    color: color.muted70,
  },

  native: {
    flex: 1,
    marginTop: 18,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.dashedPicker,
    backgroundColor: color.pickerFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  nativeTag: { ...type.labelTight, color: color.accentBright },
  nativeTitle: {
    textAlign: 'center',
    fontFamily: type.ui.fontFamily,
    fontSize: 16,
    lineHeight: 16 * 1.4,
    color: color.textBody,
  },
  nativeNote: {
    textAlign: 'center',
    maxWidth: 230,
    fontFamily: type.mono.fontFamily,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.5,
    color: color.muted66,
  },

  confirm: {
    marginTop: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: radius.tile,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmTile: {
    width: 32,
    height: 32,
    borderRadius: radius.tileSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCode: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 11,
    color: color.groundShieldAlt,
  },
  confirmText: { flex: 1 },
  confirmTitle: { fontFamily: type.ui.fontFamily, fontSize: 15, color: color.textStrong },
  confirmSub: {
    marginTop: 2,
    fontFamily: type.body.fontFamily,
    fontSize: 12.5,
    color: color.muted66,
  },
  cta: { marginTop: 14 },
});
