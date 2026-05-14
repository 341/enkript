const { withAndroidManifest, withInfoPlist } = require('expo/config-plugins');

/** Intents used by Settings / expo-intent-launcher for choosing the system autofill service (package visibility on API 30+). */
const AUTOFILL_SETTINGS_ACTIONS = [
  'android.settings.REQUEST_SET_AUTOFILL_SERVICE',
  'android.settings.AUTOFILL_SETTINGS',
];

function collectDeclaredQueryActions(queries) {
  const names = new Set();
  if (!Array.isArray(queries)) return names;
  for (const q of queries) {
    for (const intent of q.intent ?? []) {
      for (const action of intent.action ?? []) {
        const n = action?.$?.['android:name'];
        if (n) names.add(n);
      }
    }
  }
  return names;
}

/**
 * Android: declare intent visibility for autofill settings screens.
 * iOS: allow `app-settings:` (used from Autofill settings) with -[UIApplication canOpenURL:].
 *
 * @param {import('@expo/config-plugins').ExpoConfig} config
 */
module.exports = function withAutofillManifest(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest.queries) manifest.queries = [];

    const declared = collectDeclaredQueryActions(manifest.queries);
    const intents = AUTOFILL_SETTINGS_ACTIONS.filter((a) => !declared.has(a)).map((name) => ({
      action: [{ $: { 'android:name': name } }],
    }));

    if (intents.length > 0) {
      manifest.queries.push({ intent: intents });
    }

    return config;
  });

  config = withInfoPlist(config, (config) => {
    const existing = config.modResults.LSApplicationQueriesSchemes;
    const set = new Set(Array.isArray(existing) ? existing : []);
    set.add('app-settings');
    config.modResults.LSApplicationQueriesSchemes = Array.from(set);
    return config;
  });

  return config;
};
