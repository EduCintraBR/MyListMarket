import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

const pad2 = (n: number): string => String(n).padStart(2, '0');

const monthLabel = (date: Date): string => {
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${meses[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;
};

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

type Props = {
  value: string | null;
  onChange: (mes: string | null) => void;
  monthsBack?: number;
  now?: Date;
};

export default function MesFilterChips({
  value,
  onChange,
  monthsBack = 6,
  now = new Date(),
}: Props): JSX.Element {
  const months = useMemo(() => {
    const arr: { key: string; label: string }[] = [];
    for (let i = 0; i < monthsBack; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ key: monthKey(d), label: monthLabel(d) });
    }
    return arr;
  }, [now, monthsBack]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip
        selected={value === null}
        onPress={() => onChange(null)}
        style={styles.chip}
        testID="mes-todos"
      >
        Todos
      </Chip>
      {months.map((m) => (
        <Chip
          key={m.key}
          selected={value === m.key}
          onPress={() => onChange(m.key)}
          style={styles.chip}
          testID={`mes-${m.key}`}
        >
          {m.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { padding: 8, gap: 6 },
  chip: { marginRight: 6, minHeight: 48 },
});
