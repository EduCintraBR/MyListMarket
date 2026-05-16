import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CheckoutConfirmScreen from '@/screens/CheckoutFlow/CheckoutConfirmScreen';
import CheckoutDestinoScreen from '@/screens/CheckoutFlow/CheckoutDestinoScreen';
import CheckoutFormScreen from '@/screens/CheckoutFlow/CheckoutFormScreen';
import CheckoutFotoScreen from '@/screens/CheckoutFlow/CheckoutFotoScreen';
import CheckoutResumoScreen from '@/screens/CheckoutFlow/CheckoutResumoScreen';
import CompraModeScreen from '@/screens/CompraModeScreen';
import HomeListasScreen from '@/screens/HomeListasScreen';
import ListaDetailScreen from '@/screens/ListaDetailScreen';

import type { ListasStackParamList } from './types';

const Stack = createNativeStackNavigator<ListasStackParamList>();

export default function ListasStack(): JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeListas" component={HomeListasScreen} options={{ title: 'Listas' }} />
      <Stack.Screen
        name="ListaDetail"
        component={ListaDetailScreen}
        options={{ title: 'Lista' }}
      />
      <Stack.Screen
        name="CompraMode"
        component={CompraModeScreen}
        options={{ title: 'Em compra' }}
      />
      <Stack.Screen
        name="CheckoutConfirm"
        component={CheckoutConfirmScreen}
        options={{ title: 'Confirmar pendentes' }}
      />
      <Stack.Screen
        name="CheckoutForm"
        component={CheckoutFormScreen}
        options={{ title: 'Dados da compra' }}
      />
      <Stack.Screen
        name="CheckoutFoto"
        component={CheckoutFotoScreen}
        options={{ title: 'Foto do cupom' }}
      />
      <Stack.Screen
        name="CheckoutResumo"
        component={CheckoutResumoScreen}
        options={{ title: 'Resumo' }}
      />
      <Stack.Screen
        name="CheckoutDestino"
        component={CheckoutDestinoScreen}
        options={{ title: 'Pendentes', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
