import ExpoModulesCore

public class VaultAutofillModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VaultAutofill")

    AsyncFunction("registerCredentials") { (json: String) in
      UserDefaults(suiteName: "group.com.maxhuni.eroll.myenkript")?.set(json, forKey: "vault_autofill_credentials")
    }
  }
}
