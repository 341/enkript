import * as Clipboard from 'expo-clipboard';

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export async function copyWithAutoClear(label: string, value: string, clearAfterMs: number): Promise<void> {
  await Clipboard.setStringAsync(value);
  const prev = timers.get(label);
  if (prev) clearTimeout(prev);
  const t = setTimeout(async () => {
    timers.delete(label);
    const cur = await Clipboard.getStringAsync();
    if (cur === value) {
      await Clipboard.setStringAsync('');
    }
  }, clearAfterMs);
  timers.set(label, t);
}
