import * as React from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { PinPad } from '@/components/vault/pin-pad';
import { hasPinConfigured, setPinCode, verifyPinCode } from '@/lib/pin-session';
import { useBootGateStore } from '@/stores/boot-gate-store';
import { useVaultLockStore } from '@/stores/vault-lock-store';
import { useVaultStore } from '@/stores/vault-store';

export default function LockScreen() {
  const pinFails = useVaultLockStore((s) => s.pinFailCount);

  const [needsWizard, setNeedsWizard] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState<'capture' | 'confirm'>('capture');
  const [pendingPin, setPendingPin] = React.useState('');
  const [wizardSaving, setWizardSaving] = React.useState(false);
  const [unlockSubmitting, setUnlockSubmitting] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      setNeedsWizard(!(await hasPinConfigured()));
    })();
  }, []);

  const unlockVault = React.useCallback(async () => {
    useVaultLockStore.getState().resetFailures();
    useVaultLockStore.getState().unlock();
    await useVaultStore.getState().hydrateFromDisk();
  }, []);

  if (needsWizard) {
    return (
      <View className="flex-1 bg-navy-950 px-12 pt-32">
        <Text className="text-slate-100 font-display text-4xl text-center tracking-tight">Seal your vault PIN</Text>
        <Text className="text-slate-500 text-center mt-6 text-lg">
          {wizardStep === 'capture'
            ? 'You will enter this PIN every time you unlock the vault.'
            : 'Confirm PIN to finalize setup.'}
        </Text>

        <View className="mt-20 min-h-[280px] items-center justify-center">
          {wizardSaving ? (
            <>
              <ActivityIndicator size="large" color="#818CF8" />
              <Text className="text-slate-400 mt-8 text-center text-lg">Securing your vault…</Text>
            </>
          ) : (
            <PinPad
              length={6}
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

                void (async () => {
                  setWizardSaving(true);
                  try {
                    await setPinCode(pin);
                    useBootGateStore.getState().markConfigured(true);
                    useVaultLockStore.getState().setPostUnlockAutofillPrompt(true);
                    await unlockVault();
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Try again.';
                    Alert.alert('Could not save PIN', msg);
                    setWizardSaving(false);
                  }
                })();
              }}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-950 items-center px-8 pt-32">
      <Text className="text-6xl">🔐</Text>
      <Text className="text-slate-100 font-display text-4xl tracking-tight mt-10">Vault</Text>
      <Text className="text-slate-400 mt-8 text-lg text-center px-4">Enter your PIN to unlock.</Text>

      <Text className="text-[11px] text-slate-500 mt-10 tracking-[0.45em] uppercase">six digit pin</Text>

      <View className="mt-6 w-full min-h-[280px] items-center justify-center">
        {unlockSubmitting ? (
          <>
            <ActivityIndicator size="large" color="#818CF8" />
            <Text className="text-slate-400 mt-8 text-center text-lg">Unlocking…</Text>
          </>
        ) : (
          <PinPad
            length={6}
            onComplete={(pin) => {
              void (async () => {
                setUnlockSubmitting(true);
                try {
                  const ok = await verifyPinCode(pin);
                  if (!ok) {
                    useVaultLockStore.getState().incPinFail();
                    const fails = useVaultLockStore.getState().pinFailCount;
                    Alert.alert(fails >= 5 ? 'Session reset' : 'Incorrect PIN · try again.');

                    if (fails >= 5) {
                      useVaultLockStore.getState().resetFailures();
                      useVaultStore.getState().clearMemoryForLock();
                      useVaultLockStore.getState().lock();
                    }
                    setUnlockSubmitting(false);
                    return;
                  }

                  useVaultLockStore.getState().setPostUnlockAutofillPrompt(true);
                  await unlockVault();
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Try again.';
                  Alert.alert('Unlock failed', msg);
                  setUnlockSubmitting(false);
                }
              })();
            }}
          />
        )}
      </View>

      {pinFails > 0 ? (
        <Text className="text-rose-300 text-[11px] mt-14 tracking-[0.4em] uppercase">
          FAILED ATTEMPTS {pinFails} / 5
        </Text>
      ) : null}
    </View>
  );
}
