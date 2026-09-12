/**
 * Palette calme (rose / mauve) pour l’app de suivi du cycle.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  rose: '#C45C7A',
  roseDark: '#A34763',
  mauve: '#8B6B8A',
  blush: '#F8E8EE',
  cream: '#FDF6F8',
  card: '#FFFFFF',
  text: '#3D2A33',
  textSecondary: '#7A5B66',
  border: '#E8CDD6',
  error: '#B42318',
} as const;

export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.cream,
    backgroundElement: Palette.blush,
    backgroundSelected: '#F3D7E0',
    textSecondary: Palette.textSecondary,
  },
  dark: {
    text: '#FDF6F8',
    background: '#2A1C22',
    backgroundElement: '#3D2A33',
    backgroundSelected: '#4A3540',
    textSecondary: '#C9A8B2',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
