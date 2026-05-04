import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

type Props = PropsWithChildren<{
  /** Square outer box — vector icons visually center more reliably inside a fixed box. */
  size: number;
}>;

/** Lucide/React Native SVG icons often skew optically vs flex alone; uniform box + center fixes tab bars / round buttons. */
export function CenteredIcon({ size, children }: Props) {
  return (
    <View pointerEvents="box-none" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}
