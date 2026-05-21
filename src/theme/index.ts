import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32',
    secondary: '#FB8C00',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#81C784',
    secondary: '#FFB74D',
  },
};

export const navigationLightTheme: NavTheme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.onSurface,
    border: lightTheme.colors.outlineVariant,
    notification: lightTheme.colors.error,
  },
};

export const navigationDarkTheme: NavTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: darkTheme.colors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.onSurface,
    border: darkTheme.colors.outlineVariant,
    notification: darkTheme.colors.error,
  },
};

export type AppTheme = typeof lightTheme;
