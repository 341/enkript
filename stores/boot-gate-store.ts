// [VaultUnlock · Step 1] Boot gate: VaultColdBoot sets these before app/index can redirect.
import { create } from 'zustand';

type BootGate = {
  /** False until Step 1 finishes — RootIndex shows blank screen while waiting. */
  sessionReady: boolean;
  /** Whether a PIN envelope exists in SecureStore (from hasPinConfigured). */
  vaultHasPin: boolean;
  markConfigured: (hasPin: boolean) => void;
};

export const useBootGateStore = create<BootGate>((set) => ({
  sessionReady: false,
  vaultHasPin: false,
  markConfigured: (vaultHasPin) => set({ sessionReady: true, vaultHasPin }),
}));
