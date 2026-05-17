import { create } from 'zustand';

type SecurityPrefs = {
  biometricUnlock: boolean;
  requireBiometricForPasskeyFill: boolean;
  hibpCheckEnabled: boolean;
  setBiometricUnlock: (v: boolean) => void;
  setRequireBiometricForPasskeyFill: (v: boolean) => void;
  setHibpCheckEnabled: (v: boolean) => void;
};

export const useSecurityPrefsStore = create<SecurityPrefs>((set) => ({
  biometricUnlock: true,
  requireBiometricForPasskeyFill: false,
  hibpCheckEnabled: false,
  setBiometricUnlock: (biometricUnlock) => set({ biometricUnlock }),
  setRequireBiometricForPasskeyFill: (requireBiometricForPasskeyFill) =>
    set({ requireBiometricForPasskeyFill }),
  setHibpCheckEnabled: (hibpCheckEnabled) => set({ hibpCheckEnabled }),
}));
