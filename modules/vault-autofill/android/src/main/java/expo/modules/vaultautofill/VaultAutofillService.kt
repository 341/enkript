package expo.modules.vaultautofill

import android.app.assist.AssistStructure
import android.os.CancellationSignal
import android.service.autofill.AutofillService
import android.service.autofill.FillCallback
import android.service.autofill.FillRequest
import android.service.autofill.FillResponse
import android.view.autofill.AutofillId
import android.widget.RemoteViews
import org.json.JSONArray

/**
 * Minimal AutofillService — reads credential metadata synced from the JS layer.
 * Full inline fill requires additional Dataset wiring per field; this service validates registration.
 */
class VaultAutofillService : AutofillService() {
  override fun onFillRequest(request: FillRequest, cancellationSignal: CancellationSignal, callback: FillCallback) {
    val structure: AssistStructure = request.fillContexts.last().structure
    val prefs = applicationContext.getSharedPreferences(VaultAutofillModule.PREFS, MODE_PRIVATE)
    val raw = prefs.getString(VaultAutofillModule.CREDENTIALS_KEY, "[]") ?: "[]"
    val entries = JSONArray(raw)
    if (entries.length() == 0) {
      callback.onSuccess(null)
      return
    }

    val usernameId = findAutofillId(structure, "username", "email", "user")
    val passwordId = findAutofillId(structure, "password", "pass")
    if (usernameId == null || passwordId == null) {
      callback.onSuccess(null)
      return
    }

    val first = entries.getJSONObject(0)
    val username = first.optString("username", "")
    val password = ""

    val presentation = RemoteViews(packageName, android.R.layout.simple_list_item_1).apply {
      setTextViewText(android.R.id.text1, first.optString("title", "Vault login"))
    }

    val response = FillResponse.Builder()
      .addDataset(
        android.service.autofill.Dataset.Builder(presentation)
          .setValue(usernameId, android.view.autofill.AutofillValue.forText(username))
          .setValue(passwordId, android.view.autofill.AutofillValue.forText(password))
          .build(),
      )
      .build()

    callback.onSuccess(response)
  }

  override fun onSaveRequest(request: android.service.autofill.SaveRequest, callback: android.service.autofill.SaveCallback) {
    callback.onSuccess()
  }

  private fun findAutofillId(structure: AssistStructure, vararg hints: String): AutofillId? {
    for (i in 0 until structure.childCount) {
      val node = structure.getChildAt(i)
      val hint = node.hint?.lowercase() ?: ""
      val idEntry = node.autofillId
      if (idEntry != null && hints.any { hint.contains(it) }) {
        return idEntry
      }
    }
    return null
  }
}
