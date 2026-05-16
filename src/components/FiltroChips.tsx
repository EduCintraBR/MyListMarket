import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

export type CompraFiltro = 'a_comprar' | 'comprado' | 'da_lista' | 'compra';

type Props = {
  selected: ReadonlySet<CompraFiltro>;
  onToggle: (f: CompraFiltro) => void;
};

const OPTIONS: { value: CompraFiltro; label: string }[] = [
  { value: 'a_comprar', label: 'A comprar' },
  { value: 'comprado', label: 'Comprados' },
  { value: 'da_lista', label: 'Da lista' },
  { value: 'compra', label: 'Adicionados' },
];

export default function FiltroChips({ selected, onToggle }: Props): JSX.Element {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {OPTIONS.map((o) => (
        <Chip
          key={o.value}
          selected={selected.has(o.value)}
          onPress={() => onToggle(o.value)}
          style={styles.chip}
          accessibilityLabel={`Filtro ${o.label}`}
          testID={`filtro-${o.value}`}
        >
          {o.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { padding: 8, gap: 8 },
  chip: { marginRight: 6, minHeight: 48 },
});
