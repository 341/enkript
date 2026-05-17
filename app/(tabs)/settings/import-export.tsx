import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as DocumentPicker from "expo-document-picker";
import * as React from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";

import { VaultButton } from '@/components/ui/vault-button';
import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { ExportWarningBanner } from "@/components/vault/export-warning-banner";
import { ImportPreviewList } from "@/components/vault/import-preview-list";
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import {
  detectImportFormat,
  exportTo1PasswordCsv,
  exportToCsv,
  parseImportCsv,
  shareTextFile,
} from "@/lib/import-export-service";
import { bottomSheetBackground, bottomSheetHandleIndicator } from '@/lib/ui-theme';
import { usePasswordStore } from "@/stores/vault-store";

export default function ImportExportScreen() {
  const scheme = useEffectiveColorScheme();
  const entries = usePasswordStore((s) => s.passwords);
  const importPreviewRowsFn = usePasswordStore((s) => s.importPreviewRows);
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const [previewRows, setPreviewRows] = React.useState<
    { title: string; username: string; password: string; url?: string; notes?: string }[]
  >([]);

  async function selectExport(mode: "generic" | "1password") {
    Alert.alert(
      mode === "generic" ? "Export generic CSV?" : "Export 1Password-style CSV?",
      "This file is unencrypted — keep it safe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          style: "destructive",
          onPress: async () => {
            const csv = mode === "generic" ? exportToCsv(entries) : exportTo1PasswordCsv(entries);
            await shareTextFile(csv, "vault-export.csv", "text/csv");
          },
        },
      ],
    );
  }

  async function mergeImport(rows: typeof previewRows) {
    try {
      const res = await importPreviewRowsFn(rows);
      sheetRef.current?.dismiss();
      Alert.alert("Imported", `${res.imported} merged · ${res.skipped} skipped as duplicates`);
    } catch (err) {
      Alert.alert(String(err));
    }
  }

  async function pickFile() {
    const picked = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (picked.canceled) return;
    const uri = picked.assets?.[0]?.uri;
    if (!uri) return;
    try {
      const text = await fetch(uri).then((r) => r.text());
      const format = detectImportFormat(text);
      const rows = parseImportCsv(text, format);
      if (!rows.length) {
        Alert.alert("Nothing to import.");
        return;
      }
      setPreviewRows(rows);
      sheetRef.current?.present?.();
    } catch (error) {
      Alert.alert(String(error));
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 160 }} className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-24">
      <VaultScreenHeader title="Vault transport" className="mb-8" />
      <ExportWarningBanner />

      <VaultButton
        label="Export CSV"
        onPress={() => selectExport("generic")}
        className="mb-6 border-indigo-500/40 bg-indigo-500/75"
      />

      <VaultButton
        label="Export · 1Password schema"
        variant="secondary"
        onPress={() => selectExport("1password")}
        className="mb-10"
      />

      <Pressable
        onPress={() => pickFile()}
        className="rounded-2xl border border-dashed border-indigo-500/50 dark:border-indigo-300/70 bg-slate-200/70 dark:bg-navy-900/60 py-6">
        <Text className="text-slate-900 dark:text-slate-100 text-center text-lg font-semibold">Import CSV / Bitwarden JSON</Text>
        <Text className="text-slate-600 dark:text-slate-500 text-xs mt-4 text-center">Preview before encryption</Text>
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        index={1}
        snapPoints={["80%"]}
        enablePanDownToClose
        backdropComponent={(backdrop) => (
          <BottomSheetBackdrop {...backdrop} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.75} />
        )}
        handleIndicatorStyle={{ backgroundColor: bottomSheetHandleIndicator(scheme) }}
        backgroundStyle={{
          backgroundColor: bottomSheetBackground(scheme),
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}>
        <BottomSheetView className="flex-1 px-6 pb-12">
          <Text className="text-slate-900 dark:text-slate-100 text-xl font-semibold mb-6">Masked preview</Text>
          <ImportPreviewList rows={previewRows} />
          <VaultButton
            label="Encrypt & stash"
            variant="danger"
            onPress={() => mergeImport(previewRows)}
            className="mt-12"
          />
        </BottomSheetView>
      </BottomSheetModal>
    </ScrollView>
  );
}
