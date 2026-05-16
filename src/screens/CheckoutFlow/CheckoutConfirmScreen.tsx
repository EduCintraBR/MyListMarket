import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import CheckoutStepHeader from '@/components/CheckoutStepHeader';
import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ListasStackParamList, 'CheckoutConfirm'>;

export default function CheckoutConfirmScreen({ route, navigation }: Props): JSX.Element {
  const { listaId } = route.params;
  const items = useAppStore((s) => s.compraAtivaItems);
  const pendentes = items.filter((i) => i.status !== 'comprado');

  return (
    <View style={styles.root}>
      <CheckoutStepHeader step={1} label="Confirmar itens pendentes" />
      <Text variant="titleMedium" accessibilityRole="header">
        Você ainda tem {pendentes.length} {pendentes.length === 1 ? 'item' : 'itens'} sem marcar
      </Text>
      <View style={styles.list}>
        {pendentes.map((i) => (
          <Text key={i.id} style={styles.bullet}>
            • {i.produtoNome}
          </Text>
        ))}
      </View>
      <Text variant="bodyMedium" style={styles.help}>
        Tem certeza que quer concluir agora? Os itens não marcados ficarão pendentes.
      </Text>
      <View style={styles.actions}>
        <Button onPress={() => navigation.goBack()}>Voltar</Button>
        <Button mode="contained" onPress={() => navigation.navigate('CheckoutForm', { listaId })}>
          Continuar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  list: { gap: 4 },
  bullet: {},
  help: { marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 24 },
});
