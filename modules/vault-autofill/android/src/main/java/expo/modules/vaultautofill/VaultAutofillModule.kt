package expo.modules.vaultautofill

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class VaultAutofillModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VaultAutofill")

    AsyncFunction("registerCredentials") { json: String ->
      val prefs = appContext.reactContext?.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        ?: return@AsyncFunction
      prefs.edit().putString(CREDENTIALS_KEY, json).apply()
    }
  }

  companion object {
    const val PREFS = "vault_autofill"
    const val CREDENTIALS_KEY = "credentials_json"
  }
}
