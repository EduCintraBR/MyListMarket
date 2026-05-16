import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import RelatoriosScreen from '@/screens/RelatoriosScreen';

import ConfigStack from './ConfigStack';
import HistoricoStack from './HistoricoStack';
import ListasStack from './ListasStack';
import type { RootTabsParamList } from './types';

const Tab = createBottomTabNavigator<RootTabsParamList>();

export default function RootTabs(): JSX.Element {
  return (
    <Tab.Navigator>
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
