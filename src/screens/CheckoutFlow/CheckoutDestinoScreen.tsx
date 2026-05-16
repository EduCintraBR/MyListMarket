import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, RadioButton, Text } from 'react-native-paper';

import CheckoutStepHeader from '@/components/CheckoutStepHeader';
import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Destino = 'descartar' | 'mover';

type Props = NativeStackScreenProps<ListasStackParamList, 'CheckoutDestino'>;

export default function CheckoutDestinoScreen({ route, navigation }: Props): JSX.Element {
  const { listaId } = route.params;
  const [destino, setDestino] = useState<Destino>('descartar');
  const clonar = useAppStore((s) => s.clonarPendentesDraft);

  const handleConfirm = (): void => {
    if (destino === 'mover') {
      clonar(listaId);
    }
    navigation.popToTop();
  };

  return (
    <View style={styles.root}>
      <CheckoutStepHeader step={5} label="Destino dos pendentes" />
      <Text variant="titleMedium" accessibilityRole="header">
        Itens não comprados
      </Text>
      <Text variant="bodyMedium" style={styles.help}>
        O que fazer com os itens que não foram marcados?
      </Text>

      <RadioButton.Group value={destino} onValueChange={(v) => setDestino(v as Destino)}>
        <RadioButton.Item label="Descartar e encerrar lista" value="descartar" />
        <RadioButton.Item label="Mover para uma nova lista" value="mover" />
      </RadioButton.Group>

      <View style={styles.gap} />
      <Button mode="contained" onPress={handleConfirm} testID="destino-confirm">
        Confirmar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  help: { marginBottom: 8 },
  gap: { height: 16 },
});
