// [VaultUnlock · Steps 4–6] Lock screen: PIN wizard, verify, unlock + hydrate.
import * as React from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { VaultButton } from '@/components/ui/vault-button';
import { VaultSectionLabel } from '@/components/ui/vault-section-label';
import { PinLengthPicker } from '@/components/vault/pin-length-picker';
import { PinPad } from '@/components/vault/pin-pad';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { DEFAULT_PIN_LENGTH, pinLengthLabel, type PinLength } from '@/lib/pin-length';
import { activityIndicatorTint } from '@/lib/ui-theme';
import { getPinLength, hasPinConfigured, setPinCode, verifyPinCode } from '@/lib/pin-session';
import { unlockVaultWithPin } from '@/lib/unlock-vault';
import { useBootGateStore } from '@/stores/boot-gate-store';
import { useVaultLockStore } from '@/stores/vault-lock-store';
import { useVaultStore } from '@/stores/vault-store';

export default function LockScreen() {
  const scheme = useEffectiveColorScheme();
  const spinColor = activityIndicatorTint(scheme);

  const pinFails = useVaultLockStore((s) => s.pinFailCount);

  const [needsWizard, setNeedsWizard] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState<'length' | 'capture' | 'confirm'>('length');
  const [wizardPinLength, setWizardPinLength] = React.useState<PinLength>(DEFAULT_PIN_LENGTH);
  const [unlockPinLength, setUnlockPinLength] = React.useState<PinLength>(DEFAULT_PIN_LENGTH);
  const [pendingPin, setPendingPin] = React.useState('');
  const [wizardSaving, setWizardSaving] = React.useState(false);
  const [unlockSubmitting, setUnlockSubmitting] = React.useState(false);

  // [VaultUnlock · Step 4] Re-checks PIN in SecureStore — VaultColdBoot already did (duplicate I/O).
  React.useEffect(() => {
    void (async () => {
      const hasPin = await hasPinConfigured();
      setNeedsWizard(!hasPin);
      if (hasPin) {
        setUnlockPinLength(await getPinLength());
      }
    })();
  }, []);

  // [VaultUnlock · Steps 4–6] Success path: clear failures → unlock → hydrate (Step 3 nav follows).
  const unlockVault = React.useCallback(async (pin: string) => {
    useVaultLockStore.getState().resetFailures();
    useVaultLockStore.getState().unlock();
    const { migrated } = await unlockVaultWithPin(pin);
    if (migrated) {
      Alert.alert('Vault upgraded', 'Your data is now protected with stronger encryption.');
    }
  }, []);

  // [VaultUnlock · Step 4] First-time PIN: capture → confirm → setPinCode (Step 5) → unlockVault (Step 6).
  if (needsWizard) {
    return (
      <View className="flex-1 bg-slate-100 dark:bg-navy-950 px-12 pt-32">
        <Text className="text-slate-900 dark:text-slate-100 font-display text-4xl text-center tracking-tight">
          Seal your vault PIN
        </Text>
        <Text className="text-slate-600 dark:text-slate-500 text-center mt-6 text-lg">
          {wizardStep === 'length'
            ? 'Choose how many digits your vault PIN will use.'
            : wizardStep === 'capture'
              ? 'You will enter this PIN every time you unlock the vault.'
              : 'Confirm PIN to finalize setup.'}
        </Text>

        <View className="mt-12 w-full items-center">
          {wizardStep === 'length' ? (
            <>
              <VaultSectionLabel className="mb-6">pin length</VaultSectionLabel>
              <PinLengthPicker value={wizardPinLength} onChange={setWizardPinLength} disabled={wizardSaving} />
              <VaultButton
                label="Continue"
                size="lg"
                disabled={wizardSaving}
                onPress={() => setWizardStep('capture')}
                className="mt-12"
              />
            </>
          ) : (
            <View className="min-h-[280px] w-full items-center justify-center relative">
              <PinPad
                key={`${wizardStep}-${wizardPinLength}`}
                length={wizardPinLength}
                disabled={wizardSaving}
                onComplete={(pin) => {
                  if (wizardStep === 'capture') {
                    setPendingPin(pin);
                    setWizardStep('confirm');
                    return;
                  }
                  if (pin !== pendingPin) {
                    Alert.alert('Mismatch', 'Start over — pins did not align.');
                    setWizardStep('capture');
                    setPendingPin('');
                    return;
                  }

                  setWizardSaving(true);
                  void (async () => {
                    try {
                      await setPinCode(pin, wizardPinLength); // [VaultUnlock · Step 5]
                      useBootGateStore.getState().markConfigured(true);
                      useVaultLockStore.getState().setPostUnlockAutofillPrompt(true); // [VaultUnlock · Step 7]
                      await unlockVault(pin); // [VaultUnlock · Step 6]
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : 'Try again.';
                      Alert.alert('Could not save PIN', msg);
                      setWizardSaving(false);
                    }
                  })();
                }}
              />
              {wizardSaving ? (
                <View className="absolute inset-0 items-center justify-center rounded-2xl bg-slate-200/85 dark:bg-navy-950/85">
                  <ActivityIndicator size="large" color={spinColor} />
                  <Text className="text-slate-600 dark:text-slate-400 mt-8 text-center text-lg">
                    Securing your vault…
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 items-center px-8 pt-32">
      <Text className="text-6xl">🔐</Text>
      <Text className="text-slate-900 dark:text-slate-100 font-display text-4xl tracking-tight mt-10">Vault</Text>
      <Text className="text-slate-600 dark:text-slate-400 mt-8 text-lg text-center px-4">
        Enter your PIN to unlock.
      </Text>

      <Text className="text-[11px] text-slate-600 dark:text-slate-500 mt-10 tracking-[0.45em] uppercase">
        {pinLengthLabel(unlockPinLength)}
      </Text>

      <View className="mt-6 w-full min-h-[280px] items-center justify-center relative">
        <PinPad
          key={unlockPinLength}
          length={unlockPinLength}
          disabled={unlockSubmitting}
          onComplete={(pin) => {
            setUnlockSubmitting(true);
            void (async () => {
              try {
                const ok = await verifyPinCode(pin); // [VaultUnlock · Step 5]
                if (!ok) {
                  useVaultLockStore.getState().incPinFail();
                  const fails = useVaultLockStore.getState().pinFailCount;
                  Alert.alert(fails >= 5 ? 'Session reset' : 'Incorrect PIN · try again.');

                  // [VaultUnlock · Step 4] 5 failures: wipe RAM and re-lock (Step 8-like path).
                  if (fails >= 5) {
                    useVaultLockStore.getState().resetFailures();
                    const { lockVaultSession } = await import('@/lib/unlock-vault');
                    lockVaultSession();
                    useVaultStore.getState().clearMemoryForLock();
                    useVaultLockStore.getState().lock();
                  }
                  setUnlockSubmitting(false);
                  return;
                }

                useVaultLockStore.getState().setPostUnlockAutofillPrompt(true); // [VaultUnlock · Step 7]
                await unlockVault(pin); // [VaultUnlock · Step 6]
              } catch (e) {
                const msg = e instanceof Error ? e.message : 'Try again.';
                Alert.alert('Unlock failed', msg);
                setUnlockSubmitting(false);
              }
            })();
          }}
        />
        {unlockSubmitting ? (
          <View
            className="absolute inset-0 items-center justify-center rounded-2xl bg-slate-200/85 dark:bg-navy-950/85"
            pointerEvents="none">
            <ActivityIndicator size="large" color={spinColor} />
            <Text className="text-slate-600 dark:text-slate-400 mt-8 text-center text-lg">Unlocking…</Text>
          </View>
        ) : null}
      </View>

      {pinFails > 0 ? (
        <Text className="text-rose-300 text-[11px] mt-14 tracking-[0.4em] uppercase">
          FAILED ATTEMPTS {pinFails} / 5
        </Text>
      ) : null}
    </View>
  );
}
