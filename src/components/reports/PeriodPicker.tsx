import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

import type { BucketGranularity } from '@/db/repos/reportsRepo';

export type Period = 'day' | 'week' | 'month' | 'year';

export type PeriodRange = {
  from: number;
  to: number;
  bucket: BucketGranularity;
  label: string;
};

const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const rangeForPeriod = (period: Period, now: Date = new Date()): PeriodRange => {
  const today = startOfDay(now);
  switch (period) {
    case 'day': {
      return {
        from: today.getTime(),
        to: today.getTime() + 24 * 60 * 60 * 1000 - 1,
        bucket: 'day',
        label: 'Hoje',
      };
    }
    case 'week': {
      const day = today.getDay(); // 0 = Sun
      const start = new Date(today);
      start.setDate(today.getDate() - day);
      return {
        from: start.getTime(),
        to: start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1,
        bucket: 'day',
        label: 'Semana',
      };
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime() - 1;
      return { from: start.getTime(), to: end, bucket: 'day', label: 'Mês' };
    }
    case 'year': {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear() + 1, 0, 1).getTime() - 1;
      return { from: start.getTime(), to: end, bucket: 'month', label: 'Ano' };
    }
  }
};

type Props = {
  value: Period;
  onChange: (p: Period) => void;
};

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'year', label: 'Ano' },
];

export default function PeriodPicker({ value, onChange }: Props): JSX.Element {
  const items = useMemo(() => OPTIONS, []);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((o) => (
        <Chip
          key={o.value}
          selected={value === o.value}
          onPress={() => onChange(o.value)}
          style={styles.chip}
          testID={`period-${o.value}`}
        >
          {o.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { padding: 8, gap: 6 },
  chip: { marginRight: 6, minHeight: 48 },
});
