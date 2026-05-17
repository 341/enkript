import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { Pressable, Text } from 'react-native';

type ToastCtx = {
  show: (body: string) => void;
};

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function VaultCopyToastHost({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((body: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(body);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          entering={FadeInUp.duration(220)}
          exiting={FadeOut.duration(180)}
          pointerEvents="box-none"
          className="absolute bottom-36 left-4 right-4 rounded-xl bg-slate-100/95 dark:bg-navy-900/95 px-4 py-3 shadow-modal border border-slate-200 dark:border-white/5">
          <Text className="font-sans text-sm text-slate-800 dark:text-slate-200 pr-8">{toast}</Text>
          <Pressable accessibilityRole="button" onPress={() => setToast(null)} className="absolute right-3 top-3">
            <Text className="text-xs text-slate-500 dark:text-slate-400">✕</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useVaultCopyToast() {
  return useContext(ToastContext);
}
