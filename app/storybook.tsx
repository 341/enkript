import { Redirect } from 'expo-router';

import StorybookRoot from '../.rnstorybook';
import { canAccessStorybook } from '@/lib/storybook-env';

export default function StorybookScreen() {
  if (!canAccessStorybook) {
    return <Redirect href="/" />;
  }
  return <StorybookRoot />;
}
