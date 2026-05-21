import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';

import RelatoriosScreen from '@/screens/RelatoriosScreen';
import type { AppTheme } from '@/theme';

import ConfigStack from './ConfigStack';
import HistoricoStack from './HistoricoStack';
import ListasStack from './ListasStack';
import type { RootTabsParamList } from './types';

const Tab = createBottomTabNavigator<RootTabsParamList>();

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TAB_ICONS: Record<keyof RootTabsParamList, { focused: IconName; unfocused: IconName }> = {
  ListasStack: { focused: 'format-list-checks', unfocused: 'format-list-bulleted' },
  HistoricoStack: { focused: 'history', unfocused: 'history' },
  Relatorios: { focused: 'chart-bar', unfocused: 'chart-bar-stacked' },
  ConfigStack: { focused: 'cog', unfocused: 'cog-outline' },
};

export default function RootTabs(): JSX.Element {
  const theme = useTheme<AppTheme>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <MaterialCommunityIcons
              name={focused ? icons.focused : icons.unfocused}
              color={color}
              size={size}
            />
          );
        },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.onSurface },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen
        name="ListasStack"
        component={ListasStack}
        options={{ headerShown: false, title: 'Listas' }}
      />
      <Tab.Screen
        name="HistoricoStack"
        component={HistoricoStack}
        options={{ headerShown: false, title: 'Histórico' }}
      />
      <Tab.Screen
        name="Relatorios"
        component={RelatoriosScreen}
        options={{ title: 'Relatórios' }}
      />
      <Tab.Screen
        name="ConfigStack"
        component={ConfigStack}
        options={{ headerShown: false, title: 'Config' }}
      />
    </Tab.Navigator>
  );
}
