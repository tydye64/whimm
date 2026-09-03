/**
 * The monitored app, standing in.
 *
 * Not a Whimm screen — it represents the shopping app the user continued
 * into, so the mid-session re-shield can be demonstrated end to end. On a real
 * device this is Amazon or DoorDash, and the re-shield is fired by a
 * DeviceActivity threshold rather than by a timer in here.
 *
 * The re-shield is the one piece of friction the app applies to a session
 * already in progress, so it is gated twice over: it is a Pro step, and Pro
 * users can turn it off. When it is off, this screen says which of those two
 * reasons applies rather than staying silent — "you turned it off" and "that's
 * a paid step" are very different messages to receive.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Stripes } from '../src/components/Stripes';
import { useCountdown } from '../src/hooks/useCountdown';
import { useStore } from '../src/shield/store';
import { color } from '../src/theme/colors';
import { radius, resolve, topOffset } from '../src/theme/layout';
import { text as type } from '../src/theme/type';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Real copy says five minutes. This is the demo interval, short enough to
 * actually watch happen. Pass 3 reads the real threshold from DeviceActivity.
 */
const DEMO_RESHIELD_SECONDS = 8;

export default function Session() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pad = resolve(insets);
  const { pro, settings } = useStore();

  const reshieldActive = pro && settings.reshieldOn;
  const { remaining } = useCountdown(DEMO_RESHIELD_SECONDS, reshieldActive);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (!reshieldActive || fired || remaining > 0) return;
    setFired(true);
    router.replace({ pathname: '/shield', params: { mode: 're' } });
  }, [reshieldActive, remaining, fired, router]);

  return (
    <View style={styles.root}>
      <Stripes />

      <View style={styles.centre}>
        <Text style={styles.label}>Monitored app</Text>
        <Text style={styles.note}>not our surface — the shopping app runs normally here</Text>
      </View>

      <View style={[styles.pillRow, { top: pad.top(topOffset.sessionPill) }]}>
        <View style={styles.pill}>
          <View style={styles.pillMark} />
          <Text style={styles.pillText}>
            {reshieldActive
              ? remaining > 0
                ? `Whimm checks back in ${remaining}s`
                : 'checking back now'
              : 'Whimm is watching this session'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {!reshieldActive ? (
          <View style={styles.explain}>
            <Text style={styles.explainText}>
              {pro
                ? 'Mid-session re-shield is off in your settings. This session runs uninterrupted.'
                : 'Mid-session re-shield is a Pro step. On free, this session runs uninterrupted.'}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/home')}
          style={styles.leave}
        >
          <Text style={styles.leaveText}>Leave the app</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.surfaceStripeB },
  centre: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    padding: 40,
  },
  label: {
    fontFamily: type.monoValue.fontFamily,
    fontSize: 11,
    letterSpacing: 0.12 * 11,
    textTransform: 'uppercase',
    color: color.muted70,
  },
  note: {
    maxWidth: 220,
    textAlign: 'center',
    fontFamily: type.mono.fontFamily,
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: color.muted62,
  },

  pillRow: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    backgroundColor: color.scrimSessionPill,
    borderWidth: 1,
    borderColor: color.borderInput,
  },
  pillMark: { width: 7, height: 7, borderRadius: 2, backgroundColor: color.accentBright },
  pillText: { fontFamily: type.mono.fontFamily, fontSize: 11.5, color: color.muted82 },

  footer: { position: 'absolute', left: 26, right: 26, bottom: 54, gap: 10 },
  explain: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.tile,
    backgroundColor: color.scrimSession,
    borderWidth: 1,
    borderColor: color.borderIcon,
  },
  explainText: {
    fontFamily: type.body.fontFamily,
    fontSize: 13,
    lineHeight: 13 * 1.45,
    color: color.muted74,
  },
  leave: {
    paddingVertical: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.borderStrong,
    backgroundColor: color.scrimSession,
    alignItems: 'center',
  },
  leaveText: { fontFamily: type.button.fontFamily, fontSize: 15, color: color.textBodySoft },
});
