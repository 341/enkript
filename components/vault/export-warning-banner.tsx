import { Text, View } from 'react-native';

export function ExportWarningBanner() {
  return (
    <View className="rounded-lg bg-rose-500/15 border border-rose-400/40 px-3 py-2 mb-3">
      <Text className="text-rose-900 dark:text-rose-200 text-sm leading-relaxed">
        This export is unencrypted plaintext. Protect the file and delete copies when finished.
      </Text>
    </View>
  );
}
