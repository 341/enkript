const {
  withAndroidManifest,
  withInfoPlist,
  AndroidConfig,
} = require('expo/config-plugins');
const path = require('path');

const AUTOFILL_SERVICE = 'expo.modules.vaultautofill.VaultAutofillService';

function withVaultAutofillAndroid(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) return config;

    if (!app.service) app.service = [];
    const exists = app.service.some((s) => s.$?.['android:name'] === AUTOFILL_SERVICE);
    if (!exists) {
      app.service.push({
        $: {
          'android:name': AUTOFILL_SERVICE,
          'android:permission': 'android.permission.BIND_AUTOFILL_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.service.autofill.AutofillService' } }],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.autofill',
              'android:resource': '@xml/vault_autofill_service',
            },
          },
        ],
      });
    }

    return config;
  });
}

function withVaultAutofillIos(config) {
  return withInfoPlist(config, (config) => {
    return config;
  });
}

/** Registers Vault Autofill native module paths and Android service. */
module.exports = function withVaultAutofill(config) {
  config = withVaultAutofillAndroid(config);
  config = withVaultAutofillIos(config);
  return config;
};
