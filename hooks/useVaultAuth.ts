import * as LocalAuth from 'expo-local-authentication';

export async function canUseBiometrics(): Promise<boolean> {
  const enrolled = await LocalAuth.isEnrolledAsync();
  const has = await LocalAuth.hasHardwareAsync();
  return enrolled && has;
}

export async function authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
  try {
    const res = await LocalAuth.authenticateAsync({
      promptMessage,
    });
    return res.success === true;
  } catch {
    return false;
  }
}
