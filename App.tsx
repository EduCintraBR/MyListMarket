import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { runMigrations } from '@/db/runMigrations';
import { log } from '@/lib/log';
import RootTabs from '@/navigation/RootTabs';
import { useAppStore } from '@/state';
import { bootstrapStores } from '@/state/bootstrap';
import {
  darkTheme,
  lightTheme,
  navigationDarkTheme,
  navigationLightTheme,
} from '@/theme';

export default function App(): JSX.Element | null {
  const [ready, setReady] = useState(false);
  const scheme = useColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);

  useEffect(() => {
    try {
      runMigrations();
      bootstrapStores();
      setReady(true);
    } catch (e) {
      log.error('[App] bootstrap failed', e);
    }
  }, []);

  if (!ready) return null;

  const effectiveScheme = themeMode === 'system' ? scheme : themeMode;
  const isDark = effectiveScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? navigationDarkTheme : navigationLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={navTheme}>
          <RootTabs />
        </NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
