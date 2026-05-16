import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

import { formatBRL } from '@/lib/money';

type Props = {
  total: number;
  mercadoNome: string | null;
  onPickMercado: () => void;
};

export default function TotalParcialHeader({
  total,
  mercadoNome,
  onPickMercado,
}: Props): JSX.Element {
  return (
    <Surface style={styles.root} elevation={2}>
      <View style={styles.totalRow}>
        <Text variant="labelMedium">Total parcial</Text>
        <Text
          variant="displaySmall"
          accessibilityLabel={`Total parcial ${formatBRL(total)}`}
          accessibilityLiveRegion="polite"
          testID="total-parcial-text"
        >
          {formatBRL(total)}
        </Text>
      </View>
      <Button
        mode={mercadoNome ? 'outlined' : 'contained-tonal'}
        compact
        onPress={onPickMercado}
        accessibilityLabel="Escolher mercado"
        testID="pick-mercado-btn"
      >
        {mercadoNome ?? 'Escolher mercado'}
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8 },
  totalRow: { gap: 2 },
});
