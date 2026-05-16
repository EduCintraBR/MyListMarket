import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

import type { FormaPagamento } from '@/lib/domain';

type Props = {
  value: FormaPagamento | null;
  onChange: (v: FormaPagamento) => void;
};

const OPTIONS: { value: FormaPagamento; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_debito', label: 'Débito' },
  { value: 'cartao_credito', label: 'Crédito' },
  { value: 'vale_alimentacao', label: 'Vale' },
];

export default function FormaPagamentoSelector({ value, onChange }: Props): JSX.Element {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {OPTIONS.map((o) => (
        <Chip
          key={o.value}
          selected={value === o.value}
          onPress={() => onChange(o.value)}
          style={styles.chip}
          accessibilityLabel={`Forma de pagamento ${o.label}`}
          testID={`pagamento-${o.value}`}
        >
          {o.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { padding: 4, gap: 6 },
  chip: { marginRight: 6, minHeight: 48 },
});
