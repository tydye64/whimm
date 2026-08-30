/**
 * Screen 18 — settings.
 *
 * Three blocks: which apps are watched, how much friction, and the optional
 * email verification.
 *
 * The friction block dims to 45% and stops responding when the user is not on
 * Pro, rather than disappearing. Showing a locked control is honest about what
 * the paid tier is; hiding it and surfacing an upsell modal at the moment of
 * intent is the pattern this app is supposed to be an argument against.
 *
 * The email block states its scope in the same breath as the offer — it reads
 * confirmation subject lines and nothing else — and offers an Undo after
 * sending, because "connect your inbox" is the single most alarming sentence in
 * the app and it should be the easiest one to take back.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CaptionHeader } from '../src/components/Nav';
import { ProTag } from '../src/components/Options';
import { Screen } from '../src/components/Screen';
import { PAUSE_RANGE } from '../src/shield/model';
import { ExtraStep, useStore } from '../src/shield/store';
import { color, optionState } from '../src/theme/colors';
import { radius } from '../src/theme/layout';
import { text as type } from '../src/theme/type';

const EXTRAS: { id: ExtraStep; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'breathe', label: 'Breathe' },
  { id: 'type', label: 'Type to confirm' },
];

const ADDABLE = [
  { code: 'FOOD', label: 'Food delivery' },
  { code: 'FAST', label: 'Fast fashion' },
  { code: 'MKT', label: 'Marketplace' },
];

export default function Settings() {
  const router = useRouter();
  const { pro, settings, update } = useStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const apps = settings.monitoredApps;
  const atFreeLimit = !pro && apps.length >= 1;
  const validEmail = email.includes('@');

  const addApp = () => {
    if (atFreeLimit) return;
    const next = ADDABLE.find((a) => !apps.some((existing) => existing.code === a.code));
    if (next) update({ monitoredApps: [...apps, next] });
  };

  return (
    <Screen enter="up" style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <CaptionHeader onBack={() => router.back()} caption="Settings" />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Monitored apps</Text>
          <Text style={styles.sectionNote}>
            {pro ? `${apps.length} watched` : `${apps.length} of 1 on free`}
          </Text>
        </View>
        <View style={styles.appList}>
          {apps.map((app, i) => (
            <View key={app.code} style={styles.appRow}>
              <View style={styles.appTile}>
                <Text style={styles.appTileText}>{app.code}</Text>
              </View>
              <Text style={styles.appLabel}>{app.label}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  update({ monitoredApps: apps.filter((_, j) => j !== i) })
                }
                hitSlop={8}
              >
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: atFreeLimit }}
            onPress={addApp}
            style={styles.addRow}
          >
            <View style={styles.addTile}>
              <Text style={styles.addGlyph}>+</Text>
            </View>
            <Text style={styles.addLabel}>
              {atFreeLimit ? 'Add another app' : 'Add an app'}
            </Text>
            {atFreeLimit ? <ProTag /> : null}
          </Pressable>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Friction</Text>
          {!pro ? <ProTag /> : null}
        </View>
        <View style={[styles.card, { opacity: pro ? 1 : 0.45 }]}>
          <View style={styles.cardRow}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Pause length</Text>
              <Text style={styles.cardSub}>
                How long the shield holds before the buttons unlock
              </Text>
            </View>
            <View style={styles.stepper}>
              <Stepper
                label="−"
                accessibilityLabel="Shorter pause"
                disabled={!pro}
                onPress={() =>
                  update({
                    pauseSeconds: Math.max(
                      PAUSE_RANGE.min,
                      settings.pauseSeconds - PAUSE_RANGE.step,
                    ),
                  })
                }
              />
              <Text style={styles.stepperValue}>{settings.pauseSeconds}s</Text>
              <Stepper
                label="+"
                accessibilityLabel="Longer pause"
                disabled={!pro}
                onPress={() =>
                  update({
                    pauseSeconds: Math.min(
                      PAUSE_RANGE.max,
                      settings.pauseSeconds + PAUSE_RANGE.step,
                    ),
                  })
                }
              />
            </View>
          </View>

          <View style={styles.cardBlock}>
            <Text style={styles.cardTitle}>Extra step</Text>
            <Text style={styles.cardSub}>One more beat before Continue works</Text>
            <View style={styles.segments}>
              {EXTRAS.map((extra) => {
                const on = settings.extraStep === extra.id;
                const t = on
                  ? optionState.on
                  : { bg: color.ruleCard, border: color.ruleCard, text: color.muted84 };
                return (
                  <Pressable
                    key={extra.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on, disabled: !pro }}
                    onPress={() => pro && update({ extraStep: extra.id })}
                    style={[styles.segment, { backgroundColor: t.bg, borderColor: t.border }]}
                  >
                    <Text style={[styles.segmentLabel, { color: t.text }]}>{extra.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.cardRow, styles.cardRowLast]}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Mid-session re-shield</Text>
              <Text style={styles.cardSub}>
                {settings.reshieldOn
                  ? 'Checks back after 5 minutes of continuous use'
                  : 'Sessions run uninterrupted'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: settings.reshieldOn, disabled: !pro }}
              onPress={() => pro && update({ reshieldOn: !settings.reshieldOn })}
              style={[
                styles.track,
                {
                  backgroundColor: settings.reshieldOn ? color.accentBright : color.borderIcon,
                  justifyContent: settings.reshieldOn ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <View style={styles.knob} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.emailTitle}>Verify with email</Text>
        <Text style={styles.emailBlurb}>
          Optional. Connect the inbox your order confirmations land in and Threshold can
          check your avoided total against what actually shipped. It reads confirmation
          subject lines and nothing else.
        </Text>

        {sent ? (
          <View style={styles.sentRow}>
            <Text style={styles.sentText}>
              Link sent to {email || 'your inbox'}. Nothing is read until you tap it.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSent(false);
                setEmail('');
              }}
              hitSlop={8}
            >
              <Text style={styles.undo}>Undo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emailRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={() => validEmail && setSent(true)}
              placeholder="you@email.com"
              placeholderTextColor={color.muted55}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.emailInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !validEmail }}
              onPress={() => validEmail && setSent(true)}
              style={[styles.send, { opacity: validEmail ? 1 : 0.4 }]}
            >
              <Text style={styles.sendText}>Send link</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.footer}>
          Threshold 1.0 · your amounts and patterns stay on this phone unless you connect an
          inbox above.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Stepper({
  label,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      style={styles.stepperButton}
    >
      <Text style={styles.stepperGlyph}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  body: { paddingBottom: 40 },

  sectionHead: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontFamily: type.ui.fontFamily, fontSize: 17, color: color.textStrong },
  sectionNote: { fontFamily: type.mono.fontFamily, fontSize: 12, color: color.muted62 },

  appList: { marginTop: 10, gap: 8 },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: radius.tile,
    backgroundColor: color.surfaceRaised,
  },
  appTile: {
    width: 30,
    height: 30,
    borderRadius: radius.tileSm,
    backgroundColor: color.accentA20,
    borderWidth: 1,
    borderColor: color.accentA45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTileText: { fontFamily: type.monoValue.fontFamily, fontSize: 9, color: color.accentSoft },
  appLabel: { flex: 1, fontFamily: type.ui.fontFamily, fontSize: 15, color: color.textBody },
  remove: { fontFamily: type.ui.fontFamily, fontSize: 13.5, color: color.muted68 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.borderStepper,
  },
  addTile: {
    width: 30,
    height: 30,
    borderRadius: radius.tileSm,
    backgroundColor: color.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlyph: { fontFamily: type.ui.fontFamily, fontSize: 16, color: color.muted78 },
  addLabel: { flex: 1, fontFamily: type.ui.fontFamily, fontSize: 15, color: color.muted86 },

  card: { marginTop: 10, borderRadius: radius.card, backgroundColor: color.surfaceRaised },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: color.ruleCard,
  },
  cardRowLast: { borderBottomWidth: 0 },
  cardBlock: {
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: color.ruleCard,
  },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: type.ui.fontFamily, fontSize: 15, color: color.textBody },
  cardSub: {
    marginTop: 3,
    fontFamily: type.body.fontFamily,
    fontSize: 12.5,
    color: color.muted64,
  },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: radius.tileSm,
    borderWidth: 1,
    borderColor: color.borderStepper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperGlyph: { fontFamily: type.ui.fontFamily, fontSize: 15, color: color.textQuiet },
  stepperValue: {
    minWidth: 44,
    textAlign: 'center',
    fontFamily: type.monoValue.fontFamily,
    fontSize: 14,
    color: color.accentSoft,
  },

  segments: { marginTop: 12, flexDirection: 'row', gap: 7 },
  segment: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentLabel: { fontFamily: type.ui.fontFamily, fontSize: 12.5 },

  track: {
    width: 48,
    height: 29,
    borderRadius: radius.chip,
    padding: 3,
    flexDirection: 'row',
  },
  knob: { width: 23, height: 23, borderRadius: 999, backgroundColor: color.textBright },

  emailTitle: {
    marginTop: 30,
    fontFamily: type.ui.fontFamily,
    fontSize: 17,
    color: color.textStrong,
  },
  emailBlurb: {
    marginTop: 6,
    fontFamily: type.body.fontFamily,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.5,
    color: color.muted68,
  },
  emailRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  emailInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.borderInput,
    backgroundColor: color.surfaceInput,
    fontFamily: type.ui.fontFamily,
    fontSize: 15,
    color: color.text,
  },
  send: {
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderRadius: 14,
    backgroundColor: color.text,
    justifyContent: 'center',
  },
  sendText: { fontFamily: type.button.fontFamily, fontSize: 14.5, color: color.ground },

  sentRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: color.accentA12,
    borderWidth: 1,
    borderColor: color.accentA40,
  },
  sentText: {
    flex: 1,
    fontFamily: type.ui.fontFamily,
    fontSize: 14,
    lineHeight: 14 * 1.4,
    color: color.textBody,
  },
  undo: { fontFamily: type.ui.fontFamily, fontSize: 13, color: color.muted72 },

  footer: {
    marginTop: 30,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: color.rule,
    fontFamily: type.mono.fontFamily,
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: color.muted56,
  },
});
