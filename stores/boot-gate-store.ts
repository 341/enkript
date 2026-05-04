import { create } from 'zustand';

type BootGate = {
  sessionReady: boolean;
  vaultHasPin: boolean;
  markConfigured: (hasPin: boolean) => void;
};

export const useBootGateStore = create<BootGate>((set) => ({
  sessionReady: false,
  vaultHasPin: false,
  markConfigured: (vaultHasPin) => set({ sessionReady: true, vaultHasPin }),
}));
