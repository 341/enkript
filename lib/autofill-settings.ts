import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';

export async function openIosPrivacySettings(): Promise<void> {
  await Linking.openURL('app-settings:');
}

export async function openAndroidAutofillSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.REQUEST_SET_AUTOFILL_SERVICE,
    );
  } catch {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SETTINGS);
  }
}
