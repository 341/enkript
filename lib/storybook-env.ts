/** True when running via `npm run storybook` (dedicated Storybook dev session). */
export const isStorybookSession =
  process.env.EXPO_PUBLIC_STORYBOOK === 'true' ||
  process.env.STORYBOOK_ENABLED === 'true';

/** Storybook route is reachable in dev or an explicit storybook session. */
export const canAccessStorybook = __DEV__ || isStorybookSession;
