import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CompraDetailScreen from '@/screens/CompraDetailScreen';
import HistoricoScreen from '@/screens/HistoricoScreen';

import type { HistoricoStackParamList } from './types';

const Stack = createNativeStackNavigator<HistoricoStackParamList>();

export default function HistoricoStack(): JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HistoricoHome"
        component={HistoricoScreen}
        options={{ title: 'Histórico' }}
      />
      <Stack.Screen
        name="CompraDetail"
        component={CompraDetailScreen}
        options={{ title: 'Detalhe' }}
      />
    </Stack.Navigator>
  );
}
