import { Globe } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';

import { CenteredIcon } from '@/components/vault/centered-icon';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { faviconUrlForEntry } from '@/lib/favicon-url';
import { activityIndicatorTint } from '@/lib/ui-theme';

type Props = {
  url?: string;
  size?: number;
};

export function DomainFavicon({ url, size = 44 }: Props) {
  const scheme = useEffectiveColorScheme();
  const accent = activityIndicatorTint(scheme);
  const faviconUri = useMemo(() => faviconUrlForEntry(url, 64), [url]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [faviconUri]);

  const showImage = faviconUri != null && !failed;

  return (
    <View
      className="h-11 w-11 shrink-0 rounded-lg bg-indigo-500/15 border border-indigo-500/25 dark:border-white/10 overflow-hidden"
      style={{ width: size, height: size }}>
      {showImage ? (
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri: faviconUri }}
          style={{ width: size, height: size }}
          resizeMode="contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <CenteredIcon size={size}>
          <Globe color={accent} size={size * 0.5} strokeWidth={2.25} />
        </CenteredIcon>
      )}
    </View>
  );
}
