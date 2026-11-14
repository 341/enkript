import { requireNativeModule } from 'expo';

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
