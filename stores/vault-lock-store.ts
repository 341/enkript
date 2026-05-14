import { create } from 'zustand';

export const NEVER_LOCK_SECONDS = Number.POSITIVE_INFINITY;

type VaultLockSlice = {
  vaultLocked: boolean;
  lastActiveAt: number;
  lockAfterSeconds: number;
  biometricFailCount: number;
  pinFailCount: number;
  pendingSetupPin: boolean;
  /** Set when the user successfully leaves the lock screen; consumed to show AutoFill onboarding. */
  postUnlockAutofillPrompt: boolean;
  lock: () => void;
  unlock: () => void;
  setPostUnlockAutofillPrompt: (v: boolean) => void;
  setLockTimeoutSeconds: (s: number) => void;
  updateLastActive: () => void;
  resetFailures: () => void;
  incBiometricFail: () => void;
  incPinFail: () => void;
  setPendingSetupPin: (v: boolean) => void;
};

export const useVaultLockStore = create<VaultLockSlice>((set) => ({
  vaultLocked: false,
  lastActiveAt: Date.now(),
  lockAfterSeconds: 300,
  biometricFailCount: 0,
  pinFailCount: 0,
  pendingSetupPin: false,
  postUnlockAutofillPrompt: false,
  setPostUnlockAutofillPrompt: (postUnlockAutofillPrompt) => set({ postUnlockAutofillPrompt }),
  lock: () => set({ vaultLocked: true }),
  unlock: () => set({ vaultLocked: false, lastActiveAt: Date.now(), biometricFailCount: 0, pinFailCount: 0 }),
  setLockTimeoutSeconds: (s) => set({ lockAfterSeconds: s }),
  updateLastActive: () => set({ lastActiveAt: Date.now(), biometricFailCount: 0, pinFailCount: 0 }),
  resetFailures: () => set({ biometricFailCount: 0, pinFailCount: 0 }),
  incBiometricFail: () => set((s) => ({ biometricFailCount: s.biometricFailCount + 1 })),
  incPinFail: () => set((s) => ({ pinFailCount: s.pinFailCount + 1 })),
  setPendingSetupPin: (pendingSetupPin) => set({ pendingSetupPin }),
}));
