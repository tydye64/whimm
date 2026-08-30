/**
 * The phone home screen, standing in.
 *
 * A harness, not a product screen: it exists so the mechanic can be triggered
 * and reviewed without a provisioned device. Tapping SHOP does what opening a
 * monitored app will do once pass 3 wires up DeviceActivity; tapping THR opens
 * the app itself.
 *
 * Pass 3 moves this to `/harness` behind a dev flag and puts the real
 * dashboard — total avoided, streak, history — at this route.
 */
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Grid } from '../src/components/Grid';
import { color } from '../src/theme/colors';
import { bottomOffset, radius, resolve } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

const APPS = [
  { code: 'MAIL', label: 'Mail' },
  { code: 'MAPS', label: 'Maps' },
  { code: 'MSG', label: 'Messages' },
  { code: 'CAM', label: 'Camera' },
  { code: 'SHOP', label: 'Shop', monitored: true },
  { code: 'MUS', label: 'Music' },
  { code: 'NOTE', label: 'Notes' },
  { code: 'THR', label: 'Threshold', app: true },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pad = resolve(insets);

  return (
    <LinearGradient
      colors={[color.groundHomeTop, color.groundHomeBottom]}
      style={[styles.root, { paddingBottom: pad.bottom(bottomOffset.session) }]}
    >
      <Grid columns={4} gap={16}>
        {APPS.map((app) => (
          <Pressable
            key={app.code}
            accessibilityRole="button"
            accessibilityLabel={app.label}
            onPress={() => {
              if (app.monitored) router.push('/shield');
              else if (app.app) router.push('/insights');
            }}
            style={styles.app}
          >
            <View
              style={[
                styles.icon,
                {
                  backgroundColor: app.monitored ? color.accentA18 : color.surfaceTile,
                  borderColor: app.monitored ? color.accentA60 : color.borderIcon,
                },
              ]}
            >
              <Text
                style={[
                  styles.iconText,
                  { color: app.monitored ? color.accentSofter : color.muted78 },
                ]}
              >
                {app.code}
              </Text>
            </View>
            <Text style={styles.label}>{app.label}</Text>
          </Pressable>
        ))}
      </Grid>

      <View style={styles.hintRow}>
        <View style={styles.hint}>
          <Text style={styles.hintText}>tap SHOP — it's the monitored one</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 26 },
  app: { alignItems: 'center', gap: 7 },
  icon: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.tile,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontFamily: type.monoValue.fontFamily, fontSize: 10 },
  label: { fontFamily: type.ui.fontFamily, fontSize: 10.5, color: color.muted80 },

  hintRow: { marginTop: 34, alignItems: 'center' },
  hint: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    backgroundColor: color.scrimPill,
    borderWidth: 1,
    borderColor: color.borderStrong,
  },
  hintText: { fontFamily: type.mono.fontFamily, fontSize: 11.5, color: color.muted74 },
});
