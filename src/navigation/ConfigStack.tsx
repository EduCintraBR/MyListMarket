import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CatalogoScreen from '@/screens/CatalogoScreen';
import ConfigScreen from '@/screens/ConfigScreen';
import EditMercadoScreen from '@/screens/EditMercadoScreen';
import EditProdutoScreen from '@/screens/EditProdutoScreen';
import MercadosScreen from '@/screens/MercadosScreen';
import SobreScreen from '@/screens/SobreScreen';

import type { ConfigStackParamList } from './types';

const Stack = createNativeStackNavigator<ConfigStackParamList>();

export default function ConfigStack(): JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConfigHome"
        component={ConfigScreen}
        options={{ title: 'Configurações' }}
      />
      <Stack.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Catálogo' }} />
      <Stack.Screen
        name="EditProduto"
        component={EditProdutoScreen}
        options={{ title: 'Produto' }}
      />
      <Stack.Screen name="Mercados" component={MercadosScreen} options={{ title: 'Mercados' }} />
      <Stack.Screen
        name="EditMercado"
        component={EditMercadoScreen}
        options={{ title: 'Mercado' }}
      />
      <Stack.Screen name="Sobre" component={SobreScreen} options={{ title: 'Sobre' }} />
    </Stack.Navigator>
  );
}
