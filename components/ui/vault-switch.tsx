import { Switch, type SwitchProps } from 'react-native';

import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import {
  switchThumbColor,
  switchTrackColorOff,
  switchTrackColorOn,
} from '@/lib/ui-theme';

type Props = SwitchProps;

export function VaultSwitch(props: Props) {
  const scheme = useEffectiveColorScheme();
  return (
    <Switch
      trackColor={{ false: switchTrackColorOff(scheme), true: switchTrackColorOn }}
      thumbColor={switchThumbColor}
      {...props}
    />
  );
}
