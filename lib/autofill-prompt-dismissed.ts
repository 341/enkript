import * as FileSystem from 'expo-file-system/legacy';

const PREFS_FILENAME = 'enkript-ui-prefs.json';

type Prefs = {
  autofillSetupPromptDismissed?: boolean;
};

function prefsPath(): string | null {
  const base = FileSystem.documentDirectory;
  return base ? `${base}${PREFS_FILENAME}` : null;
}

export async function isAutofillSetupPromptDismissed(): Promise<boolean> {
  const path = prefsPath();
  if (!path) return false;
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return false;
    const raw = await FileSystem.readAsStringAsync(path);
    const p = JSON.parse(raw) as Prefs;
    return p.autofillSetupPromptDismissed === true;
  } catch {
    return false;
  }
}

export async function dismissAutofillSetupPrompt(): Promise<void> {
  const path = prefsPath();
  if (!path) return;
  let prefs: Prefs = {};
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      prefs = JSON.parse(await FileSystem.readAsStringAsync(path)) as Prefs;
    }
  } catch {
    prefs = {};
  }
  prefs.autofillSetupPromptDismissed = true;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(prefs));
}
