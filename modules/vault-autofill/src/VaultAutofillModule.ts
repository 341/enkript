import { NativeModule, requireNativeModule } from 'expo-modules-core';

type VaultAutofillSpec = {
  registerCredentials(json: string): Promise<void>;
};

let instance: VaultAutofillSpec | null = null;

try {
  instance = requireNativeModule<VaultAutofillSpec>('VaultAutofill');
} catch {
  instance = null;
}

export default instance;
