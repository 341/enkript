import { create } from 'zustand';

type SecurityPrefs = {
  biometricUnlock: boolean;
  requireBiometricForPasskeyFill: boolean;
  setBiometricUnlock: (v: boolean) => void;
  setRequireBiometricForPasskeyFill: (v: boolean) => void;
};

export const useSecurityPrefsStore = create<SecurityPrefs>((set) => ({
  biometricUnlock: true,
  requireBiometricForPasskeyFill: false,
  setBiometricUnlock: (biometricUnlock) => set({ biometricUnlock }),
  setRequireBiometricForPasskeyFill: (requireBiometricForPasskeyFill) =>
    set({ requireBiometricForPasskeyFill }),
}));
